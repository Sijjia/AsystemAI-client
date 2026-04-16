function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('teamGallery');
    const cards = Array.from(container.querySelectorAll('.circular-card'));
    if(!container || cards.length === 0) return;

    const scrollSpeed = 2.0;
    const scrollEase = 0.08; 
    
    let scroll = { current: 0, target: 0 };
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    
    const itemWidth = 300; 
    const N = cards.length; 

    // Initial setup
    container.style.position = 'relative';
    container.style.height = '780px'; 
    container.style.overflow = 'hidden'; 
    
    // Position elements
    const updatePositions = () => {
        const isMobile = window.innerWidth <= 768;
        const cWidth = isMobile ? 270 : 360;
        cards.forEach(card => {
            card.style.position = 'absolute';
            card.style.left = `calc(50% - ${cWidth/2}px)`; 
            card.style.top = '50px'; 
            card.style.background = '#ffffff'; 
        });
    };
    
    updatePositions();
    window.addEventListener('resize', updatePositions);

    const onCheck = () => {
        let index = Math.round(scroll.target / itemWidth);
        scroll.target = index * itemWidth;
    };

    const onTouchDown = (e) => {
        isDown = true;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startScroll = scroll.current;
        container.style.cursor = "grabbing";
    };

    const onTouchMove = (e) => {
        if (!isDown) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const distance = (startX - x) * 1.5; 
        scroll.target = startScroll + distance;
    };

    const onTouchUp = () => {
        if (!isDown) return;
        isDown = false;
        container.style.cursor = "grab";
        onCheck();
    };

    let wheelAccumulator = 0;
    let isWheelLocked = false;

    const onWheel = (e) => {
        e.preventDefault();
        if (isWheelLocked) return;
        
        let delta = e.deltaY || e.deltaX || e.wheelDelta || e.detail;
        wheelAccumulator += delta;
        
        if (Math.abs(wheelAccumulator) >= 30) {
            let currentIndex = Math.round(scroll.target / itemWidth);
            currentIndex += Math.sign(wheelAccumulator);
            scroll.target = currentIndex * itemWidth;
            
            isWheelLocked = true;
            setTimeout(() => {
                isWheelLocked = false;
                wheelAccumulator = 0; 
            }, 600); 
        }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('mousedown', (e) => {
        if (e.target.closest('a') || e.target.closest('.tag')) return;
        onTouchDown(e);
    });
    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('mouseup', onTouchUp);
    container.addEventListener('touchstart', onTouchDown, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchUp);
    container.style.cursor = "grab";

    const update = () => {
        scroll.current += (scroll.target - scroll.current) * scrollEase;
        
        const centerPos = scroll.current / itemWidth;

        const isMobile = window.innerWidth <= 768;
        const spread = isMobile ? 180 : 380;
        const baseZ = isMobile ? 100 : 160;

        cards.forEach((card, i) => {
            const rawDist = i - centerPos;
            
            let dist = ((rawDist % N) + N) % N;
            if (dist > N / 2) {
                dist -= N;
            }

            const absDist = Math.abs(dist);
            const sign = Math.sign(dist);

            let translateX = sign * Math.pow(absDist, 0.9) * spread;
            const translateZ = -absDist * baseZ; 
            const rotateY = sign * -Math.min(absDist * 35, 60); 
            const scale = Math.max(0.6, 1 - (absDist * (isMobile ? 0.08 : 0.12))); 

            card.style.setProperty(
                'transform', 
                `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`, 
                'important'
            );
            
            card.style.zIndex = Math.round(100 - absDist * 10);
            
            const opacity = Math.max(0, 1 - (absDist * 0.22));
            card.style.opacity = opacity.toFixed(2);
            card.style.pointerEvents = absDist < 0.5 ? 'auto' : 'none';
        });

        requestAnimationFrame(update);
    };

    update();
});
