document.addEventListener('DOMContentLoaded', () => {
    // Initialize Team 3D Coverflow Carousel
    const teamSwiper = new Swiper('.team-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 3, // Force exact number instead of 'auto' which breaks coverflow calculate
        loop: true,
        loopedSlides: 5, // Ensure enough duplicates for 3D bleed
        speed: 800,
        coverflowEffect: {
            rotate: 45, // Sharp angle
            stretch: -80, // Heavy overlap
            depth: 300, // Distance on Z-axis
            modifier: 1.5, // Multiplier to force strong 3D visual geometry
            slideShadows: false,
        },
        mousewheel: {
            sensitivity: 0.5,
        },
        keyboard: {
            enabled: true,
        }
    });
});
