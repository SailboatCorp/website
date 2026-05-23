(() => {
  const app = document.getElementById("app");
  const siteHeader = document.getElementById("siteHeader");
  const siteFooter = document.getElementById("siteFooter");

  let data = null;
  let currentRoute = "home";

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function resolveRef(value) {
    if (!value || typeof value !== "string") return value || "";
    if (value.startsWith("asset:")) {
      return data.assets[value.slice(6)] || "";
    }
    if (value.startsWith("link:")) {
      return data.links[value.slice(5)] || "";
    }
    return value;
  }

  function pageKeys() {
    return data.navigation.filter(key => data.pages[key]);
  }

  function routeFromHash() {
    const hash = window.location.hash.replace("#", "").trim().toLowerCase();
    return pageKeys().includes(hash) && hash !== "home" ? hash : "home";
  }

  function imagePanel(src, alt, extra = "", fit = "cover") {
    const imageClass = fit === "contain" ? "contain" : "";
    return `
      <div class="image-panel ${escapeHTML(extra)} ${imageClass}">
        <img src="${escapeHTML(resolveRef(src))}" alt="${escapeHTML(alt)}" loading="lazy">
      </div>
    `;
  }

  function externalButton(link) {
    return `<a class="external-btn" href="${escapeHTML(resolveRef(link.href))}" target="_blank" rel="noreferrer">${escapeHTML(link.label)} ↗</a>`;
  }

  function renderHeader() {
    const navButtons = pageKeys().map(key => {
      const page = data.pages[key];
      return `<button type="button" class="nav-btn" data-route="${escapeHTML(key)}">${escapeHTML(page.label)}</button>`;
    }).join("");

    const mobileButtons = pageKeys().map(key => {
      const page = data.pages[key];
      return `<button type="button" class="nav-btn" data-route="${escapeHTML(key)}">${escapeHTML(page.label)} <span class="brand-route">${escapeHTML(page.route)}</span></button>`;
    }).join("");

    siteHeader.innerHTML = `
      <div class="header-inner">
        <button type="button" class="brand" data-route="home" aria-label="Go to home">
          <span class="brand-mark">K</span>
          <span>
            <span class="brand-name">${escapeHTML(data.site.brandName)}</span>
            <span class="brand-route" id="brandRoute">${escapeHTML(data.pages.home.route)}</span>
          </span>
        </button>

        <nav class="desktop-nav" aria-label="Main navigation">
          ${navButtons}
        </nav>

        <button type="button" class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false">
          <span id="menuIcon">☰</span>
        </button>
      </div>

      <div class="mobile-nav" id="mobileNav">
        <div class="mobile-nav-inner">
          ${mobileButtons}
        </div>
      </div>
    `;

    document.getElementById("menuToggle").addEventListener("click", () => {
      const mobileNav = document.getElementById("mobileNav");
      const menuToggle = document.getElementById("menuToggle");
      const menuIcon = document.getElementById("menuIcon");
      const isOpen = mobileNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuIcon.textContent = isOpen ? "×" : "☰";
    });
  }

  function renderFooter() {
    const links = data.site.footerLinks.map(link => `
      <a class="footer-link" href="${escapeHTML(resolveRef(link.href))}" ${String(resolveRef(link.href)).startsWith("mailto:") ? "" : "target=\"_blank\" rel=\"noreferrer\""}>${escapeHTML(link.prefix || "")} ${escapeHTML(link.label)}</a>
    `).join("");

    siteFooter.innerHTML = `
      <div class="wrap">
        <div class="footer-card">
          <div>
            <div class="eyebrow">Contact</div>
            <h2 class="section-title" style="font-size:clamp(2rem,4vw,3rem)">${escapeHTML(data.site.personName)}</h2>
          </div>

          <div class="footer-links">
            ${links}
          </div>
        </div>

        <div class="copyright">${escapeHTML(data.site.copyright)}</div>
      </div>
    `;
  }

  function hero(pageKey, actions = "") {
    const page = data.pages[pageKey];
    const tags = page.tags ? `<div class="tag-row">${page.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>` : "";
    return `
      <section class="wrap hero">
        <div class="hero-copy">
          <div class="pill">${escapeHTML(page.icon)} ${escapeHTML(page.eyebrow)}</div>
          <h1 class="hero-title">${escapeHTML(page.title)}</h1>
          <p class="hero-text">${escapeHTML(page.subtitle)}</p>
          ${actions}
          ${tags}
        </div>

        <div class="hero-media">
          ${imagePanel(page.image, page.label + " visual", "hero-img", page.imageFit)}
          ${pageKey === "home" ? "" : `<div class="route-badge">${escapeHTML(page.route)}</div>`}
        </div>
      </section>
    `;
  }

  function section(eyebrow, title, content, text = "") {
    return `
      <section class="wrap section">
        <div class="section-head">
          <div>
            ${eyebrow ? `<div class="eyebrow">${escapeHTML(eyebrow)}</div>` : ""}
            <h2 class="section-title">${escapeHTML(title)}</h2>
          </div>
          ${text ? `<p class="section-text">${escapeHTML(text)}</p>` : ""}
        </div>
        ${content}
      </section>
    `;
  }

  function miniCard(item) {
    return `
      <article class="card">
        ${item.kicker ? `<div class="kicker">${escapeHTML(item.kicker)}</div>` : ""}
        <h3 class="card-title">${escapeHTML(item.title)}</h3>
        <p class="card-text">${escapeHTML(item.text)}</p>
      </article>
    `;
  }

  function publicationCard(item) {
    return `
      <article class="publication">
        ${imagePanel(item.image, item.title)}
        <div class="publication-body">
          <div class="kicker">${escapeHTML(item.type)}</div>
          <h3 class="card-title">${escapeHTML(item.title)}</h3>
          <p class="card-text">${escapeHTML(item.text)}</p>
          <div class="link-row">${(item.links || []).map(externalButton).join("")}</div>
        </div>
      </article>
    `;
  }

  function experienceItem(item) {
    return `
      <article class="experience-item">
        <div class="experience-item-head">
          <div>
            <div class="kicker">${escapeHTML(item.org)}</div>
            <h3 class="card-title">${escapeHTML(item.role)}</h3>
          </div>
          <span class="date-chip">${escapeHTML(item.date)}</span>
        </div>
        <p class="card-text">${escapeHTML(item.text)}</p>
      </article>
    `;
  }

  function qualificationCard(q) {
    return `
      <article class="qualification">
        <div class="kicker">${escapeHTML(q.issuer)}</div>
        <h3>${escapeHTML(q.title)}</h3>
        <div class="chip-row">
          <span class="chip">Issued: ${escapeHTML(q.issued)}</span>
          ${q.status ? `<span class="chip">${escapeHTML(q.status)}</span>` : ""}
        </div>
        ${q.credential ? `<p class="fine">Credential ID: ${escapeHTML(q.credential)}</p>` : ""}
        ${q.skills ? `<p class="skills">Skills: ${escapeHTML(q.skills)}</p>` : ""}
      </article>
    `;
  }

  function awardsBlock() {
    return section("Awards", "Awards and recognition.", `
      <div class="grid grid-main">
        ${imagePanel("asset:trophy", "Trophy image", "", "contain")}
        <div class="grid">
          ${data.awards.map(award => `
            <article class="award">
              <div class="award-head">
                <div>
                  <div class="kicker">${escapeHTML(award.issuer)}</div>
                  <h3 class="card-title">${escapeHTML(award.title)}</h3>
                </div>
                <span class="date-chip">${escapeHTML(award.date)}</span>
              </div>
              <p class="card-text">${escapeHTML(award.text)}</p>
            </article>
          `).join("")}
        </div>
      </div>
    `);
  }

  function experienceAndQualifications() {
    return section("Experience & qualifications", "Public work, learning, and certificates.", `
      <div class="grid grid-main">
        <div class="grid">
          ${imagePanel("asset:experience", "Kaiden Jones experience visual", "", "contain")}
          ${data.experience.map(experienceItem).join("")}
        </div>
        <div class="grid grid-2">
          ${data.qualifications.map(qualificationCard).join("")}
        </div>
      </div>
    `);
  }

  function renderHome() {
    const heroActions = `
      <div class="hero-actions">
        ${data.home.heroButtons.map(button => `<button type="button" class="${button.style === "primary" ? "primary-btn" : "ghost-btn"}" data-route="${escapeHTML(button.route)}">${escapeHTML(button.label)}</button>`).join("")}
      </div>
    `;

    return `
      ${hero("home", heroActions)}

      ${section("Choose a route", "What are you here for?", `
        <div class="grid grid-3">
          ${data.home.routeCards.map(card => `
            <button type="button" class="route-card" data-route="${escapeHTML(card.key)}">
              ${imagePanel(card.image, card.title)}
              <div class="publication-body">
                <div class="kicker">${escapeHTML(data.pages[card.key].label)}</div>
                <h3 class="card-title">${escapeHTML(card.title)}</h3>
                <p class="card-text">${escapeHTML(card.text)}</p>
                <span class="open-line">Open →</span>
              </div>
            </button>
          `).join("")}
        </div>
      `)}

      ${section("About", "Independent creator and systems thinker.", `
        <div class="grid grid-3">
          ${data.home.aboutCards.map(miniCard).join("")}
        </div>
      `)}

      ${section("Selected work", "Publications and projects.", `
        <div class="grid grid-2">
          ${data.publications.map(publicationCard).join("")}
        </div>
      `)}

      ${experienceAndQualifications()}
      ${awardsBlock()}
    `;
  }

  function renderScience() {
    return `
      ${hero("science")}

      ${section("Research focus", "The framework in plain terms.", `
        <div class="grid grid-3">
          ${data.science.focusCards.map(miniCard).join("")}
        </div>
      `)}

      ${section("Half-Silvering works", "Research collection.", `
        <div class="grid grid-2">
          ${data.science.works.map(work => `
            <article class="card">
              <div class="kicker">${escapeHTML(work.source)}</div>
              <h3 class="card-title">${escapeHTML(work.title)}</h3>
              <p class="card-text">${escapeHTML(work.text)}</p>
              <div class="link-row">${externalButton({ label: "Open work", href: work.href })}</div>
            </article>
          `).join("")}
        </div>
      `)}

      ${section("Public work", "Experience connected to advocacy and research.", `
        <div class="grid grid-main">
          ${imagePanel("asset:experience", "Kaiden Jones public work visual", "", "contain")}
          <div class="grid">
            ${data.experience.map(experienceItem).join("")}
          </div>
        </div>
      `)}
    `;
  }

  function renderArt() {
    return `
      ${hero("art")}

      ${section("Artwork", "Selected exhibition text.", `
        <div class="grid grid-2">
          ${data.art.artworks.map(piece => `
            <article class="card">
              <div class="kicker">Artwork</div>
              <h3 class="card-title">${escapeHTML(piece.title)}</h3>
              <p class="card-text">${escapeHTML(piece.text)}</p>
              ${piece.image ? `<div class="art-image-after">${imagePanel(piece.image, piece.title)}</div>` : ""}
            </article>
          `).join("")}
        </div>
      `)}

      ${section("Practice", "The visual thread.", `
        <div class="grid grid-3">
          ${data.art.practiceCards.map(miniCard).join("")}
        </div>
      `)}
    `;
  }

  function renderWriting() {
    const writingPublications = data.publications.filter(item => item.title !== "The Half-Silvering Framework");
    return `
      ${hero("writing")}

      ${section("Writing", "Books, essays, and cultural analysis.", `
        <div class="grid grid-2">
          ${writingPublications.map(publicationCard).join("")}
        </div>
      `)}

      ${section("Philosophy", "Passing Thoughts and recurring themes.", `
        <div class="grid grid-2">
          ${data.writing.philosophy.map(item => `<div class="card"><p class="card-text" style="margin-top:0;color:#d6d3d1">${escapeHTML(item)}</p></div>`).join("")}
        </div>
      `)}

      ${section("Identity", "Writing as the bridge.", `
        <div class="card" style="border-radius:2.5rem;padding:clamp(1.5rem,4vw,2.5rem)">
          <p style="max-width:900px;font-size:clamp(1.5rem,4vw,2.6rem);line-height:1.12;letter-spacing:-.035em;font-weight:950">
            ${escapeHTML(data.writing.identityQuote)}
          </p>
        </div>
      `)}
    `;
  }

  function closeMenu() {
    const mobileNav = document.getElementById("mobileNav");
    const menuToggle = document.getElementById("menuToggle");
    const menuIcon = document.getElementById("menuIcon");
    if (!mobileNav || !menuToggle || !menuIcon) return;
    mobileNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuIcon.textContent = "☰";
  }

  function updateActiveButtons(route) {
    document.querySelectorAll("[data-route]").forEach(el => {
      if (el.classList.contains("nav-btn")) {
        el.classList.toggle("active", el.dataset.route === route);
      }
    });
    const brandRoute = document.getElementById("brandRoute");
    if (brandRoute) brandRoute.textContent = data.pages[route].route;
  }

  function bindRouteButtons() {
    document.querySelectorAll("[data-route]").forEach(el => {
      if (el.dataset.bound === "true") return;
      el.dataset.bound = "true";
      el.addEventListener("click", () => goTo(el.dataset.route));
    });
  }

  function render(route) {
    currentRoute = data.pages[route] ? route : "home";
    updateActiveButtons(currentRoute);
    app.innerHTML = currentRoute === "science" ? renderScience()
      : currentRoute === "art" ? renderArt()
      : currentRoute === "writing" ? renderWriting()
      : renderHome();

    document.title = currentRoute === "home"
      ? data.site.meta.title
      : `${data.pages[currentRoute].label} | ${data.site.personName}`;

    bindRouteButtons();
  }

  function goTo(route, pushHash = true) {
    const safeRoute = data.pages[route] ? route : "home";
    if (pushHash) {
      const hash = safeRoute === "home" ? "" : `#${safeRoute}`;
      if (window.location.hash !== hash) {
        history.pushState(null, "", hash || window.location.pathname);
      }
    }

    closeMenu();
    render(safeRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderError(error) {
    app.innerHTML = `
      <section class="error-state">
        <div class="error-card">
          <div class="eyebrow">Content could not load</div>
          <h1 class="section-title">The site could not read content.json.</h1>
          <p class="card-text">This usually happens if the file is opened directly from your computer instead of through a web server. Upload it to GitHub Pages or run a local server.</p>
          <code>${escapeHTML(error.message || error)}</code>
        </div>
      </section>
    `;
  }

  async function init() {
    try {
      const response = await fetch("content.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`content.json returned ${response.status}`);
      data = await response.json();

      document.title = data.site.meta.title;
      const description = document.querySelector('meta[name="description"]');
      if (description && data.site.meta.description) description.setAttribute("content", data.site.meta.description);

      renderHeader();
      renderFooter();
      currentRoute = routeFromHash();
      bindRouteButtons();
      render(currentRoute);

      window.addEventListener("popstate", () => {
        render(routeFromHash());
        window.scrollTo({ top: 0 });
      });

      window.addEventListener("hashchange", () => {
        const route = routeFromHash();
        if (route !== currentRoute) {
          render(route);
          window.scrollTo({ top: 0 });
        }
      });
    } catch (error) {
      renderError(error);
    }
  }

  init();
})();
