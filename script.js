document.getElementById('startGetTest').addEventListener('click', () => {
    fetch('/api/stress-test')
        .then(response => response.text())
        .then(data => document.getElementById('status').innerText = data)
        .catch(error => document.getElementById('status').innerText = "Gagal melakukan uji beban (GET).");
});

document.getElementById('startPostTest').addEventListener('click', () => {
    fetch('/api/stress-test-post', { method: 'POST' })
        .then(response => response.text())
        .then(data => document.getElementById('status').innerText = data)
        .catch(error => document.getElementById('status').innerText = "Gagal melakukan uji beban (POST).");
});

document.getElementById('startUdpTest').addEventListener('click', () => {
    fetch('/api/udp-flood')
        .then(response => response.text())
        .then(data => document.getElementById('status').innerText = data)
        .catch(error => document.getElementById('status').innerText = "Gagal melakukan uji beban (UDP Flood).");
});

document.getElementById('pingTest').addEventListener('click', () => {
    fetch('/api/ping')
        .then(response => response.text())
        .then(data => document.getElementById('pingStatus').innerText = data)
        .catch(error => document.getElementById('pingStatus').innerText = "Server tidak merespons.");
});

document.getElementById('checkStats').addEventListener('click', () => {
    fetch('/api/stats')
        .then(response => response.text())
        .then(data => document.getElementById('stats').innerText = data)
        .catch(error => document.getElementById('stats').innerText = "Gagal mengambil statistik.");
});
