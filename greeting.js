// =============================================
// DAFIANTOOLS — GREETING SYSTEM
// Auto-detect time & show popup
// =============================================

(function() {
    // Check if greeting already shown this session
    if (sessionStorage.getItem('dafianGreetingShown')) return;

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour >= 3 && hour < 10) return {
            icon: '🌅',
            title: 'Selamat Pagi! ☀️',
            message: 'Semangat beraktivitas! Selamat datang di DafianTools 🌟',
            color: '#ffa502'
        };
        if (hour >= 10 && hour < 15) return {
            icon: '☀️',
            title: 'Selamat Siang! 🌤️',
            message: 'Jangan lupa istirahat ya! Nikmati DafianTools 🛠️',
            color: '#ff6348'
        };
        if (hour >= 15 && hour < 18) return {
            icon: '🌤️',
            title: 'Selamat Sore! 🌆',
            message: 'Sore yang indah buat download konten favorit! 📸',
            color: '#e1306c'
        };
        if (hour >= 18 && hour < 21) return {
            icon: '🌙',
            title: 'Selamat Malam! 🌙',
            message: 'Malam yang tenang, yuk download video favoritmu! 🎵',
            color: '#6c5ce7'
        };
        return {
            icon: '🌌',
            title: 'Selamat Subuh! 🌌',
            message: 'Masih begadang? Download aja dulu sebelum tidur! 💤',
            color: '#00d2a0'
        };
    }

    function updateTime() {
        const timeEl = document.getElementById('currentTime');
        if (!timeEl) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}:${seconds}`;
        requestAnimationFrame(() => {
            setTimeout(updateTime, 1000);
        });
    }

    function showGreeting() {
        const greeting = getGreeting();
        const popup = document.getElementById('greetingPopup');
        const icon = document.getElementById('greetingIcon');
        const title = document.getElementById('greetingTitle');
        const message = document.getElementById('greetingMessage');

        if (!popup || !icon || !title || !message) return;

        icon.textContent = greeting.icon;
        title.textContent = greeting.title;
        title.style.background = `linear-gradient(135deg, ${greeting.color}, var(--ig-purple))`;
        title.style.webkitBackgroundClip = 'text';
        title.style.webkitTextFillColor = 'transparent';
        title.style.backgroundClip = 'text';
        message.textContent = greeting.message;

        popup.classList.remove('hidden');
        updateTime();

        // Mark as shown
        sessionStorage.setItem('dafianGreetingShown', 'true');
    }

    // Close greeting
    window.closeGreeting = function() {
        const popup = document.getElementById('greetingPopup');
        if (popup) {
            popup.style.opacity = '0';
            popup.style.transition = '0.3s ease';
            setTimeout(() => {
                popup.classList.add('hidden');
                popup.style.opacity = '1';
            }, 300);
        }
    };

    // Show after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showGreeting);
    } else {
        showGreeting();
    }
})();