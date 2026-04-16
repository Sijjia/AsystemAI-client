/**
 * MagicBento Vanilla JS Port
 * Provides mouse-tracking glow, particle effects, and 3D tilting!
 */
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('bentoGrid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.magic-bento-card');
    
    // Config
    const SPOTLIGHT_RADIUS = 400;
    const PARTICLE_COUNT = 12;
    const GLOW_COLOR = '255, 153, 0'; // primary brand orange
    
    // State
    let isInsideGrid = false;
    let globalMouseX = 0;
    let globalMouseY = 0;
    
    // 1. Create spotlight
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
        position: fixed;
        width: 800px;
        height: 800px;
        border-radius: 50%;
        pointer-events: none;
        background: radial-gradient(circle,
            rgba(${GLOW_COLOR}, 0.15) 0%,
            rgba(${GLOW_COLOR}, 0.08) 15%,
            rgba(${GLOW_COLOR}, 0.04) 25%,
            rgba(${GLOW_COLOR}, 0.02) 40%,
            rgba(${GLOW_COLOR}, 0.01) 65%,
            transparent 70%
        );
        z-index: 200;
        opacity: 0;
        transform: translate(-50%, -50%);
        mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);

    // Update border glows
    const updateCardGlowProperties = (card, mouseX, mouseY, glowIntensity, radius) => {
        const rect = card.getBoundingClientRect();
        const relativeX = ((mouseX - rect.left) / rect.width) * 100;
        const relativeY = ((mouseY - rect.top) / rect.height) * 100;

        card.style.setProperty('--glow-x', `${relativeX}%`);
        card.style.setProperty('--glow-y', `${relativeY}%`);
        card.style.setProperty('--glow-intensity', glowIntensity);
        card.style.setProperty('--glow-radius', `${radius}px`);
    };

    // Global Tracker
    document.addEventListener('mousemove', (e) => {
        if (!grid) return;
        
        globalMouseX = e.clientX;
        globalMouseY = e.clientY;

        const rect = grid.getBoundingClientRect();
        // check if mouse is inside
        const mouseInside = e.clientX >= rect.left && e.clientX <= rect.right && 
                            e.clientY >= rect.top && e.clientY <= rect.bottom;

        if (!mouseInside) {
            if (isInsideGrid) {
                gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' });
                cards.forEach(c => c.style.setProperty('--glow-intensity', '0'));
                isInsideGrid = false;
            }
            return;
        }

        isInsideGrid = true;

        const proximity = SPOTLIGHT_RADIUS * 0.5;
        const fadeDistance = SPOTLIGHT_RADIUS * 0.75;
        let minDistance = Infinity;

        cards.forEach((card) => {
            const cardRect = card.getBoundingClientRect();
            const centerX = cardRect.left + cardRect.width / 2;
            const centerY = cardRect.top + cardRect.height / 2;
            const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY) - 
                             Math.max(cardRect.width, cardRect.height) / 2;
                             
            const effectiveDistance = Math.max(0, distance);
            minDistance = Math.min(minDistance, effectiveDistance);

            let glowIntensity = 0;
            if (effectiveDistance <= proximity) glowIntensity = 1;
            else if (effectiveDistance <= fadeDistance) {
                glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
            }

            updateCardGlowProperties(card, e.clientX, e.clientY, glowIntensity, SPOTLIGHT_RADIUS);
        });

        // Move the spotlight div
        gsap.to(spotlight, {
            left: e.clientX,
            top: e.clientY,
            duration: 0.1,
            ease: 'power2.out'
        });

        // Set spotlight overall opacity
        const targetOpacity = minDistance <= proximity ? 0.6 : 
                              minDistance <= fadeDistance ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.6 : 0;
        gsap.to(spotlight, {
            opacity: targetOpacity,
            duration: targetOpacity > 0 ? 0.2 : 0.5,
            ease: 'power2.out'
        });
    });

    document.addEventListener('mouseleave', () => {
        isInsideGrid = false;
        cards.forEach(c => c.style.setProperty('--glow-intensity', '0'));
        gsap.to(spotlight, { opacity: 0, duration: 0.3 });
    });

    // 2. Individual Card Interactions (Tilt & Magnetism)
    cards.forEach(card => {
        // Exclude the form from aggressive tilt/magnetism to preserve typing usability
        const hasForm = card.querySelector('form') !== null;
        let isHovered = false;
        
        let timeouts = [];
        let particles = [];

        const createParticle = () => {
            const rect = card.getBoundingClientRect();
            const el = document.createElement('div');
            el.className = 'particle';
            // Start at a random position inside the card
            el.style.left = `${Math.random() * rect.width}px`;
            el.style.top = `${Math.random() * rect.height}px`;
            return el;
        };

        const clearParticles = () => {
            timeouts.forEach(clearTimeout);
            timeouts = [];
            particles.forEach(p => {
                gsap.to(p, {
                    scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)',
                    onComplete: () => p.remove()
                });
            });
            particles = [];
        };

        card.addEventListener('mouseenter', () => {
            isHovered = true;
            
            // Only non-form cards tilt
            if (!hasForm) {
                gsap.to(card, {
                    rotateX: 2,
                    rotateY: 2,
                    duration: 0.3,
                    ease: 'power2.out',
                    transformPerspective: 1000
                });
            }

            // Only particle-containers get particles
            if (card.classList.contains('particle-container')) {
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    const tid = setTimeout(() => {
                        if (!isHovered) return;
                        const p = createParticle();
                        card.appendChild(p);
                        particles.push(p);

                        gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
                        gsap.to(p, {
                            x: (Math.random() - 0.5) * 100,
                            y: (Math.random() - 0.5) * 100,
                            duration: 2 + Math.random() * 2,
                            ease: 'none',
                            repeat: -1,
                            yoyo: true
                        });
                        gsap.to(p, {
                            opacity: 0.3,
                            duration: 1.5,
                            ease: 'power2.inOut',
                            repeat: -1,
                            yoyo: true
                        });
                    }, i * 100);
                    timeouts.push(tid);
                }
            }
        });

        card.addEventListener('mouseleave', () => {
            isHovered = false;
            clearParticles();
            
            if (!hasForm) {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    x: 0,
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });

        card.addEventListener('mousemove', (e) => {
            if (hasForm) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Tilt
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            
            gsap.to(card, {
                rotateX,
                rotateY,
                duration: 0.1,
                ease: 'power2.out',
                transformPerspective: 1000
            });

            // Magnetism (subtle)
            gsap.to(card, {
                x: (x - centerX) * 0.02,
                y: (y - centerY) * 0.02,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        card.addEventListener('click', (e) => {
            if (hasForm) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const maxDist = Math.max(
                Math.hypot(x, y), Math.hypot(x - rect.width, y),
                Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height)
            );

            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: ${maxDist * 2}px;
                height: ${maxDist * 2}px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(132, 0, 255, 0.3) 0%, rgba(132, 0, 255, 0.1) 30%, transparent 70%);
                left: ${x - maxDist}px;
                top: ${y - maxDist}px;
                pointer-events: none;
                z-index: 1000;
            `;
            card.appendChild(ripple);

            gsap.fromTo(ripple, { scale: 0, opacity: 1 }, {
                scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out',
                onComplete: () => ripple.remove()
            });
        });
    });
});
