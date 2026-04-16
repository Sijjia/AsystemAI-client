// 3D Neural Network Background
function initThreeScene(canvas, slug) {
  import('three').then(({ Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute,
    PointsMaterial, Points, LineBasicMaterial, LineSegments, Color }) => {

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    let seed = 0;
    for (let i = 0; i < slug.length; i++) seed += slug.charCodeAt(i);
    const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };

    const nodeCount = 100;
    const positions = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      positions[i * 3] = (rand() - 0.5) * 24;
      positions[i * 3 + 1] = (rand() - 0.5) * 14;
      positions[i * 3 + 2] = (rand() - 0.5) * 10 - 5;
    }

    const pointsGeo = new BufferGeometry();
    pointsGeo.setAttribute('position', new BufferAttribute(positions, 3));
    const pointsMat = new PointsMaterial({
      color: new Color('#FF9900'),
      size: 0.1,
      transparent: true,
      opacity: 0.7,
    });
    scene.add(new Points(pointsGeo, pointsMat));

    const linePositions = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = positions[i*3] - positions[j*3];
        const dy = positions[i*3+1] - positions[j*3+1];
        const dz = positions[i*3+2] - positions[j*3+2];
        if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 3.5) {
          linePositions.push(positions[i*3], positions[i*3+1], positions[i*3+2]);
          linePositions.push(positions[j*3], positions[j*3+1], positions[j*3+2]);
        }
      }
    }

    const lineGeo = new BufferGeometry();
    lineGeo.setAttribute('position', new BufferAttribute(new Float32Array(linePositions), 3));
    scene.add(new LineSegments(lineGeo, new LineBasicMaterial({
      color: new Color('#6C5CE7'), transparent: true, opacity: 0.12,
    })));

    camera.position.z = 12;
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.015;
      camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0);
      const posArr = pointsGeo.attributes.position.array;
      for (let i = 0; i < nodeCount; i++) {
        posArr[i*3+1] += Math.sin(Date.now() * 0.0008 + i * 0.5) * 0.0015;
      }
      pointsGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) { window.location.href = '/projects.html'; return; }

  const heroContent = document.getElementById('projectHeroContent');
  const heroCover = document.getElementById('projectCover');
  const blocksContent = document.getElementById('projectBlocksContent');
  const navContent = document.getElementById('projectNavContent');
  const canvas = document.getElementById('projectCanvas');

  try {
    const [projectRes, allRes] = await Promise.all([
      fetch(`/api/projects/${slug}`),
      fetch('/api/projects'),
    ]);

    if (!projectRes.ok) {
      heroContent.innerHTML = '<h1 class="project-detail-title">Проект не найден</h1>';
      return;
    }

    const project = await projectRes.json();
    const allProjects = await allRes.json();

    document.title = `${project.title} — Asystem AI`;

    // Cover background image
    if (project.cover_image) {
      heroCover.innerHTML = `<img src="${project.cover_image}" alt="">`;
    }

    // Init 3D
    initThreeScene(canvas, slug);

    // Hero content with logo
    const logoHTML = project.logo_image
      ? `<div class="project-hero-logo"><img src="${project.logo_image}" alt="${project.client || ''}"></div>`
      : '';

    heroContent.innerHTML = `
      <div class="project-hero-row">
        <div class="project-hero-info">
          <p class="project-detail-client">${project.client || ''}</p>
          <h1 class="project-detail-title">${project.title}</h1>
          <p class="project-detail-desc">${project.short_description || ''}</p>
          <div class="project-detail-tags">
            ${(project.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('')}
          </div>
        </div>
        ${logoHTML}
      </div>
    `;

    // Blocks with icons
    const blockConfig = [
      { key: 'challenge', label: 'Задача', icon: '🎯', cls: 'challenge' },
      { key: 'solution', label: 'Решение', icon: '⚡', cls: 'solution' },
      { key: 'result', label: 'Результат', icon: '🏆', cls: 'result' },
    ];

    let blocksHTML = '<div class="project-block-grid">';
    blockConfig.forEach(b => {
      if (project[b.key]) {
        blocksHTML += `
          <div class="project-block">
            <div class="project-block-icon ${b.cls}">${b.icon}</div>
            <p class="project-block-label">${b.label}</p>
            <p class="project-block-text">${project[b.key]}</p>
          </div>
        `;
      }
    });
    blocksHTML += '</div>';

    if (project.full_description) {
      blocksHTML += `<div class="project-full-desc">${project.full_description}</div>`;
    }

    blocksContent.innerHTML = blocksHTML;

    // GSAP animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Animate hero content
      gsap.from('.project-hero-info', { y: 30, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
      gsap.from('.project-hero-logo', { scale: 0.8, opacity: 0, duration: 0.8, delay: 0.5, ease: 'back.out(1.5)' });

      // Animate blocks
      gsap.utils.toArray('.project-block').forEach((block, i) => {
        gsap.from(block, {
          y: 50, opacity: 0, duration: 0.8, delay: i * 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: block, start: 'top 85%', once: true }
        });
      });

      // Animate CTA
      gsap.from('.project-cta-card', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.project-cta-card', start: 'top 85%', once: true }
      });
    }

    // Nav (prev/next) as cards
    const idx = allProjects.findIndex(p => p.slug === slug);
    const prev = idx > 0 ? allProjects[idx - 1] : null;
    const next = idx < allProjects.length - 1 ? allProjects[idx + 1] : null;

    navContent.innerHTML = `
      ${prev ? `
        <a href="/project.html?slug=${prev.slug}" class="project-nav-card">
          <p class="nav-label">← Предыдущий проект</p>
          <p class="nav-title">${prev.title}</p>
        </a>
      ` : '<div></div>'}
      ${next ? `
        <a href="/project.html?slug=${next.slug}" class="project-nav-card next">
          <p class="nav-label">Следующий проект →</p>
          <p class="nav-title">${next.title}</p>
        </a>
      ` : '<div></div>'}
    `;

  } catch (err) {
    heroContent.innerHTML = '<h1 class="project-detail-title">Ошибка загрузки</h1>';
    console.error(err);
  }

  // Header scroll
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.pageYOffset > 100);
    });
  }

  // Mobile menu
  const nav = document.querySelector('.nav');
  const navMenu = document.querySelector('.nav-menu');
  if (nav && navMenu) {
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.setAttribute('aria-label', 'Toggle menu');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    const actions = document.querySelector('.header-actions');
    if (actions) actions.appendChild(hamburger);
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
});
