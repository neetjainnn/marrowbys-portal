/* Marrowby's Portal — clickable prototype. All data is illustrative. */
(function () {
  "use strict";

  // ---------- Helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const gbp = (n, dp = 2) => "£" + Number(n).toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const pad = (n) => String(n).padStart(2, "0");
  const isoDate = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const fmtLong = (d) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtShort = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const fmtDM = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const nowTime = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const seedOf = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600); }
  function confetti(container) {
    const colors = ["#9e642a", "#1f3117", "#d39a50", "#3f7a35", "#f6e8d4"];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "%";
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = Math.random() * 0.6 + "s";
      c.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
      container.appendChild(c);
    }
  }

  const ICON = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
    orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16"/><path d="M5 11c0-4 3-7 7-7s7 3 7 7"/><path d="M4 11v3a8 8 0 0 0 16 0v-3"/></svg>',
    rota: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 13.5h3M13.5 13.5h3M7.5 17h3"/></svg>',
    catering: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h18"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 7V5M10 5h4M2 20h20"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    billing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.5h9l4 4V21.5l-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5L6 20l0 0V2.5z"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>',
    marketing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    menu: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  };


  // Line icons (Lucide-style paths, 24px grid)
  const PATHS = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    pencil: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    rain: '<path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24"/><path d="M16 14v6M8 14v6M12 16v6"/>',
    cloudsun: '<path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.95 12.65a4 4 0 0 0-5.93-4.13"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
    coffee: '<path d="M10 2v2M14 2v2M6 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3M12 8v3M17 8v3"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
    list: '<path d="M3 6h.01M3 12h.01M3 18h.01M8 6h13M8 12h13M8 18h13"/>',
    down: '<path d="M22 17 13.5 8.5l-5 5L2 7"/><path d="M16 17h6v-6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  };
  const svg = (n, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[n] || ""}</svg>`;

  // ---------- App state ----------
  const SHOP = { name: "Ramsbottom", code: "RAM", no: 17 };
  const S = {
    user: store.get("mb_user"),
    view: store.get("mb_view") || "overview",
    navOpen: false,
    orders: { step: "form", date: isoDate(new Date()), event: "", data: null, change: "", sentAt: null },
    rota: { step: "form", start: isoDate(new Date()), note: "", applied: [], publishedAt: null },
    catering: { step: "form", mode: "type", text: "", file: null, quote: null, change: "", applied: [] },
    email: { step: "start", sent: {}, open: {} },
    billing: { step: "upload", file: null, bill: null, editing: false },
    marketing: { step: "form", format: "poster", product: "Eccles cake", brief: "", approved: false },
  };

  const NAV = [
    { id: "overview", label: "Overview", icon: "home" },
    { group: "Phase 1", tag: "Live" },
    { id: "orders", label: "Daily Orders", icon: "orders" },
    { id: "rota", label: "Weekly Rotas", icon: "rota" },
    { id: "catering", label: "Catering Orders", icon: "catering" },
    { group: "Phase 2", tag: "Preview" },
    { id: "email", label: "Email Campaigns", icon: "email" },
    { id: "billing", label: "Billing", icon: "billing" },
    { id: "marketing", label: "Marketing", icon: "marketing" },
  ];

  // ---------- Render root ----------
  function render() {
    const app = $("#app");
    if (!S.user) { app.innerHTML = loginView(); $("#login-email").focus(); return; }
    app.innerHTML = shellView();
    const content = $("#content");
    content.innerHTML = (VIEWS[S.view] || VIEWS.overview)();
    afterRender();
    window.scrollTo(0, 0);
  }
  function rerenderContent(quiet) {
    const content = $("#content");
    if (!content) return render();
    content.classList.toggle("no-anim", !!quiet);
    content.innerHTML = (VIEWS[S.view] || VIEWS.overview)();
    afterRender();
  }
  function afterRender() {
    // file inputs + drag/drop
    document.querySelectorAll("[data-drop]").forEach((zone) => {
      const input = zone.querySelector("input[type=file]");
      const target = zone.getAttribute("data-drop");
      zone.addEventListener("click", (e) => { if (e.target !== input) input.click(); });
      input.addEventListener("change", () => { if (input.files[0]) onFile(target, input.files[0].name); });
      zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
      zone.addEventListener("drop", (e) => { e.preventDefault(); zone.classList.remove("drag"); const f = e.dataTransfer.files[0]; if (f) onFile(target, f.name); });
    });
  }
  function onFile(target, name) {
    if (target === "catering") { S.catering.file = name; rerenderContent(true); }
    if (target === "billing") { S.billing.file = name; rerenderContent(true); }
  }

  // ---------- Login ----------
  function loginView() {
    return `
    <div class="login-wrap">
      <div class="login-art">
        <img src="assets/logo-badge.png" alt="Marrowby's Bakery, since 1978">
        <div class="tagline">Staff portal for our 40 shops and the central bakery</div>
      </div>
      <div class="login-panel">
        <form class="login-card" id="login-form" autocomplete="off">
          <span class="proto-pill">Prototype · illustrative data</span>
          <div>
            <h1>Welcome back</h1>
            <p class="muted" style="margin:6px 0 0">Sign in to the Marrowby's staff portal.</p>
          </div>
          <label class="field">Work email
            <input class="input" id="login-email" type="text" placeholder="name@marrowbys.co.uk">
          </label>
          <label class="field">Password
            <input class="input" id="login-pass" type="password" placeholder="••••••••">
          </label>
          <button class="btn btn-primary" type="submit">Log in</button>
          <p class="muted small" style="margin:0;text-align:center">Prototype: any email and password will work.</p>
        </form>
      </div>
    </div>`;
  }
  function nameFromEmail(email) {
    const local = (email || "").split("@")[0].trim();
    if (!local) return "Sarah Holt";
    const parts = local.split(/[._\-\s]+/).filter(Boolean).slice(0, 2);
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
  }

  // ---------- Shell ----------
  function shellView() {
    const nav = NAV.map((n) => {
      if (n.group) return `<div class="nav-group">${n.group}<span class="tag">${n.tag}</span></div>`;
      return `<button class="nav-item ${S.view === n.id ? "active" : ""}" data-act="nav" data-id="${n.id}">${ICON[n.icon]}<span>${n.label}</span></button>`;
    }).join("");
    const cur = NAV.find((n) => n.id === S.view) || NAV[0];
    const initials = S.user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
    return `
    <div class="shell">
      <aside class="sidebar ${S.navOpen ? "open" : ""}">
        <div class="brand">
          <div class="brand-mark"><img src="assets/roll.png" alt=""></div>
          <div><div class="brand-name">MARROWBY'S</div><div class="brand-sub">Staff Portal</div></div>
        </div>
        ${nav}
        <div class="sidebar-foot">
          <div class="who">${esc(S.user.name)}</div>
          <div>Shop manager · ${SHOP.name}</div>
          <button data-act="logout">Log out</button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <div class="row" style="gap:10px">
            <button class="btn btn-ghost btn-sm menu-toggle" data-act="toggle-nav" aria-label="Menu">${ICON.menu}</button>
            <div class="crumbs">Portal / <b>${cur.label}</b></div>
          </div>
          <div class="topbar-right">
            <span class="proto-pill hide-sm">Prototype · illustrative data</span>
            <span class="shop-chip hide-sm"><span class="dot"></span>Shop ${SHOP.no} · ${SHOP.name}</span>
            <span class="avatar" title="${esc(S.user.name)}">${esc(initials)}</span>
          </div>
        </header>
        <main class="content" id="content"></main>
      </div>
    </div>`;
  }

  function pageHead(eyebrow, title, sub, right = "") {
    return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${right}</div>`;
  }
  function loadingView(title, steps) {
    return `<div class="card fade-in"><div class="loading">
      <img src="assets/roll.png" alt="">
      <h3>${title}</h3>
      <div class="steps">${steps.map((s, i) => `<div style="animation-delay:${i * 0.45}s">${s}</div>`).join("")}</div>
    </div></div>`;
  }

  // =====================================================
  // OVERVIEW
  // =====================================================
  function overviewView() {
    const first = S.user.name.split(" ")[0];
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const mods = [
      ["orders", "Daily Orders", "Tomorrow's suggested bake for your shop, ready to send to the central bakery.", "Phase 1"],
      ["rota", "Weekly Rotas", "A 7-day rota drafted from the same forecast, with lunch-peak cover built in.", "Phase 1"],
      ["catering", "Catering Orders", "Type or upload an order and get a priced quote in about 4 minutes.", "Phase 1"],
      ["email", "Email Campaigns", "Offer emails based on what each loyalty member buys.", "Phase 2"],
      ["billing", "Billing", "Upload a supplier bill and check the lines OCR reads from it.", "Phase 2"],
      ["marketing", "Marketing", "Draft posters, labels and posts in the house style for approval.", "Phase 2"],
    ];
    return `<div class="fade-in stack" style="gap:22px">
      <div class="hero">
        <img class="roll-bg" src="assets/roll.png" alt="">
        <div style="position:relative">
          <div class="eyebrow" style="color:#d8b88d">${fmtLong(new Date())}</div>
          <h1>${greet}, ${esc(first)}</h1>
          <p>Tomorrow's suggested order for ${SHOP.name} is ready. Change any line before you send it.</p>
        </div>
        <button class="btn btn-accent btn-lg" data-act="nav" data-id="orders" style="position:relative">Review tomorrow's order</button>
      </div>

      <div class="grid g4">
        <div class="card kpi"><div class="label">Food binned this week</div><div class="value">£612 <small>this shop</small></div><div class="delta up">${svg("down")} 24% vs same week last year</div></div>
        <div class="card kpi"><div class="label">Sold out before 5pm</div><div class="value">3 <small>items this week</small></div><div class="delta up">${svg("down")} from 11 before the pilot</div></div>
        <div class="card kpi"><div class="label">Forecast accuracy, last 7 days</div><div class="value">92%</div><div class="delta muted">You overrode 6 lines, all logged</div></div>
        <div class="card kpi"><div class="label">Your hours back this week</div><div class="value">2.1 <small>hrs</small></div><div class="delta muted">Rota drafted for you</div></div>
      </div>

      <div class="grid g2">
        <div class="card card-pad">
          <div class="row" style="justify-content:space-between"><h3>Pilot shops vs control shops</h3><span class="badge b-green">Gate 1 passed</span></div>
          <p class="muted small" style="margin:4px 0 14px">Waste reduction after 3 months. 5 pilot shops vs 5 control shops.</p>
          ${bar("Pilot shops (using the forecast)", 22, "var(--ok)")}
          ${bar("Control shops (ordering as before)", 3, "#b0a891")}
          ${bar("Break-even for the whole tool", 7.5, "var(--caramel)", true)}
        </div>
        <div class="card card-pad">
          <h3>Where your freed hours go</h3>
          <p class="muted small" style="margin:4px 0 14px">Agreed in advance. Per manager, per week.</p>
          <div class="stack" style="gap:10px">
            <div class="note note-cream"><b>1 hr</b>&nbsp;on the shop floor, 11am–2pm lunch rush</div>
            <div class="note note-cream"><b>30 min</b>&nbsp;coaching one named team member</div>
            <div class="note note-cream"><b>30 min</b>&nbsp;reviewing and overriding the AI's order</div>
          </div>
        </div>
      </div>

      <div>
        <h2 style="margin-bottom:12px">Tools</h2>
        <div class="grid g3">
          ${mods.map(([id, t, d, ph]) => `<div class="card mod-card" data-act="nav" data-id="${id}">
            <div class="row" style="justify-content:space-between"><div class="ic">${ICON[id]}</div><span class="badge ${ph === "Phase 1" ? "b-green" : "b-grey"}">${ph}</span></div>
            <h3>${t}</h3><p>${d}</p></div>`).join("")}
        </div>
      </div>
      <p class="muted small">Prototype for the P2P Pioneers pitch. Marrowby's is a fictional business and every number here is illustrative.</p>
    </div>`;
  }
  function bar(label, pct, color, dashed) {
    return `<div style="margin-bottom:12px">
      <div class="row small" style="justify-content:space-between"><span>${label}</span><b style="color:var(--green)">${pct}%</b></div>
      <div class="progress" style="background:#efe7d6"><div style="width:${pct * 3}%;background:${color};${dashed ? "background:repeating-linear-gradient(90deg,var(--caramel) 0 8px,transparent 8px 12px)" : ""}"></div></div>
    </div>`;
  }

  // =====================================================
  // DAILY ORDERS
  // =====================================================
  const PRODUCTS = [
    { cat: "Bread", name: "White bloomer", base: 28 },
    { cat: "Bread", name: "Sourdough loaf", base: 22 },
    { cat: "Bread", name: "Granary loaf", base: 16 },
    { cat: "Bread", name: "Soft white rolls (6)", base: 18 },
    { cat: "Savoury", name: "Sausage roll", base: 96 },
    { cat: "Savoury", name: "Steak bake", base: 54 },
    { cat: "Savoury", name: "Cheese & onion pasty", base: 42 },
    { cat: "Savoury", name: "Chicken & mushroom slice", base: 30 },
    { cat: "Sandwiches", name: "Ham & cheese", base: 36 },
    { cat: "Sandwiches", name: "Chicken salad", base: 32 },
    { cat: "Sandwiches", name: "Egg mayo", base: 24 },
    { cat: "Sandwiches", name: "Cheese & pickle", base: 20 },
    { cat: "Sandwiches", name: "BLT", base: 22 },
    { cat: "Sweet", name: "Butter croissant", base: 34 },
    { cat: "Sweet", name: "Pain au chocolat", base: 28 },
    { cat: "Sweet", name: "Cinnamon swirl", base: 30 },
    { cat: "Sweet", name: "Eccles cake", base: 24 },
    { cat: "Sweet", name: "Iced finger bun", base: 26 },
    { cat: "Sweet", name: "Vanilla slice", base: 18 },
    { cat: "Sweet", name: "Fruit scone", base: 20 },
    { cat: "Sweet", name: "Chocolate brownie", base: 22 },
    { cat: "Sweet", name: "Victoria sponge (whole)", base: 4 },
  ];
  function weatherFor(d) {
    const r = rng(seedOf("wx" + isoDate(d)));
    const m = d.getMonth();
    const baseT = [5, 6, 8, 11, 14, 17, 19, 19, 16, 12, 8, 6][m];
    const opts = m >= 4 && m <= 8
      ? [["Sunny and warm", "sun", "warm", 4], ["Sunny spells", "cloudsun", "mild", 1], ["Showers", "rain", "wet", -2], ["Cloudy", "cloud", "mild", 0]]
      : [["Light rain", "rain", "wet", 0], ["Cloudy and cold", "cloud", "cold", -2], ["Bright but chilly", "cloudsun", "cold", 0], ["Heavy showers", "rain", "wet", 1]];
    const o = opts[Math.floor(r() * opts.length)];
    return { text: o[0], icon: o[1], kind: o[2], temp: baseT + o[3] + Math.round(r() * 2), rain: o[2] === "wet" ? 60 + Math.round(r() * 30) : 10 + Math.round(r() * 20) };
  }
  function buildOrder(dateStr, eventText) {
    const d = parseISO(dateStr);
    const target = addDays(d, 1); // order is for the next day
    const dow = target.getDay();
    const wx = weatherFor(target);
    const r = rng(seedOf("ord" + dateStr));
    const ev = eventText.trim();
    const items = PRODUCTS.map((p) => {
      let f = 1, reasons = [];
      if (dow === 6) { f *= p.cat === "Sweet" || p.cat === "Bread" ? 1.22 : 1.05; reasons.push("Saturday trade"); }
      if (dow === 0) { f *= 0.78; reasons.push("Sunday, shorter hours"); }
      if (dow === 1) { f *= 0.92; }
      if (wx.kind === "wet" || wx.kind === "cold") {
        if (p.cat === "Savoury") { f *= 1.1; reasons.push(wx.kind === "wet" ? "Rain: hot savouries up" : "Cold: hot savouries up"); }
        if (p.cat === "Sandwiches") f *= 0.93;
      }
      if (wx.kind === "warm") {
        if (p.cat === "Sandwiches") { f *= 1.12; reasons.push("Warm day: sandwiches up"); }
        if (p.cat === "Savoury") f *= 0.9;
      }
      if (ev) {
        if (p.cat === "Savoury" || p.cat === "Sandwiches") { f *= 1.18; reasons.push("Your event note"); }
        else if (p.cat === "Sweet") { f *= 1.08; }
      }
      const lastSold = Math.max(1, Math.round(p.base * (dow === 6 ? 1.15 : dow === 0 ? 0.8 : 1) * (0.88 + r() * 0.2)));
      const soldOut = r() < 0.28 && p.base > 10;
      const leftover = soldOut ? 0 : Math.round(r() * Math.max(2, p.base * 0.16));
      const soldOutAt = soldOut ? `${14 + Math.floor(r() * 3)}:${pad(Math.floor(r() * 6) * 10)}` : null;
      let adj = 1;
      if (soldOut) { adj = 1.07; reasons.unshift(`Sold out ${soldOutAt} last week`); }
      else if (leftover >= Math.max(3, p.base * 0.1)) { adj = 0.93; reasons.unshift(`${leftover} binned last week`); }
      const suggested = Math.max(1, Math.round(p.base * f * adj));
      return { ...p, lastSold, leftover, soldOutAt, suggested, qty: suggested, reason: reasons[0] || "In line with usual demand" };
    });
    return { date: dateStr, target: isoDate(target), wx, event: ev, items, ref: `${SHOP.code}-${pad(target.getMonth() + 1)}${pad(target.getDate())}-${100 + Math.floor(r() * 800)}` };
  }

  function ordersView() {
    const O = S.orders;
    const head = pageHead("Phase 1 · Daily Orders", "Tomorrow's order", "Suggested quantities for each product, based on till sales, the weather forecast and local events. Change any number you disagree with, then send the order to the central bakery by 7pm.");
    if (O.step === "loading") return head + loadingView("Forecasting tomorrow's bake…", ["Read today's till sales for " + SHOP.name, "Checked tomorrow's weather", "Checked the local calendar and your event note", "Compared with last week's leftovers and sell-outs"]);
    if (O.step === "baking") return head + bakingView();
    const form = `
      <div class="card card-pad fade-in">
        <div class="form-strip">
          <label class="field">Order date<span class="hint">As-on date. The order is for the next day.</span>
            <input class="input" type="date" id="o-date" value="${esc(O.date)}">
          </label>
          <label class="field">Anything happening tomorrow?<span class="hint">Events, roadworks, a school trip, a football match… (optional)</span>
            <input class="input" id="o-event" value="${esc(O.event)}" placeholder="e.g. Ramsbottom Chocolate Festival in the square, 10am–4pm">
          </label>
          <button class="btn btn-primary btn-lg" data-act="o-generate">${O.data ? "Regenerate" : "Generate order"}</button>
        </div>
      </div>`;
    if (O.step === "form" || !O.data) {
      return head + form + `
      <div class="grid g3" style="margin-top:18px">
        <div class="card kpi"><div class="label">Suggestion arrives</div><div class="value">17:30</div><div class="delta muted">every evening, send by 19:00</div></div>
        <div class="card kpi"><div class="label">Last week's accuracy</div><div class="value">92%</div><div class="delta muted">forecast vs what actually sold</div></div>
        <div class="card kpi"><div class="label">Waste vs sell-out, last 7 days</div><div class="value">£612 <small>/ 3 sell-outs</small></div><div class="delta up">both falling</div></div>
      </div>`;
    }
    return head + form + orderSheet();
  }

  function orderSheet() {
    const O = S.orders, D = O.data;
    const t = parseISO(D.target);
    const total = D.items.reduce((a, i) => a + Number(i.qty || 0), 0);
    const lastTotal = D.items.reduce((a, i) => a + i.lastSold, 0);
    const overridden = D.items.filter((i) => Number(i.qty) !== i.suggested).length;
    let cat = "";
    const rows = D.items.map((i, idx) => {
      const head = i.cat !== cat ? `<tr class="cat"><td colspan="5">${i.cat}</td></tr>` : "";
      cat = i.cat;
      const sig = i.soldOutAt ? `<span class="badge b-red">Sold out ${i.soldOutAt}</span>` : i.leftover > 0 ? `<span class="badge b-amber">${i.leftover} left over</span>` : `<span class="badge b-green">Sold through</span>`;
      const changed = Number(i.qty) !== i.suggested;
      return head + `<tr>
        <td><b>${esc(i.name)}</b><div class="small muted">${esc(i.reason)}</div></td>
        <td class="num">${i.lastSold}</td>
        <td>${sig}</td>
        <td class="num"><input class="qty-input" type="number" min="0" value="${i.qty}" data-qty="${idx}" aria-label="Quantity for ${esc(i.name)}"></td>
        <td>${changed ? `<span class="badge b-caramel">You changed (was ${i.suggested})</span>` : `<span class="badge b-grey">AI suggestion</span>`}</td>
      </tr>`;
    }).join("");
    return `
      <div class="card fade-in" style="margin-top:18px">
        <div class="card-head">
          <div><div class="eyebrow" style="margin:0">Order ${esc(D.ref)} · to Central Bakery</div><h2>${SHOP.name} order for ${fmtLong(t)}</h2></div>
          <span class="badge b-green">Ready to send</span>
        </div>
        <div class="sheet-meta">
          <div><div class="k">Date</div><div class="v">${fmtShort(t)}<small>Delivered by 06:30</small></div></div>
          <div><div class="k">Weather</div><div class="v">${svg(D.wx.icon, "wx")} ${D.wx.text}<small>${D.wx.temp}°C · ${D.wx.rain}% chance of rain</small></div></div>
          <div><div class="k">Any event</div><div class="v" style="font-size:17px">${D.event ? esc(D.event) : "None noted"}<small>${D.event ? "Savouries and sandwiches raised" : "Normal day"}</small></div></div>
          <div><div class="k">Total items</div><div class="v">${total}<small>Last week same day sold ${lastTotal}</small></div></div>
        </div>
        <div class="table-wrap">
          <table class="t">
            <thead><tr><th>Product</th><th class="num">Sold last week</th><th>Last week</th><th class="num">Order qty</th><th>Status</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="card-foot stack">
          <label class="field">Any change?<span class="hint">Tell the bakery anything extra, or say why you changed a number. Changes are logged and used to improve the next forecast.</span>
            <textarea class="input" id="o-change" placeholder="e.g. Add 12 extra sausage rolls for the school trip at 11am. Cut granary, the regular who buys 4 is on holiday.">${esc(S.orders.change)}</textarea>
          </label>
          <div class="row" style="justify-content:space-between">
            <span class="small muted">${overridden ? `${overridden} line${overridden > 1 ? "s" : ""} changed by you · ` : ""}You keep the final say.</span>
            <button class="btn btn-accent btn-lg" data-act="o-send">Send to Central Bakery</button>
          </div>
        </div>
      </div>`;
  }

  function bakingView() {
    const O = S.orders, D = O.data, t = parseISO(D.target);
    const total = D.items.reduce((a, i) => a + Number(i.qty || 0), 0);
    const changed = D.items.filter((i) => Number(i.qty) !== i.suggested);
    let cat = "";
    const list = D.items.map((i) => {
      const h = i.cat !== cat ? `<tr class="cat"><td colspan="2">${i.cat}</td></tr>` : "";
      cat = i.cat;
      return h + `<tr><td>${esc(i.name)}${Number(i.qty) !== i.suggested ? ' <span class="badge b-caramel">changed</span>' : ""}</td><td class="num qty">${i.qty}</td></tr>`;
    }).join("");
    const steps = [
      ["Forecast ready", "this evening", "done"],
      ["You sent it", O.sentAt, "done"],
      ["Bakery accepted", O.sentAt, "done"],
      ["Baking overnight", "22:00 – 04:30", "now"],
      ["On your shelves", "by 06:30, Van 4", ""],
    ];
    return `<div class="stack fade-in" style="gap:18px">
      <div class="oven">
        <div class="oven-icon">${svg("flame")}</div>
        <div style="flex:1">
          <div class="eyebrow" style="margin:0">Order ${esc(D.ref)} · received by Central Bakery</div>
          <h2>Baking now: ${total} items for ${SHOP.name}</h2>
          <div class="small muted">In tonight's bake for ${fmtLong(t)}. ${changed.length ? `${changed.length} of your changes are included and logged.` : "Sent exactly as suggested."}</div>
          <div class="progress"><div id="bake-bar" style="width:8%"></div></div>
        </div>
      </div>
      <div class="card card-pad">
        <div class="timeline">${steps.map((s, i) => `<div class="tl-step ${s[2]}"><div class="tl-dot">${s[2] === "done" ? svg("check") : ""}</div><div><div class="t">${s[0]}</div><div class="s">${s[1]}</div></div></div>`).join("")}</div>
      </div>
      <div class="grid g2" style="align-items:start">
        <div class="card">
          <div class="card-head"><h3>Bake ticket</h3><span class="badge b-caramel">${esc(D.ref)}</span></div>
          <div class="card-pad stack" style="gap:8px">
            <div class="doc kv" style="padding:0;border:0"><div class="kv">
              <span>Date</span><span><b>${fmtLong(t)}</b></span>
              <span>Weather</span><span>${svg(D.wx.icon)} ${D.wx.text}, ${D.wx.temp}°C</span>
              <span>Any event</span><span>${D.event ? esc(D.event) : "None"}</span>
              <span>Shop note</span><span>${O.change ? esc(O.change) : "None"}</span>
            </div></div>
          </div>
          <div class="table-wrap"><table class="t"><tbody>${list}</tbody><tfoot><tr><td>Total</td><td class="num">${total}</td></tr></tfoot></table></div>
        </div>
        <div class="stack">
          <div class="card card-pad">
            <h3>What happens next</h3>
            <div class="stack small" style="gap:10px;margin-top:12px">
              <div class="note note-cream">Bakers start your order at 22:00, with the orders from the other 39 shops.</div>
              <div class="note note-cream">Van 4 loads at 05:15. ${SHOP.name} is its second stop because your bread sales start at 7am.</div>
              <div class="note note-cream">At 17:30 tomorrow you can compare the forecast with what actually sold.</div>
            </div>
          </div>
          <div class="row">
            <button class="btn btn-ghost" data-act="o-new">Start a new order</button>
            <button class="btn btn-primary" data-act="nav" data-id="rota">Next: weekly rota</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  // =====================================================
  // WEEKLY ROTAS
  // =====================================================
  const SHIFTS = {
    E: { t: "06:30–14:30", l: "Lunch 10:45", cls: "s-early", h: 7.5 },
    M: { t: "10:00–17:00", l: "Lunch 14:30", cls: "s-mid", h: 6.5 },
    L: { t: "12:00–18:30", l: "Lunch 15:30", cls: "s-late", h: 6 },
    P: { t: "11:00–15:00", l: "No break", cls: "s-mid", h: 4 },
    O: null,
  };
  // pattern indexed Mon..Sun
  function staffList() {
    const ov = S.rota.overrides || {};
    return baseStaff().map((e) => {
      const o = ov[e.id]; if (!o) return e;
      const p = [...e.p]; Object.keys(o).forEach((i) => (p[i] = o[i]));
      return { ...e, p: p.join("") };
    });
  }
  // Light-touch note reading: "Megan off Thursday" → that shift becomes Off
  function applyRotaNote(note) {
    const n = note.toLowerCase();
    if (!/\boff\b|holiday|can't|cannot|sick|appointment/.test(n)) return;
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    S.rota.overrides = S.rota.overrides || {};
    baseStaff().forEach((e) => {
      if (!n.includes(e.name.split(" ")[0].toLowerCase())) return;
      days.forEach((d, i) => { if (new RegExp("\\b" + d).test(n)) { (S.rota.overrides[e.id] = S.rota.overrides[e.id] || {})[i] = "O"; } });
    });
  }
  function baseStaff() {
    return [
      { id: "MB-RAM-001", name: S.user ? S.user.name : "Sarah Holt", role: "Shop manager", p: "EMEMEOO" },
      { id: "MB-RAM-004", name: "Priya Shah", role: "Assistant manager", p: "OOEMEEM" },
      { id: "MB-RAM-007", name: "Tom Whitworth", role: "Team leader", p: "EEOOLEE" },
      { id: "MB-RAM-011", name: "Aisha Begum", role: "Sales assistant", p: "MMLOOMM" },
      { id: "MB-RAM-012", name: "Callum Price", role: "Sales assistant", p: "LLMMOOL" },
      { id: "MB-RAM-015", name: "Megan Doyle", role: "Sales assistant", p: "OLLEMMO" },
      { id: "MB-RAM-018", name: "Jakub Nowak", role: "Sales assistant", p: "EOEELLO" },
      { id: "MB-RAM-021", name: "Hannah Lees", role: "Sales assistant (PT)", p: "PPOPPPO" },
      { id: "MB-RAM-023", name: "Ryan Ashworth", role: "Sales assistant (PT)", p: "OPPOPPP" },
      { id: "MB-RAM-026", name: "Zara Ahmed", role: "Weekend assistant", p: "OOOOOLE" },
    ];
  }
  const covers = (code, from, to) => {
    const s = SHIFTS[code]; if (!s) return false;
    const [a, b] = s.t.split("–").map((x) => { const [h, m] = x.split(":").map(Number); return h + m / 60; });
    return a <= from && b >= to;
  };

  function rotaView() {
    const R = S.rota;
    const head = pageHead("Phase 1 · Weekly Rotas", "Weekly rota", "Choose the first day of the week. The draft uses the same sales forecast as the daily order, so it puts more staff on between 12 and 2pm and schedules no breaks in that window.");
    if (R.step === "loading") return head + loadingView("Drafting the week…", ["Read the 7-day demand forecast", "Checked contracted hours and availability", "Kept 12–2pm breaks clear for the lunch rush", "Balanced early and late shifts fairly"]);
    if (R.step === "published") return head + rotaPublished();
    const form = `<div class="card card-pad fade-in">
      <div class="form-strip" style="grid-template-columns:220px 1fr auto">
        <label class="field">Week starting<span class="hint">7 days are counted from this date</span><input class="input" type="date" id="r-start" value="${esc(R.start)}"></label>
        <div class="small muted" style="align-self:center">${(() => { const s = parseISO(R.start); return `Covers <b style="color:var(--green)">${fmtShort(s)}</b> to <b style="color:var(--green)">${fmtShort(addDays(s, 6))}</b>`; })()}</div>
        <button class="btn btn-primary btn-lg" data-act="r-generate">${R.step === "draft" ? "Regenerate" : "Generate rota"}</button>
      </div></div>`;
    if (R.step !== "draft") {
      return head + form + `<div class="grid g3" style="margin-top:18px">
        <div class="card kpi"><div class="label">Time to write it by hand</div><div class="value">3 <small>hrs a week</small></div><div class="delta muted">what managers spent before</div></div>
        <div class="card kpi"><div class="label">Time to review a draft</div><div class="value">~1 <small>hr</small></div><div class="delta up">about 2 hrs back each week</div></div>
        <div class="card kpi"><div class="label">Across all 40 shops</div><div class="value">4,368 <small>hrs a year</small></div><div class="delta muted">about 2.3 full-time managers</div></div>
      </div>`;
    }
    return head + form + rotaTable();
  }

  function rotaTable() {
    const R = S.rota, start = parseISO(R.start);
    const days = [...Array(7)].map((_, i) => addDays(start, i));
    const staff = staffList();
    const dayIdx = (d) => (d.getDay() + 6) % 7; // Mon=0
    const rows = staff.map((e) => {
      let hrs = 0;
      const cells = days.map((d) => {
        const code = e.p[dayIdx(d)], s = SHIFTS[code];
        if (!s) return `<td><span class="s-off">Off</span></td>`;
        hrs += s.h;
        return `<td><span class="shift ${s.cls}"><span class="time">${s.t}</span><span class="lunch">${s.l}</span></span></td>`;
      }).join("");
      return `<tr><td><span class="empid">${e.id}</span></td><td><b>${esc(e.name)}</b><div class="small muted">${e.role}</div></td>${cells}<td class="num"><b>${hrs}</b></td></tr>`;
    }).join("");
    const peak = days.map((d) => staff.filter((e) => covers(e.p[dayIdx(d)], 12, 14)).length);
    const totalHrs = staff.reduce((a, e) => a + days.reduce((b, d) => b + (SHIFTS[e.p[dayIdx(d)]] ? SHIFTS[e.p[dayIdx(d)]].h : 0), 0), 0);
    return `
    <div class="card fade-in" style="margin-top:18px">
      <div class="card-head">
        <div><div class="eyebrow" style="margin:0">Draft · ${SHOP.name}</div><h2>${fmtDM(days[0])} – ${fmtDM(days[6])}</h2></div>
        <div class="legend"><span><i style="background:#eef3e7"></i>Early</span><span><i style="background:#fbf0d9"></i>Mid / lunch cover</span><span><i style="background:#efe9f5"></i>Late</span></div>
      </div>
      ${R.applied.length ? `<div style="padding:14px 24px 0"><div class="note note-green"><span>Applied your changes: ${R.applied.map(esc).join(" · ")}</span></div></div>` : ""}
      <div class="table-wrap">
        <table class="t rota">
          <thead><tr><th>Employee ID</th><th>Name</th>${days.map((d) => `<th>${fmtShort(d)}</th>`).join("")}<th class="num">Hrs</th></tr></thead>
          <tbody>${rows}
            <tr class="peak-row"><td></td><td>On floor 12–2pm<div class="small muted" style="font-weight:400">lunch rush cover</div></td>${peak.map((p) => `<td>${p} staff ${p >= 5 ? svg("check", "ok") : ""}</td>`).join("")}<td class="num">${totalHrs}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card-foot">
        <div class="grid g2" style="align-items:start">
          <div class="stack" style="gap:10px">
            <label class="field">Any change?<span class="hint">For example a swap, a holiday or a shift someone can't do.</span>
              <textarea class="input" id="r-note" placeholder="e.g. Megan is off Thursday for a hospital appointment. Give Callum an early on Saturday.">${esc(R.note)}</textarea>
            </label>
            <div class="row"><button class="btn btn-ghost" data-act="r-regen">${svg("refresh")} Regenerate with changes</button><span class="spacer"></span><button class="btn btn-accent btn-lg" data-act="r-publish">Publish rota</button></div>
          </div>
          <div class="card card-pad" style="box-shadow:none">
            <div class="row" style="justify-content:space-between"><h3>Your 2 hours back this week</h3><span class="badge b-green">+2.1 hrs</span></div>
            <div class="stack small" style="gap:8px;margin-top:10px">
              <div class="note note-cream"><b>1 hr</b>&nbsp;on the floor in the 11am–2pm rush (built into your shifts)</div>
              <div class="note note-cream"><b>30 min</b>&nbsp;coaching Callum Price, Wed 15:00, logged</div>
              <div class="note note-cream"><b>30 min</b>&nbsp;reviewing the daily order and logging overrides</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
  function rotaPublished() {
    const R = S.rota, s = parseISO(R.start);
    return `<div class="card fade-in"><div class="success" id="celebrate">
      <div class="tick">${svg("check")}</div>
      <h2>Rota published, team ready</h2>
      <p>The ${fmtDM(s)} – ${fmtDM(addDays(s, 6))} rota for ${SHOP.name} is live. All 10 staff can now see their shifts and lunch breaks on their phones.</p>
      <div class="grid g4" style="max-width:760px;margin:28px auto 0;text-align:left">
        <div class="card kpi"><div class="label">Staff notified</div><div class="value">10</div></div>
        <div class="card kpi"><div class="label">Hours scheduled</div><div class="value">${staffList().reduce((a, e) => a + [...e.p].reduce((b, c) => b + (SHIFTS[c] ? SHIFTS[c].h : 0), 0), 0)}</div></div>
        <div class="card kpi"><div class="label">Lunch rush covered</div><div class="value">7/7 <small>days</small></div></div>
        <div class="card kpi"><div class="label">Your time on it</div><div class="value">~1 <small>hr, not 3</small></div></div>
      </div>
      <div class="row" style="justify-content:center;margin-top:26px">
        <button class="btn btn-ghost" data-act="r-edit">View or edit rota</button>
        <button class="btn btn-primary" data-act="nav" data-id="catering">Next: catering orders</button>
      </div>
    </div></div>`;
  }

  // =====================================================
  // CATERING
  // =====================================================
  const SAMPLE_CALL = `Call from Joanne Pryce, Halton & Pryce Solicitors, Bolton (01204 000 412).
Lunch for a client seminar next Friday, about 45 people.
Mixed sandwiches, some sausage rolls, something sweet, and tea & coffee.
2 guests are gluten free and 1 is vegan.
Deliver to Silverwell St, Bolton BL1 by 12:15. Invoice the firm.`;

  function buildQuote(text) {
    const m = text.match(/(\d{1,4})\s*(people|guests|pax|persons|heads|attendees)/i);
    const guests = m ? Math.min(400, Math.max(5, parseInt(m[1], 10))) : 45;
    const k = guests / 45;
    const n = (x) => Math.max(1, Math.round(x * k));
    const lines = [
      { item: "Mixed sandwich platter (serves 10)", qty: n(4), unit: 38 },
      { item: "Mini sausage roll platter (24 pieces)", qty: n(2), unit: 22 },
      { item: "Gluten-free & vegan platter (serves 3)", qty: 1, unit: 24, flag: true },
      { item: "Seasonal fruit platter (serves 15)", qty: n(1), unit: 28 },
      { item: "Cake & traybake selection (24 pieces)", qty: n(2), unit: 36 },
      { item: "Tea & coffee, per guest", qty: guests, unit: 2.2 },
      { item: "Delivery & set-up (Bolton)", qty: 1, unit: 25 },
    ];
    const sub = lines.reduce((a, l) => a + l.qty * l.unit, 0);
    const ev = addDays(new Date(), ((5 - new Date().getDay() + 7) % 7) + 7);
    return { ref: "Q-26-" + (14800 + Math.floor(Math.random() * 90)), guests, lines, sub, vat: sub * 0.2, total: sub * 1.2, eventDate: ev, source: S.catering.mode === "upload" && S.catering.file ? S.catering.file : "Typed call notes" };
  }

  function cateringView() {
    const C = S.catering;
    const head = pageHead("Phase 1 · Catering Orders", "Catering quotes", "Type the order while you're on the call, or upload the customer's email or PDF. The quote is priced from the catering menu, and anything unclear is flagged. Nothing goes to the customer until you approve it.");
    if (C.step === "loading") return head + loadingView("Writing the quote…", ["Read the order", "Matched items to the catering menu and prices", "Checked allergens and dietary needs", "Checked the delivery slot against van routes"]);
    if (C.step === "approved") return head + cateringApproved();
    if (C.step === "quote") return head + quoteView();
    return head + `<div class="grid g2 fade-in" style="grid-template-columns:1.4fr 1fr;align-items:start">
      <div class="card">
        <div class="card-head"><h3>New catering order</h3>
          <div class="tabs"><button class="${C.mode === "type" ? "on" : ""}" data-act="c-mode" data-mode="type">Type order</button><button class="${C.mode === "upload" ? "on" : ""}" data-act="c-mode" data-mode="upload">Upload order</button></div>
        </div>
        <div class="card-pad stack">
          ${C.mode === "type" ? `
            <label class="field">Order details<span class="hint">Type it the way the customer says it. There's no form.</span>
              <textarea class="input" id="c-text" style="min-height:190px" placeholder="Who is it for, how many people, what they want, any dietary needs, when and where to deliver…">${esc(C.text)}</textarea>
            </label>
            <div><button class="btn btn-ghost btn-sm" data-act="c-sample">Use a sample phone call</button></div>
          ` : `
            <div class="drop" data-drop="catering">
              <input type="file" class="hidden" accept=".pdf,.doc,.docx,.txt,.eml,.png,.jpg,.jpeg">
              <div class="big">${svg("upload")}</div>
              <div><b>Click to upload</b> or drag the order here</div>
              <div class="small muted">Email, PDF, Word or a photo of a handwritten note</div>
            </div>
            ${C.file ? `<div><span class="file-chip">${svg("check")} ${esc(C.file)}</span></div>` : ""}
          `}
          <div class="row row-end"><button class="btn btn-primary btn-lg" data-act="c-generate">Generate quote</button></div>
        </div>
      </div>
      <div class="stack">
        <div class="card kpi"><div class="label">Quote turnaround</div><div class="value">~4 <small>min, was 2 days</small></div></div>
        <div class="card kpi"><div class="label">Orders with a mistake</div><div class="value">1 in 10 <small>before</small></div><div class="delta muted">the AI checks allergens, headcount and delivery slot</div></div>
        <div class="card kpi"><div class="label">Quotes this year</div><div class="value">20,000 <small>· 50% won</small></div><div class="delta muted">faster quotes win more of them</div></div>
      </div>
    </div>`;
  }

  function quoteView() {
    const C = S.catering, Q = C.quote;
    const rows = Q.lines.map((l) => `<tr><td>${esc(l.item)}${l.flag ? ' <span class="badge b-amber">dietary</span>' : ""}</td><td class="num">${l.qty}</td><td class="num">${gbp(l.unit)}</td><td class="num">${gbp(l.qty * l.unit)}</td></tr>`).join("");
    return `<div class="grid fade-in" style="grid-template-columns:1.5fr 1fr;align-items:start;gap:18px">
      <div class="doc">
        <div class="doc-head">
          <div><img src="assets/logo-badge.png" alt="Marrowby's Bakery"></div>
          <div style="text-align:right">
            <h2>Catering quote</h2>
            <div class="small muted">${Q.ref} · ${fmtLong(new Date())}</div>
            <div class="small muted">Valid for 14 days</div>
          </div>
        </div>
        <div class="grid g2" style="margin-bottom:18px">
          <div class="kv"><span>Customer</span><span><b>Halton &amp; Pryce Solicitors</b></span><span>Contact</span><span>Joanne Pryce</span><span>Phone</span><span>01204 000 412</span></div>
          <div class="kv"><span>Event</span><span><b>${fmtLong(Q.eventDate)}</b></span><span>Guests</span><span>${Q.guests}</span><span>Deliver</span><span>Silverwell St, Bolton BL1 by 12:15</span></div>
        </div>
        ${C.applied.length ? `<div class="note note-green" style="margin-bottom:12px">Updated: ${C.applied.map(esc).join(" · ")}</div>` : ""}
        <table class="t"><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Unit</th><th class="num">Total</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="totals">
          <div><span class="muted">Subtotal</span><span>${gbp(Q.sub)}</span></div>
          <div><span class="muted">VAT 20%</span><span>${gbp(Q.vat)}</span></div>
          <div class="grand"><span>Total</span><span>${gbp(Q.total)}</span></div>
        </div>
        <p class="small muted" style="margin-top:16px">Allergen information for every item is attached. Gluten-free and vegan items are packed and labelled separately.</p>
      </div>
      <div class="stack">
        <div class="card">
          <div class="card-head"><h3>AI checks</h3><span class="badge b-amber">3 to review</span></div>
          <div class="card-pad stack" style="gap:10px">
            <div class="note note-amber"><span><b>Dietary:</b> 2 gluten-free guests and 1 vegan guest. A separate platter has been added; please confirm.</span></div>
            <div class="note note-amber"><span><b>Headcount:</b> the customer said "about ${Q.guests}". Confirm the final number by Wednesday 4pm.</span></div>
            <div class="note note-amber"><span><b>Delivery:</b> 12:15 is in the lunch rush, so it goes on Van 7's late-morning run instead of with shop staff.</span></div>
            <div class="note note-green"><span>All items are on the current catering menu at current prices.</span></div>
            <div class="note note-green"><span>Portions match ${Q.guests} guests (about 2 sandwich rounds each).</span></div>
            <div class="small muted">Read from: ${esc(Q.source)}</div>
          </div>
        </div>
        <div class="card card-pad stack">
          <label class="field">Any change?<textarea class="input" id="c-change" placeholder="e.g. Swap the fruit platter for a second cake selection. Add 10% loyalty discount.">${esc(C.change)}</textarea></label>
          <div class="row"><button class="btn btn-ghost" data-act="c-update">${svg("refresh")} Update quote</button><span class="spacer"></span><button class="btn btn-accent btn-lg" data-act="c-approve">Approve &amp; send</button></div>
        </div>
      </div>
    </div>`;
  }
  function cateringApproved() {
    const Q = S.catering.quote;
    return `<div class="card fade-in"><div class="success" id="celebrate">
      <div class="tick caramel">${svg("check")}</div>
      <h2>Quote approved and sent</h2>
      <p>Joanne Pryce at Halton &amp; Pryce got quote ${Q.ref} (${gbp(Q.total)}) about 4 minutes after her call. A quote used to take about 2 days.</p>
      <div class="grid g3" style="max-width:640px;margin:28px auto 0;text-align:left">
        <div class="card kpi"><div class="label">Turnaround</div><div class="value">4 <small>min</small></div></div>
        <div class="card kpi"><div class="label">Checks passed</div><div class="value">5/5</div></div>
        <div class="card kpi"><div class="label">Order value</div><div class="value">${gbp(Q.total, 0)}</div></div>
      </div>
      <div class="row" style="justify-content:center;margin-top:26px">
        <button class="btn btn-ghost" data-act="c-new">New catering order</button>
        <button class="btn btn-primary" data-act="nav" data-id="email">Next: email campaigns</button>
      </div>
    </div></div>`;
  }

  // =====================================================
  // EMAIL CAMPAIGNS
  // =====================================================
  const SEGMENTS = [
    {
      id: "morning", icon: "coffee", bg: "#fbf0d9", name: "Morning regulars, gone by lunch", size: 6420,
      why: "Buy a coffee and pastry on weekday mornings. Never seen after 12pm.",
      offer: "Your usual + a sourdough loaf £1 off", cond: "Collect after 4pm today", sendAt: "10:30",
      subject: (f) => `${f}, your usual plus a fresh loaf for tonight?`,
      body: (c) => `<p>Hi ${c.first},</p><p>Thanks for coming in most weekday mornings for your <b>${c.usual}</b>. If you're passing after 4pm today, there's £1 off a sourdough loaf for you.</p>`,
      people: [
        ["Daniel Hughes", "flat white + croissant, Mon–Fri 7:50am"],
        ["Leanne Booth", "latte + cinnamon swirl, 4 days a week"],
        ["Imran Patel", "americano + pain au chocolat, weekdays 8:15am"],
        ["Grace Whittaker", "tea + fruit scone, 3 mornings a week"],
        ["Marcus Fielding", "cappuccino + croissant, weekdays 7:30am"],
      ],
    },
    {
      id: "lunch", icon: "utensils", bg: "#e6ecdf", name: "Lunch-rush sandwich buyers", size: 9150,
      why: "Buy a sandwich and drink between 12 and 2pm, 3 or more times a week.",
      offer: "Pre-order lunch, skip the queue + a free cookie", cond: "Order on the app by 11am", sendAt: "09:00",
      subject: (f) => `${f}, skip the lunch queue this week`,
      body: (c) => `<p>Hi ${c.first},</p><p>You often come in at lunchtime for a <b>${c.usual}</b>. Order on the app before 11am and we'll have it bagged at the counter, with a free cookie, so you can skip the queue.</p>`,
      people: [
        ["Sophie Kenyon", "chicken salad sandwich + water, 12:40pm"],
        ["Ahmed Rahman", "ham & cheese + coffee, 4 lunches a week"],
        ["Chloe Barnes", "BLT + orange juice, weekdays 1:10pm"],
        ["Liam O'Connor", "steak bake + sausage roll, 12:20pm"],
        ["Natalie Greenhalgh", "egg mayo + tea, 3 lunches a week"],
      ],
    },
    {
      id: "cake", icon: "cake", bg: "#f6e8d4", name: "Weekend cake buyers", size: 3880,
      why: "Buy a whole cake or a box of traybakes on Saturdays.",
      offer: "10% off any whole cake", cond: "Order by Thursday, collect Saturday", sendAt: "Tue 18:00",
      subject: (f) => `${f}, 10% off Saturday's cake if you order by Thursday`,
      body: (c) => `<p>Hi ${c.first},</p><p>You often pick up a <b>${c.usual}</b> on Saturday. Order by Thursday and we'll bake one for you with 10% off, so it's there when you arrive.</p>`,
      people: [
        ["Helen Ashcroft", "whole Victoria sponge, most Saturdays"],
        ["Peter Lomax", "box of 6 brownies, Saturdays 10am"],
        ["Rachel Simms", "Victoria sponge, twice a month"],
        ["Owen Ridley", "traybake box, Saturday mornings"],
        ["Fatima Khan", "whole chocolate cake, monthly"],
      ],
    },
    {
      id: "lapsed", icon: "history", bg: "#efe9f5", name: "Members we've missed", size: 5210,
      why: "Used to visit weekly. No visit in the last 45 days.",
      offer: "Free hot drink with any bake", cond: "Valid for 7 days", sendAt: "Thu 10:00",
      subject: (f) => `${f}, your next hot drink is on us`,
      body: (c) => `<p>Hi ${c.first},</p><p>We haven't seen you for a few weeks. Next time you come in for <b>${c.usual}</b>, the hot drink with it is free.</p>`,
      people: [
        ["Joe Partington", "last visit 52 days ago · usually a steak bake"],
        ["Emma Crossley", "last visit 61 days ago · usually sausage rolls"],
        ["Bilal Hussain", "last visit 47 days ago · usually Eccles cakes"],
        ["Katie Moran", "last visit 70 days ago · usually a Saturday loaf"],
        ["George Tattersall", "last visit 49 days ago · usually a morning tea"],
      ],
    },
    {
      id: "never", icon: "userplus", bg: "#e3eef3", name: "Customers who have not visited", size: 2340,
      why: "Joined the loyalty scheme but haven't bought anything from a shop yet.",
      offer: "Free cinnamon swirl with your first coffee", cond: "Valid for 14 days at any of our 40 shops", sendAt: "Sat 08:30",
      subject: (f) => `${f}, your first cinnamon swirl is on us`,
      body: (c) => `<p>Hi ${c.first},</p><p>You joined our loyalty scheme ${c.usual} but haven't been into one of our shops yet. Order any coffee at one of our 40 shops in the next 14 days and we'll add a cinnamon swirl for free.</p>`,
      people: [
        ["Olivia Brennan", "joined at the Bury food festival · no visit in 34 days"],
        ["Hassan Malik", "joined online · no visit in 21 days"],
        ["Lucy Hargreaves", "joined via a catering order · no visit in 40 days"],
        ["Nathan Clegg", "joined online · no visit in 28 days"],
        ["Amira Saleh", "joined at the Chorley shop opening · no visit in 55 days"],
      ],
    },
  ];
  const emailOf = (n) => n.toLowerCase().replace(/'/g, "").split(" ").join(".") + "@example.co.uk";
  const usualOf = (seg, act) => {
    if (seg.id === "never") return act.split(" · ")[0].replace(/^joined /, "");
    if (seg.id === "lapsed") return act.split("usually ").pop();
    return act.split(",")[0];
  };

  function emailView() {
    const E = S.email;
    const head = pageHead("Phase 2 · Email Campaigns", "Offer emails", "Fetch loyalty members to see them grouped by what they buy, each with an offer email drafted. Each member gets at most one offer a week, so customers don't start waiting for discounts.", E.step === "list" ? `<button class="btn btn-ghost" data-act="e-fetch">${svg("refresh")} Refresh customers</button>` : "");
    if (E.step === "loading") return head + loadingView("Fetching customers…", ["Read 80,000 loyalty members' purchase history", "Found 5 customer groups worth an offer", "Checked each member against the weekly discount cap", "Drafted a personal email for each member"]);
    if (E.step === "start") {
      return head + `<div class="card fade-in"><div class="success" style="padding:56px 24px">
        <img src="assets/roll.png" alt="" style="width:64px">
        <h2 style="margin-top:8px">Find who to email this week</h2>
        <p>Groups loyalty members by what they buy and drafts an offer email for each one.</p>
        <button class="btn btn-primary btn-lg" style="margin-top:22px" data-act="e-fetch">Fetch customers</button>
        <div class="row" style="justify-content:center;margin-top:22px;gap:22px">
          <span class="small muted stat">${svg("users")} 80,000 members</span><span class="small muted stat">${svg("mail")} 30% of all visits</span><span class="small muted stat">${svg("shield")} Max 1 offer per member per week</span>
        </div>
      </div></div>`;
    }
    const totalSent = Object.keys(E.sent).length;
    const segs = SEGMENTS.map((seg) => {
      const allSent = seg.people.every(([n]) => E.sent[n]);
      const rows = seg.people.map(([name, act]) => {
        const first = name.split(" ")[0], key = name, open = E.open[key], sent = E.sent[key];
        const c = { first, usual: usualOf(seg, act) };
        return `<tr>
          <td><button class="expand-btn ${open ? "open" : ""}" data-act="e-toggle" data-key="${esc(key)}" aria-label="Show email draft">${svg("chevron")}</button></td>
          <td><b>${esc(name)}</b></td>
          <td class="small">${esc(emailOf(name))}</td>
          <td class="small">${esc(act)}</td>
          <td><span class="badge b-caramel">${esc(seg.offer)}</span></td>
          <td>${sent ? `<button class="btn btn-sm btn-done" disabled>${svg("check")} Sent</button>` : `<button class="btn btn-sm btn-primary" data-act="e-send" data-key="${esc(key)}">Send email</button>`}</td>
        </tr>
        ${open ? `<tr class="draft-row"><td colspan="6">
          <div class="email fade-in">
            <div class="email-meta"><div><b>To:</b> ${esc(name)} &lt;${esc(emailOf(name))}&gt;</div><div><b>Subject:</b> ${esc(seg.subject(first))}</div><div><b>Sends:</b> ${seg.sendAt}</div></div>
            <div class="email-banner"><img src="assets/roll.png" alt=""><span class="n">MARROWBY'S</span></div>
            <div class="email-body">
              ${seg.body(c)}
              <div class="offer-box"><div class="o">${esc(seg.offer)}</div><div class="c">${esc(seg.cond)} · scan your loyalty card at the till</div></div>
              <p>See you soon,<br>The team at Marrowby's ${SHOP.name}</p>
              <p class="small muted" style="margin:0">One offer per member per week. Can't be combined with other offers. Unsubscribe any time.</p>
            </div>
          </div>
        </td></tr>` : ""}`;
      }).join("");
      return `<div class="card seg fade-in">
        <div class="seg-head">
          <div class="seg-icon" style="background:${seg.bg}">${svg(seg.icon)}</div>
          <div style="flex:1;min-width:220px"><h3>${seg.name}</h3><div class="small muted">${seg.why}</div></div>
          <div class="row"><span class="badge b-grey">${seg.size.toLocaleString("en-GB")} members</span>
          ${allSent ? `<button class="btn btn-sm btn-done" disabled>${svg("check")} All sent</button>` : `<button class="btn btn-sm btn-accent" data-act="e-sendall" data-seg="${seg.id}">Send to all ${seg.size.toLocaleString("en-GB")}</button>`}</div>
        </div>
        <div class="table-wrap"><table class="t">
          <thead><tr><th style="width:40px"></th><th>Customer</th><th>Email</th><th>What they did</th><th>Offer</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
        <div class="small muted" style="padding:10px 22px 14px">Showing 5 of ${seg.size.toLocaleString("en-GB")} members in this group.</div>
      </div>`;
    }).join("");
    return head + `<div class="grid g4 fade-in" style="margin-bottom:20px">
        <div class="card kpi"><div class="label">Members with an offer</div><div class="value">27,000</div></div>
        <div class="card kpi"><div class="label">Groups found</div><div class="value">5</div></div>
        <div class="card kpi"><div class="label">Discount cap</div><div class="value">1 <small>offer / week, max £1.50</small></div></div>
        <div class="card kpi"><div class="label">Sent this session</div><div class="value">${totalSent}</div></div>
      </div>` + segs;
  }

  // =====================================================
  // BILLING
  // =====================================================
  function sampleBill() {
    return {
      supplier: "Pennine Flour Mills Ltd", supplierAddr: "Unit 4, Croal Valley Ind. Est., Bolton BL3", invoice: "PFM-88214",
      date: fmtDM(addDays(new Date(), -2)) + " " + new Date().getFullYear(), po: "PO-26-03318", due: "30 days",
      lines: [
        { item: "Strong white bread flour 16kg", qty: 120, unit: 11.4, po: 11.4 },
        { item: "Wholemeal flour 16kg", qty: 40, unit: 12.1, po: 12.1 },
        { item: "Unsalted butter 10kg block", qty: 30, unit: 58.0, po: 55.5 },
        { item: "Caster sugar 25kg", qty: 12, unit: 21.5, po: 21.5 },
        { item: "Fresh yeast 1kg", qty: 20, unit: 4.1, po: 4.1 },
        { item: "Free-range eggs (tray of 180)", qty: 8, unit: 39.0, po: 39.0 },
      ],
    };
  }
  const billTotals = (b) => { const sub = b.lines.reduce((a, l) => a + Number(l.qty) * Number(l.unit), 0); return { sub, vat: 0, total: sub }; };

  function billingView() {
    const B = S.billing;
    const head = pageHead("Phase 2 · Billing", "Supplier bills", "Upload a supplier bill and OCR reads it, matches it to the purchase order and flags any line that doesn't match. Finance approves every bill. Today the team types 20,000 bills a year in by hand.");
    if (B.step === "approved") return head + billApproved();
    if (B.step === "upload") {
      return head + `<div class="grid g2 fade-in" style="grid-template-columns:1.4fr 1fr;align-items:start">
        <div class="card card-pad stack">
          <h3>Upload a supplier bill</h3>
          <div class="drop" data-drop="billing" style="padding:40px">
            <input type="file" class="hidden" accept=".pdf,.png,.jpg,.jpeg,.tiff">
            <div class="big">${svg("receipt")}</div>
            <div><b>Click to upload</b> or drag a bill here</div>
            <div class="small muted">PDF, photo or scan</div>
          </div>
          ${B.file ? `<div><span class="file-chip">${svg("check")} ${esc(B.file)}</span></div>` : ""}
          <div class="row"><button class="btn btn-ghost btn-sm" data-act="b-sample">Use a sample bill</button><span class="spacer"></span><button class="btn btn-primary btn-lg" data-act="b-read" ${B.file ? "" : "disabled"}>Read bill</button></div>
        </div>
        <div class="stack">
          <div class="card kpi"><div class="label">Bills read this week</div><div class="value">412</div></div>
          <div class="card kpi"><div class="label">Auto-matched to a PO</div><div class="value">91%</div></div>
          <div class="card kpi"><div class="label">Exceptions waiting</div><div class="value">37</div><div class="delta muted">price or quantity doesn't match</div></div>
        </div>
      </div>`;
    }
    const b = B.bill || sampleBill();
    const t = billTotals(b);
    const scanDoc = `<div class="bill-scan">
      ${B.step === "scanning" ? '<div class="scanline"></div>' : ""}
      <div style="font-weight:700;font-size:14px">${B.step === "scanning" ? b.supplier : `<span class="ocr-hl">${esc(b.supplier)}</span>`}</div>
      <div>${esc(b.supplierAddr)}</div><div>VAT Reg 000 0000 00</div><br>
      <div>INVOICE No: ${B.step === "scanning" ? b.invoice : `<span class="ocr-hl">${esc(b.invoice)}</span>`}</div>
      <div>DATE: ${B.step === "scanning" ? b.date : `<span class="ocr-hl">${esc(b.date)}</span>`}</div>
      <div>YOUR ORDER: ${B.step === "scanning" ? b.po : `<span class="ocr-hl">${esc(b.po)}</span>`}</div>
      <div>DELIVER TO: Marrowby's Central Bakery</div><br>
      <div>---------------------------------------------</div>
      ${b.lines.map((l) => `<div style="display:flex;justify-content:space-between;gap:10px"><span>${esc(l.item)}</span><span>${l.qty} x ${Number(l.unit).toFixed(2)}</span></div>`).join("")}
      <div>---------------------------------------------</div>
      <div style="display:flex;justify-content:space-between"><b>TOTAL GBP</b><b>${B.step === "scanning" ? t.total.toFixed(2) : `<span class="ocr-hl">${t.total.toFixed(2)}</span>`}</b></div>
      <br><div>Terms: ${esc(b.due)} · Thank you for your custom</div>
    </div>`;
    if (B.step === "scanning") {
      return head + `<div class="grid g2 fade-in" style="align-items:start">
        <div class="card card-pad"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h3>${esc(B.file)}</h3><span class="badge b-amber">Reading…</span></div>${scanDoc}</div>
        ${loadingView("Reading the bill…", ["Found supplier, invoice number and date", "Read 6 line items", "Matched to purchase order " + b.po, "Compared prices with the PO"])}
      </div>`;
    }
    // review
    const rows = b.lines.map((l, i) => {
      const diff = Number(l.unit) !== l.po;
      const pct = ((Number(l.unit) - l.po) / l.po * 100).toFixed(1);
      if (B.editing) {
        return `<tr><td class="edit-cell"><input data-bl="${i}" data-f="item" value="${esc(l.item)}"></td><td class="edit-cell num"><input data-bl="${i}" data-f="qty" type="number" value="${l.qty}" style="text-align:right"></td><td class="edit-cell num"><input data-bl="${i}" data-f="unit" type="number" step="0.01" value="${l.unit}" style="text-align:right"></td><td class="num">${gbp(l.qty * l.unit)}</td><td></td></tr>`;
      }
      return `<tr><td>${esc(l.item)}<div class="conf">OCR confidence ${diff ? 97 : 99}%</div></td><td class="num">${l.qty}</td><td class="num">${gbp(l.unit)}</td><td class="num">${gbp(l.qty * l.unit)}</td><td>${diff ? `<span class="badge b-red">+${pct}% vs PO ${gbp(l.po)}</span>` : `<span class="badge b-green">Matches PO</span>`}</td></tr>`;
    }).join("");
    const exceptions = b.lines.filter((l) => Number(l.unit) !== l.po);
    return head + `<div class="grid fade-in" style="grid-template-columns:1fr 1.35fr;align-items:start;gap:18px">
      <div class="card card-pad"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h3>${esc(B.file)}</h3><span class="badge b-green">Read</span></div>${scanDoc}<div class="small muted" style="margin-top:8px">Highlighted text was read by OCR.</div></div>
      <div class="card">
        <div class="card-head"><div><div class="eyebrow" style="margin:0">Saved as draft</div><h3>${esc(b.supplier)} · ${esc(b.invoice)}</h3></div>${exceptions.length ? `<span class="badge b-red">${exceptions.length} exception</span>` : `<span class="badge b-green">All lines match</span>`}</div>
        <div class="card-pad" style="padding-bottom:6px"><div class="grid g3 small">
          <div><div class="muted">Bill date</div><b>${esc(b.date)}</b></div>
          <div><div class="muted">Purchase order</div><b>${esc(b.po)}</b> <span class="badge b-green">matched</span></div>
          <div><div class="muted">Delivery note</div><b>Quantities match</b> ${svg("check", "ok")}</div>
        </div></div>
        <div class="table-wrap"><table class="t">
          <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Unit</th><th class="num">Line total</th><th>Check</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><td colspan="3">Total (food is zero-rated for VAT)</td><td class="num">${gbp(t.total)}</td><td></td></tr></tfoot>
        </table></div>
        <div class="card-foot stack">
          ${exceptions.length && !B.editing ? `<div class="note note-red"><span><b>Price check:</b> ${esc(exceptions[0].item)} is billed at ${gbp(exceptions[0].unit)}, but the PO says ${gbp(exceptions[0].po)}. That's ${gbp((exceptions[0].unit - exceptions[0].po) * exceptions[0].qty)} extra. Approve it, or edit the line to the PO price and query it with the supplier.</span></div>` : ""}
          <div class="row">
            ${B.editing ? `<button class="btn btn-primary" data-act="b-save">Save changes</button><button class="btn btn-ghost" data-act="b-cancel">Cancel</button>` : `<button class="btn btn-ghost" data-act="b-edit">${svg("pencil")} Edit items</button>`}
            <span class="spacer"></span>
            <button class="btn btn-accent btn-lg" data-act="b-approve" ${B.editing ? "disabled" : ""}>Approve bill</button>
          </div>
        </div>
      </div>
    </div>`;
  }
  function billApproved() {
    const b = S.billing.bill, t = billTotals(b);
    return `<div class="card fade-in"><div class="success" id="celebrate">
      <div class="tick">${svg("check")}</div>
      <h2>Bill approved and saved</h2>
      <p>${esc(b.supplier)} ${esc(b.invoice)} for ${gbp(t.total)} is posted to the ledger and booked into Friday's payment run.</p>
      <div class="row" style="justify-content:center;margin-top:26px">
        <button class="btn btn-primary" data-act="b-new">Upload another bill</button>
      </div>
    </div></div>`;
  }

  // =====================================================
  // MARKETING
  // =====================================================
  const MPROD = {
    "Eccles cake": { price: "£1.60", allergens: "Wheat (gluten), milk", line: "Flaky butter pastry filled with currants.", head: "A proper Eccles cake" },
    "Sourdough loaf": { price: "£3.40", allergens: "Wheat (gluten)", line: "Slow-proved for 18 hours and baked overnight in our central bakery.", head: "Our sourdough" },
    "Sausage roll": { price: "£1.45", allergens: "Wheat (gluten), milk, egg", line: "Lancashire pork, peppery and wrapped in all-butter puff pastry.", head: "Our sausage roll" },
    "Cinnamon swirl": { price: "£1.75", allergens: "Wheat (gluten), milk, egg", line: "Soft dough rolled with brown sugar and cinnamon.", head: "The cinnamon swirl" },
    "Victoria sponge": { price: "£12.50", allergens: "Wheat (gluten), milk, egg", line: "Jam, buttercream and a dusting of sugar. Order by Thursday for Saturday.", head: "Victoria sponge for Saturday" },
  };
  const FORMATS = [
    ["poster", "image", "Shop poster", "A4 window or counter poster"],
    ["social", "phone", "Social post", "Image and caption"],
    ["label", "tag", "Shelf label", "Price and allergens"],
    ["menu", "list", "Menu board line", "Name and short description"],
  ];
  function marketingView() {
    const M = S.marketing;
    const head = pageHead("Phase 2 · Marketing", "Content studio", "Choose a format and a product to get a draft in the Marrowby's house style. Allergens come from the recipe database. Someone in marketing approves every draft before it goes to the shops.");
    if (M.step === "loading") return head + loadingView("Drafting…", ["Read the product and recipe details", "Pulled allergens from the recipe database", "Wrote it in the house style"]);
    if (M.step === "approved") return head + `<div class="card fade-in"><div class="success" id="celebrate">
        <div class="tick caramel">${svg("check")}</div><h2>Approved and sent to shops</h2>
        <p>The ${esc(M.product)} ${FORMATS.find((f) => f[0] === M.format)[2].toLowerCase()} is in the print queue for all 40 shops and the marketing calendar.</p>
        <div class="row" style="justify-content:center;margin-top:26px"><button class="btn btn-primary" data-act="m-new">Make something else</button></div>
      </div></div>`;
    const form = `<div class="card card-pad stack fade-in">
      <div class="field">What do you need?</div>
      <div class="choice-grid">${FORMATS.map(([id, i, n, d]) => `<button class="choice ${M.format === id ? "on" : ""}" data-act="m-format" data-f="${id}"><div class="i">${svg(i)}</div><div class="n">${n}</div><div class="d">${d}</div></button>`).join("")}</div>
      <div class="grid g2">
        <label class="field">Product<select class="input" id="m-product">${Object.keys(MPROD).map((p) => `<option ${p === M.product ? "selected" : ""}>${p}</option>`).join("")}</select></label>
        <label class="field">Brief (optional)<input class="input" id="m-brief" value="${esc(M.brief)}" placeholder="e.g. Bonfire Night weekend, warm and cosy"></label>
      </div>
      <div class="row row-end"><button class="btn btn-primary btn-lg" data-act="m-generate">${M.step === "draft" ? "Regenerate" : "Generate draft"}</button></div>
    </div>`;
    if (M.step !== "draft") return head + form;
    return head + form + `<div class="grid g2 fade-in" style="margin-top:18px;align-items:start">
      <div class="card card-pad">${mPreview()}</div>
      <div class="stack">
        <div class="card card-pad stack" style="gap:10px">
          <h3>Checks</h3>
          <div class="note note-green">Allergens taken from the recipe database: ${esc(MPROD[M.product].allergens)}</div>
          <div class="note note-green">Price matches the till: ${MPROD[M.product].price}</div>
          <div class="note note-green">House style: logo, colours and tone of voice</div>
          <div class="note note-amber">Needs approval from marketing before it goes out</div>
        </div>
        <div class="row"><button class="btn btn-ghost" data-act="m-generate">${svg("refresh")} Try another version</button><span class="spacer"></span><button class="btn btn-accent btn-lg" data-act="m-approve">Approve</button></div>
      </div>
    </div>`;
  }
  function mPreview() {
    const M = S.marketing, p = MPROD[M.product];
    const kicker = M.brief ? M.brief : "Fresh from our ovens";
    if (M.format === "poster") return `<div class="poster"><img src="assets/roll.png" alt=""><div class="kicker">${esc(kicker)}</div><div class="headline">${esc(p.head)}</div><div class="sub">${esc(p.line)}</div><div class="price">${p.price}</div><div class="small" style="margin-top:16px;opacity:.7">Allergens: ${esc(p.allergens)}</div></div>`;
    if (M.format === "social") return `<div class="social"><div class="social-top"><img src="assets/roll.png" alt="">marrowbys.bakery</div><div class="social-img"><img src="assets/roll.png" alt=""></div><div class="social-cap"><b>marrowbys.bakery</b> ${esc(p.head)}. ${esc(p.line)} ${M.brief ? esc(M.brief) + "." : ""} In all 40 shops from 7am, ${p.price}.<div class="small muted" style="margin-top:6px">#Marrowbys #NorthWestBakes #BakedThisMorning</div></div></div>`;
    if (M.format === "label") return `<div class="label-card"><div class="small" style="letter-spacing:3px;color:var(--caramel);font-weight:700">MARROWBY'S</div><div class="ln">${esc(M.product)}</div><div class="small muted" style="margin:4px 0 10px">${esc(p.line)}</div><div class="row" style="justify-content:space-between;align-items:flex-end"><div class="small"><b>Contains:</b> ${esc(p.allergens)}</div><div style="font-family:var(--serif);font-size:34px;font-weight:700;color:var(--green)">${p.price}</div></div></div>`;
    return `<div class="poster" style="text-align:left;padding:26px 30px"><div class="kicker" style="margin:0">Today's bakes</div><div class="row" style="justify-content:space-between;margin-top:10px;border-bottom:1px dashed rgba(254,249,239,.35);padding-bottom:10px"><span style="font-family:var(--serif);font-size:26px;font-weight:700">${esc(M.product)}</span><span style="font-family:var(--serif);font-size:24px;color:#d8b88d">${p.price}</span></div><div class="sub" style="margin:10px 0 0;max-width:none">${esc(p.line)}</div><div class="small" style="margin-top:12px;opacity:.7">Allergens: ${esc(p.allergens)}</div></div>`;
  }

  const VIEWS = { overview: overviewView, orders: ordersView, rota: rotaView, catering: cateringView, email: emailView, billing: billingView, marketing: marketingView };

  // =====================================================
  // ACTIONS
  // =====================================================
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
  async function celebrate() { await sleep(30); const c = $("#celebrate"); if (c) confetti(c); }

  const ACTIONS = {
    nav(el) { S.view = el.dataset.id; S.navOpen = false; store.set("mb_view", S.view); render(); },
    "toggle-nav"() { S.navOpen = !S.navOpen; $(".sidebar").classList.toggle("open", S.navOpen); },
    logout() { store.del("mb_user"); store.del("mb_view"); S.user = null; S.view = "overview"; render(); },

    // Orders
    async "o-generate"() {
      S.orders.date = val("o-date") || isoDate(new Date());
      S.orders.event = val("o-event");
      S.orders.change = "";
      S.orders.step = "loading"; rerenderContent();
      await sleep(2200);
      S.orders.data = buildOrder(S.orders.date, S.orders.event);
      S.orders.step = "sheet"; rerenderContent();
    },
    async "o-send"() {
      S.orders.change = val("o-change");
      S.orders.sentAt = nowTime();
      S.orders.step = "baking"; rerenderContent();
      toast("Order sent to Central Bakery");
      await sleep(80); const bb = $("#bake-bar"); if (bb) bb.style.width = "62%";
    },
    "o-new"() { S.orders.step = "form"; S.orders.data = null; S.orders.event = ""; S.orders.change = ""; rerenderContent(); },

    // Rota
    async "r-generate"() {
      S.rota.start = val("r-start") || isoDate(new Date());
      S.rota.applied = []; S.rota.note = ""; S.rota.overrides = {};
      S.rota.step = "loading"; rerenderContent();
      await sleep(2000);
      S.rota.step = "draft"; rerenderContent();
    },
    async "r-regen"() {
      const note = val("r-note").trim();
      S.rota.step = "loading"; rerenderContent();
      await sleep(1500);
      if (note) { S.rota.applied.push(note); applyRotaNote(note); }
      S.rota.note = "";
      S.rota.step = "draft"; rerenderContent();
    },
    "r-publish"() { S.rota.publishedAt = nowTime(); S.rota.step = "published"; rerenderContent(); celebrate(); },
    "r-edit"() { S.rota.step = "draft"; rerenderContent(); },

    // Catering
    "c-mode"(el) { const t = document.getElementById("c-text"); if (t) S.catering.text = t.value; S.catering.mode = el.dataset.mode; rerenderContent(true); },
    "c-sample"() { S.catering.text = SAMPLE_CALL; rerenderContent(true); },
    async "c-generate"() {
      const C = S.catering;
      if (C.mode === "type") { C.text = val("c-text"); if (!C.text.trim()) C.text = SAMPLE_CALL; }
      else if (!C.file) { C.file = "order-email-halton-pryce.pdf"; }
      C.applied = []; C.change = "";
      C.step = "loading"; rerenderContent();
      await sleep(2200);
      C.quote = buildQuote(C.mode === "type" ? C.text : SAMPLE_CALL);
      C.step = "quote"; rerenderContent();
    },
    async "c-update"() {
      const note = val("c-change").trim();
      S.catering.step = "loading"; rerenderContent();
      await sleep(1400);
      if (note) S.catering.applied.push(note);
      S.catering.change = "";
      S.catering.step = "quote"; rerenderContent();
    },
    "c-approve"() { S.catering.step = "approved"; rerenderContent(); celebrate(); },
    "c-new"() { Object.assign(S.catering, { step: "form", text: "", file: null, quote: null, change: "", applied: [] }); rerenderContent(); },

    // Email
    async "e-fetch"() { S.email.step = "loading"; rerenderContent(); await sleep(2200); S.email.step = "list"; rerenderContent(); },
    "e-toggle"(el) { const k = el.dataset.key; S.email.open[k] = !S.email.open[k]; rerenderContent(true); },
    "e-send"(el) { S.email.sent[el.dataset.key] = true; rerenderContent(true); toast("Email sent to " + el.dataset.key); },
    "e-sendall"(el) { const seg = SEGMENTS.find((s) => s.id === el.dataset.seg); seg.people.forEach(([n]) => (S.email.sent[n] = true)); rerenderContent(true); toast(`Scheduled for ${seg.size.toLocaleString("en-GB")} members at ${seg.sendAt}`); },

    // Billing
    "b-sample"() { S.billing.file = "pennine-flour-PFM-88214.pdf"; rerenderContent(); },
    async "b-read"() {
      S.billing.bill = sampleBill(); S.billing.step = "scanning"; rerenderContent();
      await sleep(2600);
      S.billing.step = "review"; rerenderContent();
    },
    "b-edit"() { S.billing.editing = true; rerenderContent(true); },
    "b-cancel"() { S.billing.editing = false; rerenderContent(true); },
    "b-save"() {
      document.querySelectorAll("[data-bl]").forEach((inp) => {
        const l = S.billing.bill.lines[+inp.dataset.bl], f = inp.dataset.f;
        l[f] = f === "item" ? inp.value : Number(inp.value) || 0;
      });
      S.billing.editing = false; rerenderContent(true); toast("Changes saved");
    },
    "b-approve"() { S.billing.step = "approved"; rerenderContent(); celebrate(); },
    "b-new"() { Object.assign(S.billing, { step: "upload", file: null, bill: null, editing: false }); rerenderContent(); },

    // Marketing
    "m-format"(el) { S.marketing.product = val("m-product") || S.marketing.product; S.marketing.brief = val("m-brief"); S.marketing.format = el.dataset.f; rerenderContent(true); },
    async "m-generate"() {
      S.marketing.product = val("m-product") || S.marketing.product; S.marketing.brief = val("m-brief");
      S.marketing.step = "loading"; rerenderContent(); await sleep(1600);
      S.marketing.step = "draft"; rerenderContent();
    },
    "m-approve"() { S.marketing.step = "approved"; rerenderContent(); celebrate(); },
    "m-new"() { S.marketing.step = "form"; rerenderContent(); },
  };

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el); }
  });
  // live quantity edits on the order sheet
  document.addEventListener("change", (e) => {
    const q = e.target.closest("[data-qty]");
    if (q && S.orders.data) {
      S.orders.change = val("o-change");
      S.orders.data.items[+q.dataset.qty].qty = Math.max(0, parseInt(q.value, 10) || 0);
      const y = window.scrollY; rerenderContent(true); window.scrollTo(0, y);
    }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "login-form") return;
    e.preventDefault();
    const email = val("login-email");
    S.user = { email, name: nameFromEmail(email) };
    store.set("mb_user", S.user);
    S.view = "overview"; store.set("mb_view", S.view);
    render();
  });

  render();
})();
