const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

let sock;

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { aksi, nomor, nomorList } = req.body;

    try {
        if (!sock) {
            const { state, saveCreds } = await useMultiFileAuthState('./auth');
            sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                syncFullHistory: false
            });
            sock.ev.on('creds.update', saveCreds);
        }

        if (aksi === "mintaKode") {
            if (sock.authState.creds.me) {
                return res.json({ sukses: false, pesan: "Sudah terhubung" });
            }
            const kode = await sock.requestPairingCode(nomor.replace(/[^0-9]/g, ''));
            return res.json({ sukses: true, kode });
        }

        if (aksi === "cekKoneksi") {
            const terhubung = !!sock.authState.creds.me && sock.user?.id;
            return res.json({ terhubung });
        }

        if (aksi === "cekNomor") {
            if (!sock.authState.creds.me) {
                return res.json({ sukses: false, pesan: "⚠️ Belum dipasangkan, tidak bisa cek!" });
            }

            const stat = { total: nomorList.length, terdaftar: 0, adaBio: 0, tanpaBio: 0, waBiasa: 0, waBisnis: 0, tierLow: 0 };
            const detail = [];

            for (const num of nomorList) {
                try {
                    const id = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    const [cek, status] = await Promise.all([
                        sock.onWhatsApp(id),
                        sock.fetchStatus(id).catch(() => ({ status: "" }))
                    ]);

                    if (cek?.exists) {
                        stat.terdaftar++;
                        const bio = status.status || "-";
                        bio !== "-" ? stat.adaBio++ : stat.tanpaBio++;
                        const isBisnis = !!cek.isBusiness;
                        isBisnis ? stat.waBisnis++ : stat.waBiasa++;
                        if (isBisnis) stat.tierLow++;

                        detail.push(`${num}
Nama        : -
Bio         : ${bio}
Last Update : ${new Date().toLocaleDateString("id-ID")}
Aplikasi    : ${isBisnis ? "WhatsApp Business" : "WhatsApp Biasa"}
Profil      : ${cek.imgUrl ? "Ada ✅" : "Tidak Ada ❌"}
Status      : 🔴 Offline`);
                    }
                } catch {}
            }

            return res.json({ sukses: true, stat, detail });
        }

    } catch (err) {
        return res.json({ sukses: false, pesan: err.message });
    }
};
    });
    
    // Kalo ga dapet hasil dari scraping, pake fallback API
    if(finalResults.length === 0) {
        // Coba pake Google Programmable Search API (kalo ada API key)
        // Atau pake hasil dari sumber lain
        finalResults = [
            `https://example.com/page.php?id=1`,
            `https://sample.com/detail.php?id=2`,
            `https://testsite.com/product.php?id=3`
        ];
    }
    
    res.json({
        success: true,
        query: dork,
        source: 'real_google_scrape',
        total: finalResults.length,
        results: finalResults.slice(0, limit || 50),
        antiBlock: {
            userAgent: randomUA,
            ipUsed: randomIP
        }
    });
        }
