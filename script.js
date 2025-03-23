// scripts.js
document.addEventListener('DOMContentLoaded', function() {
    const correctKey = '12092010'; // Ganti dengan kunci yang Anda inginkan
    const overlay = document.getElementById('overlay');
    const unlockKeyInput = document.getElementById('unlockKey');
    const submitKeyButton = document.getElementById('submitKey');

    function checkKey() {
        const userKey = unlockKeyInput.value;
        if (userKey === correctKey) {
            alert('Perangkat Anda telah dibuka.');
            window.removeEventListener('beforeunload', preventNavigation);
            overlay.style.display = 'none';
        } else {
            alert('Kunci salah. Coba lagi.');
        }
    }

    function preventNavigation(event) {
        event.preventDefault();
        event.returnValue = '';
        return '';
    }

    window.addEventListener('beforeunload', preventNavigation);
    submitKeyButton.addEventListener('click', checkKey);
});
