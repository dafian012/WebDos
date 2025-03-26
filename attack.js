<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minecraft DoS Tool</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <h1>Minecraft DoS Tool</h1>

        <label>Server IP:</label>
        <input type="text" id="serverIP" placeholder="Contoh: 127.0.0.1">

        <label>Jumlah Request:</label>
        <input type="number" id="requestCount" placeholder="1000">

        <label>Metode Serangan:</label>
        <select id="attackMethod">
            <option value="ping">Ping Flood</option>
            <option value="tcp">TCP Flood</option>
            <option value="udp">UDP Flood</option>
            <option value="bot">Bot Spam</option>
        </select>

        <button onclick="startAttack()">Start Attack</button>
        <button onclick="stopAttack()">Stop Attack</button>

        <div id="status">Status: Ready</div>

        <canvas id="attackChart"></canvas>
    </div>

    <script src="attack.js"></script>
</body>
</html>
