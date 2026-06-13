const {
  default: makeWASocket,
  useMemoryAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');

let sock = null;

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const { aksi, nomor_input, daftar_nomor } = req.body || {};

  try {
    const { version } = await fetchLatestBaileysVersion();

    if (!sock) {
      const { state, saveCreds } = useMemoryAuthState();
      sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        syncFullHistory: false,
        browser: ['Ubuntu', 'Chrome', '125.0.0.0'],
        connectTimeoutMs: 25000,
        retryRequestDelayMs: 1500
      });

      sock.ev.on('creds.update', saveCreds);
      sock.ev.on('connection.update', (up) => {
        if (up.connection === 'close') sock = null;
      });
    }

    // ✅ Perintah /pair 628xxxx
    if (aksi === "pairing") {
      if (sock.authState.creds.me) {
        return res.json({ sukses: true, pesan: "✅ Sudah terhubung, siap cek!" });
      }

      const nomorBersih = nomor_input.replace(/\D/g, '');
      if (!nomorBersih.startsWith('62')) {
        return res.json({ sukses: false, pesan: "❌ Gunakan format: /pair 628xxxx" });
      }

      const kode = await sock.requestPairingCode(nomorBersih);
      return res.json({ sukses: true, kode: kode, pesan: "Masukkan kode ini di WA > Perangkat Tertaut" });
    }

    // ✅ Cek status koneksi
    if (aksi === "cek_status") {
      const terhubung = !!(sock?.authState?.creds?.me && sock?.user?.id);
      return res.json({ terhubung });
    }

    // ✅ Proses cek nomor
    if (aksi === "proses_cek") {
      if (!sock?.authState?.creds?.me) {
        return res.json({ sukses: false, pesan: "⚠️ Belum terhubung! Ketik /pair 628xxxx dulu" });
      }

      const stat = { total: 0, terdaftar: 0, bio_ada: 0, bio_tidak: 0, biasa: 0, bisnis: 0 };
      const detail = [];
      stat.total = daftar_nomor.length;

      for (const n of daftar_nomor) {
        try {
          const id = n.replace(/\D/g, '') + '@s.whatsapp.net';
          const cek = await sock.onWhatsApp(id);

          if (cek[0]?.exists) {
            stat.terdaftar++;
            const info = await sock.fetchStatus(id).catch(() => ({ status: "-" }));
            const bio = info.status || "-";

            bio !== "-" ? stat.bio_ada++ : stat.bio_tidak++;
            const isBisnis = !!cek[0].isBusiness;
            isBisnis ? stat.bisnis++ : stat.biasa++;

            detail.push(`${n}
Nama        : -
Bio         : ${bio}
Last Update : ${new Date().toLocaleDateString('id-ID')}
Aplikasi    : ${isBisnis ? "WhatsApp Business" : "WhatsApp Biasa"}
Profil      : ${cek[0].imgUrl ? "Ada ✅" : "Tidak Ada ❌"}
Status      : 🔴 Offline`);
          }
        } catch {}
      }

      return res.json({ sukses: true, stat, detail });
    }

  } catch (err) {
    sock = null;
    return res.json({ sukses: false, pesan: `❌ Error: ${err.message}` });
  }
};
