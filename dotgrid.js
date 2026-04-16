class DotGrid {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false }); // Render solid background manually
    
    // Merge options with user-provided config
    this.options = {
      dotSize: 4,
      gap: 14,
      baseColor: "#523588",
      activeColor: "#f58300",
      proximity: 210,
      speedTrigger: 40,
      shockRadius: 190,
      shockStrength: 1,
      maxSpeed: 3000,
      resistance: 1150,
      returnDuration: 2.5,
      ...options
    };
    
    // Parse colors to RGB objects for interpolation
    this.baseRgb = this.hexToRgb(this.options.baseColor);
    this.activeRgb = this.hexToRgb(this.options.activeColor);

    this.dots = [];
    this.mouse = { x: -1000, y: -1000 };
    this.lastMouse = { x: -1000, y: -1000, time: performance.now() };
    this.mouseSpeed = 0;
    
    this.lastTime = performance.now();
    
    this.initEvents();
    this.handleResize();
    requestAnimationFrame((t) => this.animate(t));
  }

  initEvents() {
    window.addEventListener('resize', () => this.handleResize());
    
    // Global mousemove to interact with the grid even though canvas is pointer-events: none
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      const now = performance.now();
      const dtMouse = (now - this.lastMouse.time) / 1000; 
      
      if (dtMouse > 0) {
        let vx = (currentX - this.lastMouse.x) / dtMouse;
        let vy = (currentY - this.lastMouse.y) / dtMouse;
        let speed = Math.sqrt(vx * vx + vy * vy);
        this.mouseSpeed = speed;
      }
      
      this.mouse.x = currentX;
      this.mouse.y = currentY;
      
      this.lastMouse.x = currentX;
      this.lastMouse.y = currentY;
      this.lastMouse.time = now;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.mouseSpeed = 0;
    });
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  handleResize() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth || window.innerWidth;
    this.canvas.height = container.clientHeight || window.innerHeight;
    this.createGrid();
  }

  createGrid() {
    this.dots = [];
    const spacing = this.options.dotSize + this.options.gap;
    
    // Add extra margin columns/rows to avoid clipping at borders
    const columns = Math.ceil(this.canvas.width / spacing) + 2;
    const rows = Math.ceil(this.canvas.height / spacing) + 2;
    
    const startX = (this.canvas.width - (columns * spacing)) / 2;
    const startY = (this.canvas.height - (rows * spacing)) / 2;

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        const cx = startX + i * spacing;
        const cy = startY + j * spacing;
        
        this.dots.push({
          origX: cx,
          origY: cy,
          x: cx,
          y: cy,
          vx: 0,
          vy: 0,
          colorRatio: 0
        });
      }
    }
  }

  animate(time) {
    let dt = (time - this.lastTime) / 1000;
    if (dt > 0.05) dt = 0.05; // Cap dt for physical stability
    this.lastTime = time;

    // Fill the background of the canvas to match hero section
    // Since we're using { alpha: false }, this acts as the "clear" operation
    this.ctx.fillStyle = "#1a1f3a"; // Hero base background color to blend correctly 
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const o = this.options;
    const springK = o.resistance; 
    const damping = o.returnDuration; // Acting as a damping parameter for the exact look
    
    this.dots.forEach(dot => {
      let dx = this.mouse.x - dot.x;
      let dy = this.mouse.y - dot.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      
      let fx = 0;
      let fy = 0;

      // Color Proximate highlighting
      if (dist < o.proximity) {
        dot.colorRatio += (1 - dot.colorRatio) * 10 * dt;
      } else {
        dot.colorRatio -= dot.colorRatio * 5 * dt;
      }
      dot.colorRatio = Math.max(0, Math.min(1, dot.colorRatio));

      // Physics Shock Algorithm when mouse is moving fast
      if (this.mouseSpeed > o.speedTrigger && dist < o.shockRadius && dist > 0.1) {
        let shockPower = (1 - (dist / o.shockRadius)) * o.shockStrength * 4000;
        fx += -(dx / dist) * shockPower;
        fy += -(dy / dist) * shockPower;
      }
      
      // Spring force returning to origin
      let spx = dot.origX - dot.x;
      let spy = dot.origY - dot.y;
      fx += spx * springK;
      fy += spy * springK;

      // Apply F = ma
      dot.vx += fx * dt;
      dot.vy += fy * dt;
      
      // Damping using returnDuration roughly mapped
      dot.vx *= Math.pow(1 - Math.min(damping/10, 0.99), dt * 60);
      dot.vy *= Math.pow(1 - Math.min(damping/10, 0.99), dt * 60);

      // Max velocity capping
      let speed = Math.sqrt(dot.vx*dot.vx + dot.vy*dot.vy);
      if (speed > o.maxSpeed) {
        dot.vx = (dot.vx / speed) * o.maxSpeed;
        dot.vy = (dot.vy / speed) * o.maxSpeed;
      }

      // Update positions
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;

      // Drawing
      let r = this.baseRgb.r + (this.activeRgb.r - this.baseRgb.r) * dot.colorRatio;
      let g = this.baseRgb.g + (this.activeRgb.g - this.baseRgb.g) * dot.colorRatio;
      let b = this.baseRgb.b + (this.activeRgb.b - this.baseRgb.b) * dot.colorRatio;

      this.ctx.fillStyle = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      this.ctx.beginPath();
      // To create centered dots we draw using dot.x and dot.y as centers
      this.ctx.arc(dot.x, dot.y, o.dotSize / 2, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Decay mouse speed artificially so it stops shocking when mouse rests
    this.mouseSpeed *= Math.pow(0.8, dt * 60);

    requestAnimationFrame((t) => this.animate(t));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-dotgrid');
  if (canvas) {
    new DotGrid(canvas);
  }
});
