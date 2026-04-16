document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('cardnav-toggle');
    const overlay = document.getElementById('cardnav-overlay');
    const cards = document.querySelectorAll('.cardnav-card');
    
    let isOpen = false;
    
    if (!toggleBtn || !overlay) return;

    toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        
        if (isOpen) {
            toggleBtn.innerText = 'Close';
            
            gsap.set(overlay, { visibility: 'visible' });
            gsap.to(overlay, { duration: 0.2, opacity: 1 });
            
            gsap.fromTo(cards, 
                { y: -40, opacity: 0 }, 
                {
                    duration: 0.6,
                    y: 0,
                    opacity: 1,
                    stagger: 0.1,
                    ease: "circ.out"
                }
            );
        } else {
            toggleBtn.innerText = 'Menu';
            
            gsap.to(cards, {
                duration: 0.3,
                y: -20,
                opacity: 0,
                stagger: -0.05,
                ease: "power2.in"
            });
            
            gsap.to(overlay, { 
                duration: 0.3, 
                opacity: 0, 
                delay: 0.15,
                onComplete: () => gsap.set(overlay, { visibility: 'hidden' })
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (isOpen && !overlay.contains(e.target) && e.target !== toggleBtn) {
            toggleBtn.click();
        }
    });
    
    const links = overlay.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (isOpen) toggleBtn.click();
        });
    });
});
