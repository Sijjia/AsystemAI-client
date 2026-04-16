// ==========================================
// GSAP ScrollStack (Absolute Pinned Timeline)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const scroller = document.querySelector('.scroll-stack-scroller');
    const cards = gsap.utils.toArray('.scroll-stack-card');
    
    if (!scroller || cards.length === 0) return;

    // Скрываем все карточки кроме первой ниже экрана
    gsap.set(cards.slice(1), { 
        y: () => window.innerHeight + 100 
    });

    // Настраиваем отступы "закладок" сверху
    const TAB_HEIGHT = 45;

    // Весь блок #process прилипает к экрану на весь период анимации
    const processSection = document.getElementById('process');
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: processSection,
            start: "top 80px", 
            end: "+=" + (cards.length * 750) + "px",
            scrub: true,
            pin: true,
            anticipatePin: 1
        }
    });

    // Построение анимации шаг за шагом
    cards.forEach((card, i) => {
        if (i === 0) return; // Первая карточка уже на месте (y: 0)

        // Карточка i выезжает снизу на свое место (на TAB_HEIGHT пикселей ниже предыдущей)
        tl.to(card, {
            y: i * TAB_HEIGHT,
            duration: 1, // Относительная длительность выезда
            ease: "power2.out"
        });

        // ОДНОВРЕМЕННО ВСЕ предыдущие карточки сжимаются вглубь
        for (let prev = 0; prev < i; prev++) {
            tl.to(cards[prev], {
                scale: `-=0.03`,           // Уменьшаем еще на 3%
                duration: 1,
                ease: "power2.out"
            }, "<"); // "<" означает: запустить одновременно с предыдущей анимацией (выездом card i)
        }
    });
});
