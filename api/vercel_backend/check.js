// /api/check.js - Check WhatsApp Number
module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { numbers } = req.body;
    
    // Simulasi hasil (karena butuh WA connection real)
    const results = numbers.map(num => ({
        number: num,
        registered: Math.random() > 0.5,
        hasBio: Math.random() > 0.6,
        isBusiness: Math.random() > 0.8,
        name: Math.random() > 0.7 ? 'User Name' : '-',
        bio: Math.random() > 0.7 ? 'Bio sample text...' : '-'
    }));
    
    res.json({ success: true, results: results });
};
