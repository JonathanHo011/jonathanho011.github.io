// --- Load data and render ---

const CATEGORY_META = {
    'crypto-macro':   { label: 'Crypto & Macro',   cls: 'tag-crypto' },
    'token-deep-dive': { label: 'Token Deep Dive',  cls: 'tag-token' },
    'industry-sector': { label: 'Industry & Sector', cls: 'tag-industry' },
    'bilingual':      { label: 'Bilingual',         cls: 'tag-bilingual' },
    'quant':          { label: 'Quantitative',       cls: 'tag-quant' },
};

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

// --- Articles ---

function buildArticleCard(a) {
    const meta = CATEGORY_META[a.category] || CATEGORY_META['crypto-macro'];
    const url = a.mediumUrl || `articles/${a.slug}.html`;
    const target = a.mediumUrl ? ' target="_blank" rel="noopener"' : '';
    return `
        <article class="research-card bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] fade-in"
                 data-category="${a.category}" data-date="${a.date}">
            <div class="flex justify-between items-start mb-3">
                <span class="${meta.cls} px-3 py-1 rounded-full text-xs font-semibold">${meta.label}</span>
                <span class="text-[var(--muted)] text-xs">${formatDate(a.date)}</span>
            </div>
            <h3 class="font-semibold text-lg mb-2 leading-snug">
                <a href="${url}"${target} class="hover:text-[var(--accent)] transition-colors">${a.title}</a>
            </h3>
            <p class="text-[var(--muted)] text-sm mb-4 leading-relaxed">${a.excerpt}</p>
            <div class="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span class="text-xs text-[var(--muted)]">${a.readTime} min read</span>
                <a href="${url}"${target} class="text-[var(--accent)] text-sm font-medium hover:underline">Read →</a>
            </div>
        </article>`;
}

function renderArticles(articles, filter = 'all') {
    const grid = document.getElementById('article-grid');
    const filtered = filter === 'all'
        ? articles
        : articles.filter(a => a.category === filter);
    grid.innerHTML = filtered.map(buildArticleCard).join('');
    requestAnimationFrame(() => {
        grid.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    });
}

// --- Projects ---

function buildProjectCard(p) {
    const meta = CATEGORY_META['quant'];
    return `
        <article class="research-card bg-[var(--paper)] rounded-xl p-6 border border-[var(--border)] fade-in">
            <div class="flex justify-between items-start mb-3">
                <span class="${meta.cls} px-3 py-1 rounded-full text-xs font-semibold">${meta.label}</span>
                <span class="text-[var(--muted)] text-xs">${formatDate(p.date)}</span>
            </div>
            <h3 class="font-semibold text-lg mb-3 leading-snug">
                <a href="${p.githubUrl}" target="_blank" rel="noopener" class="hover:text-[var(--accent)] transition-colors">${p.title}</a>
            </h3>
            <p class="text-[var(--muted)] text-sm mb-4 leading-relaxed">${p.description}</p>
            ${p.metrics ? (() => {
                const labels = p.metricLabels || { return: 'Return', sharpe: 'Sharpe', maxDrawdown: 'Max DD', benchmarkReturn: 'B&H' };
                const keys = ['return', 'sharpe', 'maxDrawdown', 'benchmarkReturn'];
                const values = keys.filter(k => p.metrics[k] !== undefined && p.metrics[k] !== 'N/A');
                return `
            <div class="grid grid-cols-${Math.min(values.length, 4)} gap-2 mb-4">
                ${values.map(k => `
                <div class="metric-box">
                    <div class="metric-value">${p.metrics[k]}</div>
                    <div class="metric-label">${labels[k]}</div>
                </div>`).join('')}
            </div>`;
            })() : ''}
            <div class="flex flex-wrap gap-2 mb-4">
                ${(p.tags || []).map(t => `<span class="text-xs text-[var(--muted)] bg-[var(--highlight)] px-2 py-1 rounded">${t}</span>`).join('')}
            </div>
            <a href="${p.githubUrl}" target="_blank" rel="noopener" class="text-[var(--accent)] text-sm font-medium hover:underline">
                View on GitHub →
            </a>
        </article>`;
}

function renderProjects(projects) {
    const grid = document.getElementById('project-grid');
    grid.innerHTML = projects.map(buildProjectCard).join('');
    requestAnimationFrame(() => {
        grid.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    });
}

// --- Filters ---

function setupFilters(articles) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderArticles(articles, btn.dataset.filter);
        });
    });
}

// --- Scroll animations ---

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    const grid = document.getElementById('article-grid');
    if (grid) {
        new MutationObserver(() => {
            grid.querySelectorAll('.fade-in:not(.visible)').forEach(el => cardObserver.observe(el));
        }).observe(grid, { childList: true });
    }
}

// --- Smooth scroll for nav links ---

function setupNavScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// --- Load everything ---

Promise.all([
    fetch('data/articles.json').then(r => r.json()),
    fetch('data/projects.json').then(r => r.json())
])
.then(([articles, projects]) => {
    renderArticles(articles);
    setupFilters(articles);
    renderProjects(projects);
    setupNavScroll();
    setupScrollAnimations();
})
.catch(err => console.error('Failed to load data:', err));
