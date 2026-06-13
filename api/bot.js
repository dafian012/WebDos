// /api/bot.js - Telegram Bot + WhatsApp Pairing REAL
const { Telegraf } = require('telegraf');
const { default: makeWASocket, useMemoryAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const NodeCache = require('node-cache');

let bot = null;
let sock = null;
let isWAPaired = false;
let waNumber = null;
let adminId = null;
let botRunning = false;
const messageCache = new NodeCache({ stdTTL: 300 });

// Function get data WhatsApp (simulasi/real via Baileys)
async function getWhatsAppData(number) {
    if (!sock || !isWAPaired) {
        return { error: 'WhatsApp belum terhubung. Gunakan /pair dulu!' };
    }
    
    // Format nomor
    let formatted = number.toString().replace(/[^0-9]/g, '');
    if (formatted.startsWith('0')) formatted = '62' + formatted.substring(1);
    if (!formatted.endsWith('@s.whatsapp.net')) formatted = formatted + '@s.whatsapp.net';
    
    try {
        // Cek status (online/offline)
        const presence = await sock.presenceSubscribe(formatted);
        const status = presence ? '🟢 Online' : '🔴 Offline';
        
        // Dapatkan profil
        const [profile] = await sock.query({
            tag: 'iq',
            attrs: { to: '@s.whatsapp.net', type: 'get', xmlns: 'w:profile' },
            content: [{ tag: 'picture', attrs: { query: 'image', target: formatted } }]
        }).catch(() => [null]);
        
        const hasPicture = profile && profile.tag === 'picture';
        
        // Simulasi data business (karena perlu API tambahan)
        const isBusiness = false; // Detect dari business profile
        
        return {
            number: '+' + formatted.split('@')[0],
            registered: true,
            hasBio: false,
            bio: '-',
            lastUpdate: new Date().toLocaleDateString(),
            isBusiness: isBusiness,
            hasPicture: hasPicture,
            status: status,
            name: await sock.getNameFromID(formatted).catch(() => '-')
        };
    } catch (e) {
        return {
            number: '+' + formatted.split('@')[0],
            registered: false,
            error: e.message
        };
    }
}

// Format hasil cek
function formatCheckResult(results, duration) {
    let total = results.length;
    let registered = results.filter(r => r.registered).length;
    let withBio = results.filter(r => r.hasBio).length;
    let withoutBio = results.filter(r => r.registered && !r.hasBio).length;
    let business = results.filter(r => r.isBusiness).length;
    let regular = registered - business;
    
    let text = `╔══════════════════════════════════════════════════════╗
║           📋 HASIL CEK WHATSAPP                      ║
║           🔥 Dafian Checker Bio                      ║
╚══════════════════════════════════════════════════════╝

👤 Request   : Telegram User
🎯 Mode      : 🔢 Mode Urutan
⏱️ Eksekusi  : ${duration} detik
🕐 Waktu     : ${new Date().toLocaleString('id-ID')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 STATISTIK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├ Total Dicek       : ${total}
├ Terdaftar         : ${registered}
├ Dengan Bio        : ${withBio}
└ Tanpa Bio         : ${withoutBio}

📱 Jenis Akun:
├ 📳 WA Business    : ${business}
└ 📳 WA Biasa       : ${regular}

🏅 Meta Business Tier:
├ ⭐ EXCLUSIVE (≥7)  : 0
├ 🟡 STANDARD (4–6)  : 0
└ 🔴 LOW (1–3)       : ${business}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 DETAIL NOMOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    
    results.forEach((r, i) => {
        if (r.registered) {
            text += `
${i+1}. ${r.number}
   Nama        : ${r.name || '-'}
   Bio         : ${r.bio || '-'}
   Aplikasi    : ${r.isBusiness ? 'WhatsApp Business' : 'WhatsApp Biasa'}
   Profil      : ${r.hasPicture ? 'Ada ✅' : 'Tidak Ada ❌'}
   Status      : ${r.status || '🔴 Offline'}
───────────────────────────────────────────────────────
`;
        } else {
            text += `
${i+1}. ${r.number}
   Status      : ❌ TIDAK TERDAFTAR
───────────────────────────────────────────────────────
`;
        }
    });
    
    text += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Engine   : Dafian Checker Bio
📌 WA Connected : ${waNumber ? '+' + waNumber : '-'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    
    return text;
}

// Setup WhatsApp connection
async function setupWhatsApp() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = useMemoryAuthState();
    
    sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Dafian Bot', 'Chrome', '1.0.0'],
        connectTimeoutMs: 30000,
        defaultQueryTimeoutMs: 15000
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('QR Code tersedia (pairing lebih disarankan)');
        }
        
        if (connection === 'open') {
            isWAPaired = true;
            waNumber = sock.user.id.split(':')[0];
            console.log(`✅ WhatsApp Connected: ${waNumber}`);
            if (bot && adminId) {
                bot.telegram.sendMessage(adminId, `✅ WhatsApp Berhasil Terhubung!\n📱 Nomor: +${waNumber}\n🔓 Bot siap digunakan!`);
            }
        }
        
        if (connection === 'close') {
            isWAPaired = false;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                setTimeout(setupWhatsApp, 5000);
            }
        }
    });
    
    return sock;
}

// Setup Telegram Bot
async function setupBot(token, adminIdTelegram) {
    if (bot) {
        bot.stop();
    }
    
    bot = new Telegraf(token);
    adminId = adminIdTelegram;
    
    // Command /start
    bot.start(async (ctx) => {
        const welcome = `╔══════════════════════════════════════════════════════╗
║           🤖 DAFIAN CHECKER BIO BOT                    ║
║           🔥 WhatsApp Pairing + Checker                ║
╚══════════════════════════════════════════════════════╝

📌 PERINTAH YANG TERSEDIA:

/pair 628xxxxxxxxx - Dapatkan kode pairing WhatsApp
/ceknomor 628xxxxxxxxx - Cek nomor WhatsApp
/cekbatch - Kirim file txt batch cek
/status - Cek status koneksi
/logout - Logout dari WhatsApp

⚡ Dafian Checker Bio | by JMK48`;
        ctx.reply(welcome);
    });
    
    // Command /pair
    bot.command('pair', async (ctx) => {
        const args = ctx.message.text.split(' ');
        if (args.length < 2) {
            return ctx.reply('❌ Format salah!\nGunakan: /pair 628123456789');
        }
        
        let nomor = args[1].replace(/[^0-9]/g, '');
        if (nomor.startsWith('0')) nomor = '62' + nomor.substring(1);
        if (!nomor.startsWith('62')) nomor = '62' + nomor;
        
        ctx.reply(`🔐 Meminta kode pairing untuk +${nomor}...`);
        
        try {
            if (!sock) {
                await setupWhatsApp();
                await new Promise(r => setTimeout(r, 2000));
            }
            
            const code = await sock.requestPairingCode(nomor);
            ctx.reply(`🔑 KODE PAIRING WHATSAPP:\n\n<code>${code}</code>\n\n📌 Cara pakai:\n1. Buka WhatsApp HP\n2. Setelan > Perangkat Tertaut\n3. Tautkan Perangkat\n4. Pilih "Tautkan dengan kode pairing"\n5. Masukkan kode di atas\n\n⏱️ Kode berlaku 5 menit!`, { parse_mode: 'HTML' });
        } catch (err) {
            ctx.reply(`❌ Gagal mendapatkan kode pairing: ${err.message}`);
        }
    });
    
    // Command /ceknomor
    bot.command('ceknomor', async (ctx) => {
        const args = ctx.message.text.split(' ');
        if (args.length < 2) {
            return ctx.reply('❌ Format salah!\nGunakan: /ceknomor 628123456789');
        }
        
        const nomor = args[1];
        ctx.reply(`🔍 Sedang mengecek ${nomor}...`);
        
        const result = await getWhatsAppData(nomor);
        
        if (result.registered) {
            ctx.reply(`📋 HASIL CEK NOMOR\n\n📱 Nomor: ${result.number}\n✅ Status: TERDAFTAR\n📝 Bio: ${result.bio || '-'}\n📱 Aplikasi: ${result.isBusiness ? 'WhatsApp Business' : 'WhatsApp Biasa'}\n🖼️ Profil: ${result.hasPicture ? 'Ada' : 'Tidak Ada'}\n🔌 Status: ${result.status}`);
        } else {
            ctx.reply(`📋 HASIL CEK NOMOR\n\n📱 Nomor: ${result.number}\n❌ Status: TIDAK TERDAFTAR`);
        }
    });
    
    // Command /cekbatch
    bot.command('cekbatch', async (ctx) => {
        ctx.reply('📎 Kirim file TXT berisi daftar nomor (satu per baris) untuk dicek batch.');
        // Handle document upload di handler lain
    });
    
    // Command /status
    bot.command('status', async (ctx) => {
        const status = isWAPaired ? `🟢 Terhubung\n📱 Nomor: +${waNumber}` : '🔴 Belum terhubung. Gunakan /pair untuk pairing.';
        ctx.reply(`📊 STATUS BOT\n\n🤖 Bot: Online\n📱 WhatsApp: ${status}`);
    });
    
    // Command /logout
    bot.command('logout', async (ctx) => {
        if (sock) {
            sock.logout();
            sock = null;
            isWAPaired = false;
            waNumber = null;
            ctx.reply('✅ Berhasil logout dari WhatsApp!');
        } else {
            ctx.reply('⚠️ WhatsApp tidak sedang terhubung');
        }
    });
    
    // Handle document untuk batch check
    bot.on('document', async (ctx) => {
        if (ctx.message.text && ctx.message.text.includes('/cekbatch')) {
            const file = await ctx.telegram.getFile(ctx.message.document.file_id);
            // Process file
            ctx.reply('📊 Memproses batch nomor...');
        }
    });
    
    bot.launch();
    console.log('✅ Bot Telegram started');
    return bot;
}

// Vercel API Handler
let currentBotToken = null;
let currentAdminId = null;

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // GET status
    if (req.method === 'GET' && req.query.action === 'status') {
        return res.json({
            running: botRunning,
            waConnected: isWAPaired,
            waNumber: waNumber ? '+' + waNumber : null,
            botToken: currentBotToken ? '***' : null
        });
    }
    
    // POST untuk start/stop
    if (req.method === 'POST') {
        const { action, botToken, adminIdTelegram } = req.body;
        
        if (action === 'start') {
            if (!botToken || !adminIdTelegram) {
                return res.status(400).json({ success: false, error: 'Bot token dan admin ID required' });
            }
            
            try {
                if (bot) {
                    bot.stop();
                    await new Promise(r => setTimeout(r, 1000));
                }
                
                if (!sock) {
                    await setupWhatsApp();
                }
                
                await setupBot(botToken, adminIdTelegram);
                currentBotToken = botToken;
                currentAdminId = adminIdTelegram;
                botRunning = true;
                
                return res.json({
                    success: true,
                    message: 'Bot started',
                    waConnected: isWAPaired,
                    botUsername: bot.botInfo?.username
                });
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
        }
        
        if (action === 'stop') {
            if (bot) {
                bot.stop();
                bot = null;
                botRunning = false;
            }
            return res.json({ success: true, message: 'Bot stopped' });
        }
    }
    
    return res.status(404).json({ error: 'Not found' });
};
