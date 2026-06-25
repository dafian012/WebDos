// =============================================
// DAFIANTOOLS — MAIN UTILITIES
// =============================================

// Mobile nav toggle
function toggleMenu() {
    const nav = document.getElementById('mobileNav');
    if (nav) {
        nav.classList.toggle('active');
    }
}

// Close mobile nav when clicking outside
document.addEventListener('click', function(e) {
    const nav = document.getElementById('mobileNav');
    const hamburger = document.querySelector('.hamburger');
    if (nav && nav.classList.contains('active') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
