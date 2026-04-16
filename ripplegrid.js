class RippleGrid {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    
    this.options = {
      enableRainbow: true,
      gridColor: "#f18204",
      rippleIntensity: 0.05,
      gridSize: 12,
      gridThickness: 23,
      fadeDistance: 2.4, // This was previously small, causing the "ball" look
      vignetteStrength: 2,
      glowIntensity: 0.3,
      opacity: 1,
      mouseInteraction: true,
      mouseInteractionRadius: 1.4,
      ...options
    };

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
    this.timeStart = performance.now();
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    if (this.options.mouseInteraction) {
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.targetX = (e.clientX - rect.left) - this.canvas.width / 2;
            this.mouse.targetY = (e.clientY - rect.top) - this.canvas.height / 2;
            this.mouse.active = true;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.active = false;
        });
    }
    
    requestAnimationFrame((t) => this.render(t));
  }

  resize() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth || window.innerWidth;
    this.canvas.height = container.clientHeight || window.innerHeight;
  }
  
  hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } 
                    : { r: 241, g: 130, b: 4 };
  }
  
  render(time) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const o = this.options;
    
    ctx.clearRect(0, 0, w, h);
    
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;
    if (!this.mouse.active) {
        this.mouse.x *= 0.95;
        this.mouse.y *= 0.95;
    }

    const t = (time - this.timeStart) / 1000;
    
    const gap = Math.max(60, 1200 / o.gridSize); 
    // Increased cols/rows to stretch to the sides infinitely
    const cols = Math.ceil(w / gap) + 40;
    const rows = Math.ceil(h / gap) + 30;
    const startX = - (cols / 2) * gap;
    const startY = - (rows / 2) * gap;
    
    // Deeper perspective so lines cover the screen edges
    const fov = 1500;
    const points = [];
    
    for (let i = 0; i <= cols; i++) {
        points[i] = [];
        for (let j = 0; j <= rows; j++) {
            let x = startX + i * gap;
            let y = startY + j * gap;
            
            let distToCenter = Math.sqrt(x*x + y*y);
            
            // Very smooth ambient ripple (large slow waves)
            let z = Math.sin(x * 0.002 + t * 0.8) * Math.cos(y * 0.002 + t * 0.6) * (o.rippleIntensity * 2000);
            
            // Mouse Interaction: Soft, broad, pleasant deformation
            if (o.mouseInteraction) {
                let dx = x - this.mouse.x; 
                let dy = y - this.mouse.y;
                let dMouse = Math.sqrt(dx*dx + dy*dy);
                // Increased radius by 25% from previous
                let mRadius = o.mouseInteractionRadius * 425; 
                if (dMouse < mRadius) {
                    // Cosine falloff ensures perfectly smooth peak and edges
                    let normalizedDist = dMouse / mRadius;
                    let influence = (Math.cos(normalizedDist * Math.PI) + 1.0) * 0.5;
                    
                    // Added positive Z for outward bulge (convexity) towards the viewer
                    z += influence * 420; 
                }
            }
            
            // Flatten the barrel curvature so it doesn't look like a "ball" but rather a wide immersive field
            z -= Math.pow(distToCenter, 1.5) * 0.003; 
            
            let scale = fov / (fov - z);
            if (scale < 0) scale = 0;
            
            let px = x * scale + w / 2;
            let py = y * scale + h / 2;
            
            points[i][j] = { px, py, scale, distToCenter };
        }
    }
    
    // Increased line width by 45%
    ctx.lineWidth = o.gridThickness > 0 ? (o.gridThickness / 20) * 2.5 : 2.5;
    if (ctx.lineWidth < 1.0) ctx.lineWidth = 1.0;
    
    let baseRGB = this.hexToRgb(o.gridColor);
    // Increased fadeRadius massively to stretch to edges
    let fadeRadius = o.fadeDistance * 800; // was 350

    for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
            let p = points[i][j];
            if (!p || p.scale <= 0) continue;
            
            let dist = p.distToCenter;
            let alpha = 1.0 - Math.pow(dist / fadeRadius, o.vignetteStrength);
            alpha = Math.max(0, Math.min(o.opacity, alpha));
            
            if (alpha <= 0.01) continue; 
            
            let fillStyle, strokeStyle;
            if (o.enableRainbow) {
                const speed = t * 0.4 + dist * 0.001;
                const cycle = speed % 3;
                const colors = [
                    {r: 255, g: 153, b: 0},   // Orange #FF9900
                    {r: 108, g: 92, b: 231},  // Purple #6C5CE7
                    {r: 44, g: 44, b: 84}     // Dark Blue #2C2C54
                ];
                let c1, c2, rRatio;
                if (cycle < 1) { c1 = colors[0]; c2 = colors[1]; rRatio = cycle; }
                else if (cycle < 2) { c1 = colors[1]; c2 = colors[2]; rRatio = cycle - 1; }
                else { c1 = colors[2]; c2 = colors[0]; rRatio = cycle - 2; }
                
                // Smooth blending
                rRatio = rRatio * rRatio * (3 - 2 * rRatio);
                
                // Adding a tiny brightness boost (+15) since dark blue is very dark for mix-blend-mode screen
                let rr = Math.max(0, Math.min(255, Math.round(c1.r + (c2.r - c1.r) * rRatio) + 15));
                let gg = Math.max(0, Math.min(255, Math.round(c1.g + (c2.g - c1.g) * rRatio) + 15));
                let bb = Math.max(0, Math.min(255, Math.round(c1.b + (c2.b - c1.b) * rRatio) + 15));
                
                let cStr = `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
                fillStyle = cStr; strokeStyle = cStr;
            } else {
                fillStyle = `rgba(${baseRGB.r}, ${baseRGB.g}, ${baseRGB.b}, ${alpha})`;
                strokeStyle = `rgba(${baseRGB.r}, ${baseRGB.g}, ${baseRGB.b}, ${alpha * 0.7})`;
            }

            ctx.strokeStyle = strokeStyle;
            ctx.fillStyle = fillStyle;
            
            if (o.glowIntensity > 0) {
                 ctx.shadowBlur = o.glowIntensity * 25 * p.scale;
                 ctx.shadowColor = strokeStyle;
            }

            ctx.beginPath();
            if (i < cols) {
                let pRight = points[i+1][j];
                if (pRight.scale > 0) { ctx.moveTo(p.px, p.py); ctx.lineTo(pRight.px, pRight.py); }
            }
            if (j < rows) {
                let pDown = points[i][j+1];
                if (pDown.scale > 0) { ctx.moveTo(p.px, p.py); ctx.lineTo(pDown.px, pDown.py); }
            }
            ctx.stroke();
            
            if (o.glowIntensity > 0) ctx.shadowBlur = 0;
            ctx.beginPath();
            // Nodes also increased in size to match lines
            ctx.arc(p.px, p.py, 2.0 * p.scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    requestAnimationFrame((t) => this.render(t));
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('ripplegrid-container');
    if (container) {
        container.innerHTML = '<canvas id="hero-ripplegrid" style="width:100%;height:100%;mix-blend-mode:screen;"></canvas>';
        const canvas = document.getElementById('hero-ripplegrid');
        new RippleGrid(canvas, {
          enableRainbow: true,
          gridColor: "#f18204",
          rippleIntensity: 0.05,
          gridSize: 12,
          gridThickness: 23,
          fadeDistance: 2.4,
          vignetteStrength: 2,
          glowIntensity: 0.3,
          opacity: 1,
          mouseInteraction: true,
          mouseInteractionRadius: 1.4
        });
    }
});
