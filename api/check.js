const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

let koneksi;

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { aksi, nomor, nomor_list } = req.body;

    try {
        if (!koneksi) {
            const { state, saveCreds } = await useMultiFileAuthState('./simpan_data');
            koneksi = makeWASocket({
                auth: state,
                logger: pino({ level: 'silent' }),
                syncFullHistory: false,
                printQRInTerminal: false
            });
            koneksi.ev.on('creds.update', saveCreds);
        }

        if (aksi === "dapatkan_kode") {
            if (koneksi.authState.creds.me) {
                return res.json({ berhasil: false, pesan: "Sudah terhubung, gunakan saja" });
            }
            const bersih = nomor.replace(/\D/g, '');
            const kode = await koneksi.requestPairingCode(bersih);
            return res.json({ berhasil: true, kode: kode });
        }

        if (aksi === "cek_koneksi") {
            const siap = !!(koneksi.authState.creds.me && koneksi.user?.id);
            return res.json({ terhubung: siap });
        }

        if (aksi === "proses_cek") {
            if (!koneksi.authState.creds.me) {
                return res.json({ berhasil: false, pesan: "⚠️ Belum dipasangkan!" });
            }

            const stat = { total: nomor_list.length, terdaftar:0, bio_ada:0, bio_tidak:0, biasa:0, bisnis:0 };
            const detail = [];

            for (const n of nomor_list) {
                try {
                    const id = n.replace(/\D/g, '') + '@s.whatsapp.net';
                    const cekAda = await koneksi.onWhatsApp(id);

                    if (cekAda[0]?.exists) {
                        stat.terdaftar++;
                        const infoBio = await koneksi.fetchStatus(id).catch(() => ({ status: "-" }));
                        const bio = infoBio.status || "-";
                        bio !== "-" ? stat.bio_ada++ : stat.bio_tidak++;

                        const isBisnis = !!cekAda[0].isBusiness;
                        isBisnis ? stat.bisnis++ : stat.biasa++;

                        detail.push(`${n}
Nama        : -
Bio         : ${bio}
Aplikasi    : ${isBisnis ? "WhatsApp Business" : "WhatsApp Biasa"}
Profil      : ${cekAda[0].imgUrl ? "Ada ✅" : "Tidak Ada ❌"}
Status      : 🔴 Offline`);
                    }
                } catch {}
            }

            return res.json({ berhasil: true, stat: stat, detail: detail });
        }

    } catch (err) {
        return res.json({ berhasil: false, pesan: err.message });
    }
};
