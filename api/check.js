const {
  default: makeWASocket,
  useMemoryAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const retry = require('async-retry');

let sock;

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  const { aksi, nomor, nomor_list } = req.body;

  try {
    // Pakai penyimpanan di memori (lebih cocok untuk Vercel)
    if (!sock) {
      const { state, saveCreds } = useMemoryAuthState();
      sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        syncFullHistory: false,
        browser: ['Ubuntu', 'Desktop', 'Chrome'],
        connectTimeoutMs: 25000,
        retryRequestDelayMs: 1500
      });

      sock.ev.on('creds.update', saveCreds);
      sock.ev.on('connection.update', (up) => {
        if (up.qr) sock.qr = up.qr;
        if (up.connection === 'close') sock = undefined;
      });
    }

    // 🔑 Minta Kode Pairing
    if (aksi === "dapatkan_kode") {
      if (!nomor) return res.json({ berhasil: false, pesan: "Isi nomor +62..." });
      const nomorBersih = nomor.replace(/\D/g, '');

      const kode = await retry(async () => {
        await sock.waitForConnectionUpdate((u) => !!u.connected || !!u.isNewLogin);
        return await sock.requestPairingCode(nomorBersih);
      }, { retries: 3, factor: 1.5 });

      return res.json({ berhasil: true, kode });
    }

    // ✅ Cek Status Koneksi
    if (aksi === "cek_koneksi") {
      const terhubung = !!(sock?.authState?.creds?.me && sock?.user?.id);
      return res.json({ terhubung });
    }

    // 📊 Proses Cek Nomor
    if (aksi === "proses_cek") {
      if (!sock?.authState?.creds?.me) {
        return res.json({ berhasil: false, pesan: "⚠️ Belum tertaut, minta kode dulu!" });
      }

      const stat = { total: nomor_list.length, terdaftar: 0, bio_ada: 0, bio_tidak: 0, biasa: 0, bisnis: 0 };
      const detail = [];

      for (const n of nomor_list) {
        try {
          const id = n.replace(/\D/g, '') + '@s.whatsapp.net';
          const cek = await sock.onWhatsApp(id);
          if (!cek[0]?.exists) continue;

          stat.terdaftar++;
          const bioData = await sock.fetchStatus(id).catch(() => ({ status: "-" }));
          const bio = bioData.status || "-";
          bio !== "-" ? stat.bio_ada++ : stat.bio_tidak++;

          const isBisnis = !!cek[0].isBusiness;
          isBisnis ? stat.bisnis++ : stat.biasa++;

          detail.push(`${n}
Nama        : -
Bio         : ${bio}
Last Update : ${new Date().toLocaleDateString("id-ID")}
Aplikasi    : ${isBisnis ? "WhatsApp Business" : "WhatsApp Biasa"}
Profil      : ${cek[0].imgUrl ? "Ada ✅" : "Tidak Ada ❌"}
Status      : 🔴 Offline`);
        } catch {}
      }

      return res.json({ berhasil: true, stat, detail });
    }

  } catch (err) {
    sock = undefined;
    return res.json({ berhasil: false, pesan: `Gagal: ${err.message}` });
  }
};
