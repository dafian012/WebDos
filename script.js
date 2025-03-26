document.getElementById("startButton").addEventListener("click", function() {
    let targetUrl = document.getElementById("targetUrl").value;
    let method = document.getElementById("attackMethod").value;
    let duration = document.getElementById("duration").value;
    let concurrent = document.getElementById("concurrent").value;
    let status = document.getElementById("status");

    if (!targetUrl) {
        alert("Masukkan URL target!");
        return;
    }

    status.innerText = "Memulai serangan...";

    fetch("https://your-vercel-backend.vercel.app/api/attack", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl, method, duration, concurrent })
    })
    .then(response => response.json())
    .then(data => status.innerText = data.message)
    .catch(error => status.innerText = "Gagal memulai serangan!");
});
