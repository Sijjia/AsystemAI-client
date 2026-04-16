document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('projectsGrid');
  const filtersEl = document.getElementById('projectsFilters');

  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();

    if (projects.length === 0) {
      grid.innerHTML = '<div class="projects-loading">Проектов пока нет</div>';
      return;
    }

    // Collect unique tags
    const allTags = new Set();
    projects.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));

    // Render filters
    let activeFilter = '';

    const renderFilters = () => {
      filtersEl.innerHTML = '';
      const allBtn = document.createElement('button');
      allBtn.className = `filter-btn ${activeFilter === '' ? 'active' : ''}`;
      allBtn.textContent = 'Все';
      allBtn.onclick = () => { activeFilter = ''; renderFilters(); renderGrid(); };
      filtersEl.appendChild(allBtn);

      allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${activeFilter === tag ? 'active' : ''}`;
        btn.textContent = tag;
        btn.onclick = () => { activeFilter = tag; renderFilters(); renderGrid(); };
        filtersEl.appendChild(btn);
      });
    };

    // Render grid
    const renderGrid = () => {
      const filtered = activeFilter
        ? projects.filter(p => (p.tags || []).includes(activeFilter))
        : projects;

      grid.innerHTML = '';

      filtered.forEach((p, i) => {
        const card = document.createElement('a');
        card.href = `/project.html?slug=${p.slug}`;
        card.className = 'project-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';

        const coverContent = p.logo_image
          ? `<img src="${p.logo_image}" alt="${p.client || ''}">`
          : (p.cover_image ? `<img src="${p.cover_image}" alt="${p.title}">` : '');

        card.innerHTML = `
          <div class="project-card-cover">
            ${coverContent}
            <div class="card-glow"></div>
          </div>
          <div class="project-card-body">
            ${p.client ? `<p class="project-card-client">${p.client}</p>` : ''}
            <h3 class="project-card-title">${p.title}</h3>
            <p class="project-card-desc">${p.short_description || ''}</p>
            <div class="project-card-tags">
              ${(p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('')}
            </div>
          </div>
        `;

        grid.appendChild(card);

        // Animate in with stagger
        setTimeout(() => {
          card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 100 + 50);
      });
    };

    renderFilters();
    renderGrid();

  } catch (err) {
    grid.innerHTML = '<div class="projects-loading">Ошибка загрузки проектов</div>';
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
