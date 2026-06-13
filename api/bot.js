const { Telegraf } = require('telegraf');
const { default: makeWASocket, useMemoryAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

let bot, sock, botToken;

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { aksi, token, nomor, list } = req.body || {};

    try {
        // Set Token & Inisialisasi
        if (aksi === "set_token") {
            botToken = token;
            if (!bot) bot = new Telegraf(botToken);[[__LINK_ICON]](https://www.npmjs.com/package/telegram-bot-kit?f_link_type=f_linkinlinenote&flow_extra=eyJkb2NfcG9zaXRpb24iOjAsImRvY19pZCI6IjczMjYwODQ3ZGM4MGU4ZjYtNjM3OGI3NGY3MDg2MDU2MiIsImlubGluZV9kaXNwbGF5X3Bvc2l0aW9uIjowfQ%3D%3D "[__LINK_ICON]")

            // Inisialisasi WA
            const { state, saveCreds } = useMemoryAuthState();
            sock = makeWASocket({
                auth: state, logger: pino({ level: 'silent' }),
                browser: ['Ubuntu', 'Chrome', '120'], printQRInTerminal: false
            });
            sock.ev.on('creds.update', saveCreds);

            const kode = await sock.requestPairingCode(nomor.replace(/\D/g, ''));
            return res.json({ sukses: true, kode });
        }

        // Cek Nomor WA
        if (aksi === "cek_nomor") {
            if (!sock?.authState?.creds?.me)
                return res.json({ sukses: false, pesan: "⚠️ Belum dipasangkan!" });

            const stat = { total: list.length, terdaftar: 0, bio_ada: 0, bio_tidak: 0, biasa: 0, bisnis: 0 };
            const detail = [];

            for (const n of list) {
                const id = n.replace(/\D/g, '') + '@s.whatsapp.net';
                const cek = await sock.onWhatsApp(id);
                if (!cek[0]?.exists) continue;

                stat.terdaftar++;
                const bio = (await sock.fetchStatus(id).catch(() => ({ status: "-" }))).status || "-";
                bio !== "-" ? stat.bio_ada++ : stat.bio_tidak++;

                const isBisnis = !!cek[0].isBusiness;
                isBisnis ? stat.bisnis++ : stat.biasa++;

                detail.push(`${n}
Nama        : -
Bio         : ${bio}
Aplikasi    : ${isBisnis ? "WhatsApp Business" : "WA Biasa"}
Profil      : ${cek[0].imgUrl ? "Ada ✅" : "Tidak Ada ❌"}
Status      : 🔴 Offline`);
            }

            // Kirim hasil ke Bot Telegram juga
            if (bot) bot.telegram.sendMessage(req.body.chatId || 0, "✅ Selesai cek " + stat.terdaftar + " nomor");[[__LINK_ICON]](https://github.com/vladzima/telegram-webhook-bot?f_link_type=f_linkinlinenote&flow_extra=eyJpbmxpbmVfZGlzcGxheV9wb3NpdGlvbiI6MCwiZG9jX3Bvc2l0aW9uIjowLCJkb2NfaWQiOiIyMTc5M2NhMTRkNTExOWRkLTQ2N2YwNDdlZTUxMmMzZDcifQ%3D%3D "[__LINK_ICON]")
            return res.json({ sukses: true, stat, detail });
        }

    } catch (err) {
        return res.json({ sukses: false, pesan: err.message });
    }
};
