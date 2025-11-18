document.addEventListener('DOMContentLoaded', () => {

    // ===== Mobile Navigation Toggle =====
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            if (mainNav.style.display === 'flex') {
                // Hide menu
                mainNav.style.display = 'none';
            } else {
                // Show menu
                mainNav.style.display = 'flex';
                mainNav.style.flexDirection = 'column';
                mainNav.style.gap = '10px';
            }
        });
    }
});