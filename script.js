/* =========================================================
   JAAE Carpintería — script.js
   Vanilla + anime.js 3.2.2 (solo hero, trazo de planos, FLIP del lightbox, pasos del asistente)
   Principio: el contenido es visible por defecto; todo lo animado tiene respaldo.
   ========================================================= */

// Número de WhatsApp: única fuente de verdad (formato 52 + 10 dígitos). Si queda vacío, se oculta todo lo de WhatsApp.
const WHATSAPP_NUMBER = "528113941780";

(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const html = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasAnime = () => typeof window.anime === "function";
  const mqDesk = window.matchMedia("(min-width: 900px)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  html.classList.add("js-ok");
  if (!hasAnime()) html.classList.add("no-anime");

  /* ---------------------------------------------------------
     WhatsApp
     --------------------------------------------------------- */
  const waUrl = (msg) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  const MSG_BASE = "Hola JAAE Carpintería, vi su página y quiero cotizar un proyecto a medida.";
  if (!WHATSAPP_NUMBER) {
    html.classList.add("sin-wa");
  } else {
    $$("a[data-wa]").forEach((a) => {
      a.href = waUrl(a.dataset.msg || MSG_BASE);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  /* ---------------------------------------------------------
     Cargador (≤ 1.6 s + salida de 0.6 s; respaldo CSS a 2.2 s)
     --------------------------------------------------------- */
  const cargador = $("#cargador");
  const palabras = ["Midiendo…", "Cortando…", "Lijando…", "Barnizando…"];
  const MIN = reduce ? 350 : 1200;
  const MAX = reduce ? 400 : 1500;
  const t0 = performance.now();
  let cargado = document.readyState === "complete";
  let cerrado = false;
  window.addEventListener("load", () => { cargado = true; });

  const numEl = $(".cg-num");
  const palEl = $(".cg-palabra");
  const barra = $(".cg-regla i");

  function cerrarCargador() {
    if (cerrado) return;
    cerrado = true;
    if (numEl) numEl.textContent = "100";
    if (barra) barra.style.width = "100%";
    setTimeout(() => {
      if (cargador) cargador.classList.add("cerrando");
      html.classList.add("listo");
      introHero();
      setTimeout(() => cargador && cargador.classList.add("fin"), 650);
    }, 120);
  }
  function tickCargador() {
    if (cerrado) return;
    const t = performance.now() - t0;
    const p = clamp(t / MAX);
    const eased = 1 - Math.pow(1 - p, 2.2);
    const n = Math.round(eased * 99);
    if (numEl) numEl.textContent = String(n).padStart(3, "0");
    if (barra) barra.style.width = n + "%";
    if (palEl) palEl.textContent = palabras[Math.floor(t / 450) % palabras.length];
    if ((t >= MIN && cargado) || t >= MAX) cerrarCargador();
    else requestAnimationFrame(tickCargador);
  }
  requestAnimationFrame(tickCargador);
  setTimeout(cerrarCargador, MAX + 300); // seguro por si rAF se pausa (pestaña en segundo plano)

  /* ---------------------------------------------------------
     Cabecera, progreso, menú
     --------------------------------------------------------- */
  const hdr = $(".hdr");
  const progreso = $(".progreso");
  const burger = $(".burger");
  const menu = $("#menu");

  function setMenu(abierto) {
    html.classList.toggle("menu-abierto", abierto);
    burger.setAttribute("aria-expanded", String(abierto));
    burger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    menu.setAttribute("aria-hidden", String(!abierto));
  }
  burger.addEventListener("click", () => setMenu(!html.classList.contains("menu-abierto")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && html.classList.contains("menu-abierto")) setMenu(false); });
  mqDesk.addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------------------------------------------------------
     Índice lateral
     --------------------------------------------------------- */
  const secciones = $$("main > section[data-nombre]");
  const indice = $(".indice");
  const itemsIndice = secciones.map((s) => {
    const a = document.createElement("a");
    a.href = "#" + (s.id || "");
    if (!s.id) a.removeAttribute("href");
    a.setAttribute("aria-label", s.dataset.nombre);
    a.innerHTML = `<span>${s.dataset.nombre}</span><i></i>`;
    if (!s.id) { a.addEventListener("click", (e) => { e.preventDefault(); s.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }); a.tabIndex = 0; a.href = "#contenido"; }
    indice.appendChild(a);
    return a;
  });

  /* ---------------------------------------------------------
     Revelados con respaldo por geometría
     --------------------------------------------------------- */
  const revel = $$("[data-reveal]");
  function revelar(el) { el.classList.add("in"); }
  function barridoGeometria() {
    const vh = window.innerHeight;
    revel.forEach((el) => {
      if (el.classList.contains("in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) revelar(el);
    });
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { revelar(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    revel.forEach((el) => io.observe(el));
  } else {
    revel.forEach(revelar);
  }
  let rafGeo = 0;
  const pedirGeo = () => { if (rafGeo) return; rafGeo = requestAnimationFrame(() => { rafGeo = 0; barridoGeometria(); }); };
  window.addEventListener("scroll", pedirGeo, { passive: true });
  window.addEventListener("resize", pedirGeo);
  setTimeout(barridoGeometria, 2000);
  setTimeout(barridoGeometria, 4000);
  barridoGeometria();

  /* ---------------------------------------------------------
     Hero · intro (anime.js) · anillo 3D · partículas · scroll
     --------------------------------------------------------- */
  const hero = $("#hero");
  const anillo = $(".anillo");
  const tilt = $(".anillo-tilt");
  const tarjetas = $$(".tarjeta3d", anillo);
  const entrada = $(".anillo-entrada");
  const estadoAnillo = { intro: 0 };
  let heroVisible = true;

  if (hasAnime() && !reduce) {
    anime.set(entrada, { scale: 0.7, opacity: 0 });
    estadoAnillo.intro = -90;
  }
  function introHero() {
    if (hasAnime() && !reduce) {
      anime({ targets: entrada, scale: [0.7, 1], opacity: [0, 1], duration: 1400, delay: 200, easing: "easeOutExpo", complete: () => { entrada.style.transform = ""; entrada.style.opacity = ""; } });
      anime({ targets: estadoAnillo, intro: [-90, 0], duration: 1800, delay: 150, easing: "easeOutCubic" });
      anime({ targets: ".hero .sierra-g", opacity: [0, (el, i) => (i ? 0.18 : 0.22)], duration: 1600, delay: 300, easing: "easeOutQuad" });
    } else {
      estadoAnillo.intro = 0;
    }
    // respaldo: nada se queda oculto ni a medias
    setTimeout(() => { if (entrada) { entrada.style.opacity = ""; } }, 3500);
  }

  // Giro controlado por JS: permite pausar, inclinar y atenuar las traseras
  let ang = 0, pausado = false, tx = 0, tz = 0, objX = 0, objZ = 0, ultimo = performance.now();
  if (anillo) anillo.classList.add("anillo-js");
  function bucleAnillo(ahora) {
    const dt = Math.min(64, ahora - ultimo);
    ultimo = ahora;
    if (heroVisible) {
      if (!pausado && !reduce) ang += (dt * 360) / 42000;
      tx = lerp(tx, objX, 0.06);
      tz = lerp(tz, objZ, 0.06);
      const giro = ang + estadoAnillo.intro;
      anillo.style.transform = `rotateY(${giro.toFixed(2)}deg)`;
      tilt.style.transform = `rotateX(${(-6 + tx).toFixed(2)}deg) rotateZ(${tz.toFixed(2)}deg)`;
      for (let i = 0; i < tarjetas.length; i++) {
        const c = Math.cos(((giro + i * 51.4286) * Math.PI) / 180); // 1 = de frente
        const sombra = c > 0 ? (1 - c) * 0.18 : 0.45 + (-c) * 0.25;
        tarjetas[i].style.setProperty("--sombra", sombra.toFixed(3));
        tarjetas[i].style.opacity = (0.55 + 0.45 * ((c + 1) / 2)).toFixed(3);
      }
    }
    requestAnimationFrame(bucleAnillo);
  }
  requestAnimationFrame(bucleAnillo);

  if (hero && finePointer) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      objX = -ny * 8; objZ = nx * 3;
    });
    hero.addEventListener("pointerleave", () => { objX = 0; objZ = 0; });
  }
  const escenaAnillo = $(".escena3d");
  if (escenaAnillo) {
    escenaAnillo.addEventListener("pointerenter", () => { pausado = true; });
    escenaAnillo.addEventListener("pointerleave", () => { pausado = false; });
    escenaAnillo.addEventListener("pointerdown", () => { pausado = true; });
    window.addEventListener("pointerup", () => { if (!finePointer) pausado = false; });
  }

  // Partículas (aserrín / chispas)
  const puntero = { x: -9999, y: -9999 };
  window.addEventListener("pointermove", (e) => { puntero.x = e.clientX; puntero.y = e.clientY; }, { passive: true });

  function particulas(canvas, nDesk, nMov) {
    if (!canvas || !canvas.getContext) return { visible: () => {} };
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, vis = true, lista = [];
    const n = window.innerWidth < 760 ? nMov : nDesk;
    function medir() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function nueva(arriba) {
      return { x: Math.random() * w, y: arriba ? Math.random() * h : h + 10, r: 0.6 + Math.random() * 1.8, v: 8 + Math.random() * 22, f: Math.random() * 6.28, a: 0.25 + Math.random() * 0.6, k: 0.6 + Math.random() * 1.6, ox: 0 };
    }
    function pintar(t, mover) {
      ctx.clearRect(0, 0, w, h);
      const rect = canvas.getBoundingClientRect();
      const px = puntero.x - rect.left, py = puntero.y - rect.top;
      for (const p of lista) {
        if (mover) {
          p.y -= p.v * 0.016;
          const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { const d = Math.sqrt(d2) || 1; p.ox += (dx / d) * (1 - d / 118) * 1.6; }
          p.ox *= 0.94;
          if (p.y < -10) Object.assign(p, nueva(false), { x: Math.random() * w });
        }
        const x = p.x + Math.sin(t / 1000 * p.k + p.f) * 14 + p.ox;
        const al = p.a * (0.55 + 0.45 * Math.sin(t / 700 + p.f));
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = `rgba(227,166,107,${al.toFixed(3)})`;
        ctx.shadowColor = "rgba(227,166,107,.6)"; ctx.shadowBlur = p.r * 3;
        ctx.fill();
      }
    }
    function init() { medir(); lista = Array.from({ length: n }, () => nueva(true)); }
    init();
    window.addEventListener("resize", () => { medir(); });
    function bucle(t) { if (vis) pintar(t, true); requestAnimationFrame(bucle); }
    if (reduce) pintar(0, false); else requestAnimationFrame(bucle);
    return { visible: (v) => { vis = v; } };
  }
  const partHero = particulas($(".hero-canvas"), 60, 28);
  const partFinal = particulas($(".final-canvas"), 30, 16);
  if ("IntersectionObserver" in window) {
    const obsVis = (el, fn) => { if (!el) return; new IntersectionObserver((es) => es.forEach((e) => fn(e.isIntersecting))).observe(el); };
    obsVis(hero, (v) => { heroVisible = v; partHero.visible(v); });
    obsVis($("#contacto"), (v) => partFinal.visible(v));
  }

  /* ---------------------------------------------------------
     Cinta infinita (velocidad ligada al scroll)
     --------------------------------------------------------- */
  const cinta = $(".cinta");
  const pista = $(".cinta-pista");
  if (cinta && pista && !reduce) {
    pista.classList.add("cinta-js");
    let x = 0, vel = 55, visC = true, ultY = window.scrollY, ultT = performance.now(), pausaC = false;
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => { visC = e.isIntersecting; })).observe(cinta);
    cinta.addEventListener("pointerenter", () => { pausaC = true; });
    cinta.addEventListener("pointerleave", () => { pausaC = false; });
    const bucleCinta = (t) => {
      const dt = Math.min(64, t - ultT) / 1000; ultT = t;
      const y = window.scrollY, dy = y - ultY; ultY = y;
      if (visC) {
        const objetivo = pausaC ? 0 : 55 + dy * 55; // px/s hacia la izquierda; al subir se invierte
        vel = lerp(vel, objetivo, 0.08);
        const mitad = pista.scrollWidth / 2;
        x -= vel * dt;
        if (mitad > 0) { if (x <= -mitad) x += mitad; if (x > 0) x -= mitad; }
        pista.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      }
      requestAnimationFrame(bucleCinta);
    };
    requestAnimationFrame(bucleCinta);
  }

  /* ---------------------------------------------------------
     Manifiesto: palabras que se encienden con el scroll
     --------------------------------------------------------- */
  const manifiesto = $("#manifiesto");
  const manTexto = $(".manifiesto-texto");
  const palabrasMan = [];
  if (manTexto) {
    Array.from(manTexto.childNodes).forEach((nodo) => {
      if (nodo.nodeType === 3) {
        const frag = document.createDocumentFragment();
        nodo.textContent.split(/(\s+)/).forEach((tk) => {
          if (!tk) return;
          if (/^\s+$/.test(tk)) { frag.appendChild(document.createTextNode(" ")); return; }
          const s = document.createElement("span");
          s.className = "w"; s.textContent = tk;
          frag.appendChild(s); palabrasMan.push(s);
        });
        nodo.replaceWith(frag);
      } else if (nodo.nodeType === 1 && nodo.classList.contains("pill")) {
        palabrasMan.push(nodo);
      }
    });
  }

  /* ---------------------------------------------------------
     Procesos: pasos, plano
     --------------------------------------------------------- */
  const proceso = $("#proceso");
  const planoWrap = $(".proceso-plano");
  const grupos = $$(".pg");
  const pasos = $$(".paso");
  const listaPasos = $(".pasos");
  let pasoActivo = -1;

  function dibujarPlano(hasta, animar) {
    grupos.forEach((g, i) => {
      const trazos = $$("path,circle", g);
      const dibujado = i <= hasta;
      if (hasAnime() && animar && !reduce) {
        anime.remove(trazos);
        anime({ targets: trazos, strokeDashoffset: dibujado ? 0 : 1, duration: dibujado ? 1100 : 500, delay: anime.stagger ? anime.stagger(70) : 0, easing: "easeInOutQuad" });
      } else {
        trazos.forEach((t) => { t.style.strokeDashoffset = dibujado ? 0 : 1; });
      }
    });
  }
  function setPaso(i, animar = true) {
    if (i === pasoActivo) return;
    pasoActivo = i;
    if (planoWrap) planoWrap.style.setProperty("--paso", Math.max(0, i));
    dibujarPlano(i, animar);
  }
  // Estado inicial con JS: nada dibujado hasta que el usuario llegue
  if (grupos.length && !reduce) { dibujarPlano(-1, false); }
  else if (grupos.length) { dibujarPlano(4, false); }
  let planoMovilHecho = false;

  /* ---------------------------------------------------------
     Galería: pista horizontal fijada (desktop) o carrusel nativo
     --------------------------------------------------------- */
  const galeria = $("#trabajos");
  const galPista = $(".pista", galeria);
  const galVp = $(".galeria-vp", galeria);
  const obras = $$(".obra", galeria);
  let galMax = 0;
  function medirGaleria() {
    if (!galeria) return;
    if (reduce || window.innerWidth < 900) {
      galeria.classList.remove("pin");
      galeria.style.height = "";
      galPista.style.transform = "";
      galMax = 0;
      return;
    }
    galeria.classList.add("pin");
    galPista.style.transform = "";
    galMax = Math.max(0, galPista.scrollWidth + 96 - window.innerWidth);
    galeria.style.height = galMax + window.innerHeight + "px";
  }
  // puntos del carrusel móvil
  const puntosCont = $(".gal-puntos");
  const puntos = obras.map(() => { const i = document.createElement("i"); puntosCont.appendChild(i); return i; });
  function actualizaPuntos() {
    if (galeria.classList.contains("pin")) return;
    const centro = galVp.scrollLeft + galVp.clientWidth / 2;
    let mejor = 0, md = 1e9;
    obras.forEach((o, i) => { const c = o.offsetLeft + o.offsetWidth / 2; const d = Math.abs(c - centro); if (d < md) { md = d; mejor = i; } });
    puntos.forEach((p, i) => p.classList.toggle("on", i === mejor));
  }
  galVp.addEventListener("scroll", actualizaPuntos, { passive: true });

  // Cursor "VER"
  const cursorVer = $(".cursor-ver");
  if (cursorVer && finePointer) {
    let cx = 0, cy = 0, ox = 0, oy = 0, activo = false;
    window.addEventListener("pointermove", (e) => { cx = e.clientX; cy = e.clientY; }, { passive: true });
    obras.forEach((o) => {
      o.addEventListener("pointerenter", () => { activo = true; cursorVer.classList.add("on"); });
      o.addEventListener("pointerleave", () => { activo = false; cursorVer.classList.remove("on"); });
    });
    const sigue = () => { ox = lerp(ox, cx, 0.16); oy = lerp(oy, cy, 0.16); cursorVer.style.transform = `translate3d(${ox}px,${oy}px,0)`; requestAnimationFrame(sigue); };
    requestAnimationFrame(sigue);
  }

  /* ---------------------------------------------------------
     Lightbox con FLIP (anime.js)
     --------------------------------------------------------- */
  const lb = $("#lightbox");
  const lbImg = $(".lb-img", lb);
  const lbCont = $(".lb-cont", lb);
  const lbCta = $(".lb-pie [data-wa]", lb);
  const fotos = obras.map((o) => { const im = $("img", o); return { src: im.currentSrc || im.src, alt: im.alt, el: im, etq: $("figcaption span", o).textContent }; });
  let lbIdx = 0;

  function pintaLb(i) {
    lbIdx = (i + fotos.length) % fotos.length;
    const f = fotos[lbIdx];
    lbImg.src = f.el.getAttribute("src");
    lbImg.alt = f.alt;
    lbCont.textContent = `${String(lbIdx + 1).padStart(2, "0")} / ${fotos.length}`;
    if (lbCta && WHATSAPP_NUMBER) {
      const tipo = f.etq === "PROYECTO" ? "un proyecto como el de la foto " + (lbIdx + 1) : "algo como el " + f.etq.toLowerCase() + " de la foto " + (lbIdx + 1);
      lbCta.href = waUrl(`Hola JAAE Carpintería, quiero ${tipo} de su galería. ¿Me ayudan con una cotización?`);
    }
  }
  function abrirLb(i) {
    pintaLb(i);
    const origen = fotos[lbIdx].el.getBoundingClientRect();
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
    document.documentElement.style.overflow = "hidden";
    const finalR = lbImg.getBoundingClientRect();
    const mover = () => {
      const f = lbImg.getBoundingClientRect();
      if (!f.width || !origen.width) return;
      const dx = origen.left + origen.width / 2 - (f.left + f.width / 2);
      const dy = origen.top + origen.height / 2 - (f.top + f.height / 2);
      const s = Math.max(origen.width / f.width, origen.height / f.height);
      if (hasAnime() && !reduce) {
        anime({ targets: lbImg, translateX: [dx, 0], translateY: [dy, 0], scale: [s, 1], opacity: [0.6, 1], duration: 650, easing: "easeOutExpo" });
      }
    };
    if (lbImg.complete) mover(); else lbImg.addEventListener("load", mover, { once: true });
    void finalR;
  }
  function cerrarLb() {
    if (hasAnime() && !reduce) {
      const o = fotos[lbIdx].el.getBoundingClientRect();
      const f = lbImg.getBoundingClientRect();
      const dx = o.left + o.width / 2 - (f.left + f.width / 2);
      const dy = o.top + o.height / 2 - (f.top + f.height / 2);
      anime({ targets: lbImg, translateX: dx, translateY: dy, scale: Math.max(o.width / f.width, o.height / f.height), opacity: 0.2, duration: 380, easing: "easeInCubic", complete: fin });
    } else fin();
    function fin() {
      if (lb.open) lb.close();
      lbImg.style.transform = ""; lbImg.style.opacity = "";
      document.documentElement.style.overflow = "";
    }
  }
  function cambiaLb(d) {
    if (hasAnime() && !reduce) {
      anime({ targets: lbImg, opacity: 0, translateX: -d * 40, duration: 180, easing: "easeInQuad", complete: () => { pintaLb(lbIdx + d); anime({ targets: lbImg, opacity: [0, 1], translateX: [d * 40, 0], duration: 320, easing: "easeOutQuad" }); } });
    } else pintaLb(lbIdx + d);
  }
  obras.forEach((o, i) => $(".obra-btn", o).addEventListener("click", () => abrirLb(i)));
  $(".lb-cerrar", lb).addEventListener("click", cerrarLb);
  $(".lb-prev", lb).addEventListener("click", () => cambiaLb(-1));
  $(".lb-sig", lb).addEventListener("click", () => cambiaLb(1));
  lb.addEventListener("cancel", (e) => { e.preventDefault(); cerrarLb(); });
  lb.addEventListener("close", () => { document.documentElement.style.overflow = ""; });
  lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") cambiaLb(-1); if (e.key === "ArrowRight") cambiaLb(1); });
  let sx = 0;
  lb.addEventListener("touchstart", (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) cambiaLb(d < 0 ? 1 : -1); }, { passive: true });
  lb.addEventListener("click", (e) => { if (e.target === lb) cerrarLb(); });

  /* ---------------------------------------------------------
     Escenas por progreso (un único bucle rAF con interpolación)
     --------------------------------------------------------- */
  const puertaSec = $("#puertas"), puertaEsc = $(".puerta-escena");
  const puertaT2 = $(".puerta-t2");
  const ventSec = $("#pared"), ventEsc = $(".ventana-escena"), ventTxt = $(".ventana-txt");
  const apilas = $$(".apila");
  const pxEls = $$(".px");
  const finalSec = $("#contacto"), pieGig = $(".pie-gigante");
  const heroEl = hero;

  const prog = (el) => { // progreso de una escena fijada (sticky) 0→1
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total > 0 ? clamp(-r.top / total) : 0;
  };
  const S = { man: 0, puerta: 1, vent: 1, gal: 0, hero: 0, fin: 1 };
  const FACT = 0.085;
  let rafEsc = 0;

  function frameEscenas() {
    rafEsc = 0;
    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    let seguir = false;

    // Cabecera + barra de progreso (inmediato)
    hdr.classList.toggle("scrolled", scrollY > 40);
    const maxS = document.documentElement.scrollHeight - vh;
    progreso.style.setProperty("--sp", maxS > 0 ? clamp(scrollY / maxS).toFixed(4) : 0);

    if (reduce) { estadosFinales(); return; }

    // ---- lecturas ----
    const rHero = heroEl.getBoundingClientRect();
    const pHero = clamp(-rHero.top / (rHero.height * 0.9));
    const rMan = manifiesto.getBoundingClientRect();
    const oMan = clamp((vh * 0.95 - rMan.top) / (rMan.height * 0.8 + vh * 0.3));
    const oPuerta = prog(puertaSec);
    const oVent = prog(ventSec);
    const oGal = galeria.classList.contains("pin") ? prog(galeria) : 0;
    const rFin = finalSec.getBoundingClientRect();
    const oFin = clamp((vh - rFin.top) / (rFin.height * 0.9));

    // ---- interpolación ----
    S.hero = lerp(S.hero, pHero, 0.2);
    S.man = lerp(S.man, oMan, FACT * 1.4);
    S.puerta = lerp(S.puerta, oPuerta, FACT);
    S.vent = lerp(S.vent, oVent, FACT);
    S.gal = lerp(S.gal, oGal, FACT);
    S.fin = lerp(S.fin, oFin, 0.15);
    if (Math.abs(S.man - oMan) > 0.0006 || Math.abs(S.puerta - oPuerta) > 0.0006 || Math.abs(S.vent - oVent) > 0.0006 || Math.abs(S.gal - oGal) > 0.0006 || Math.abs(S.hero - pHero) > 0.001 || Math.abs(S.fin - oFin) > 0.001) seguir = true;

    // Hero
    if (rHero.bottom > -50) heroEl.style.setProperty("--hp", S.hero.toFixed(4));

    // Manifiesto
    if (palabrasMan.length && rMan.bottom > -100 && rMan.top < vh + 100) {
      const N = palabrasMan.length;
      const t = clamp((S.man - 0.1) / 0.62) * (N + 1);
      palabrasMan.forEach((w, i) => w.style.setProperty("--w", clamp(t - i).toFixed(3)));
    }

    // Servicios apilados + parallax
    apilas.forEach((card, i) => {
      const sig = apilas[i + 1];
      const inn = card.firstElementChild;
      if (!sig) { return; }
      const top = 76 + i * 12;
      const d = sig.getBoundingClientRect().top - top;
      const pr = clamp(1 - d / (vh * 0.85));
      inn.style.setProperty("--sc", (1 - 0.06 * pr).toFixed(4));
      inn.style.setProperty("--br", (1 - 0.28 * pr).toFixed(3));
    });
    pxEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const t = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      el.style.setProperty("--py", (t * -6).toFixed(2) + "%");
    });

    // Puerta 3D
    {
      const p = S.puerta;
      puertaEsc.style.setProperty("--p", p.toFixed(4));
      const t1 = smooth(0.1, 0.22, p) * (1 - smooth(0.82, 0.94, p));
      const t2 = smooth(0.76, 0.9, p);
      puertaEsc.style.setProperty("--t1", t1.toFixed(3));
      puertaEsc.style.setProperty("--t2", t2.toFixed(3));
      puertaT2.classList.toggle("on", t2 > 0.5);
    }

    // Proceso: pasos encendidos, línea y plano
    {
      const rP = proceso.getBoundingClientRect();
      if (rP.bottom > 0 && rP.top < vh) {
        const lin = vh * 0.55;
        let activo = -1;
        pasos.forEach((p, i) => {
          const r = p.getBoundingClientRect();
          const on = r.top < lin;
          p.classList.toggle("on", on);
          if (on) activo = i;
        });
        const rl = listaPasos.getBoundingClientRect();
        listaPasos.style.setProperty("--lp", clamp((lin - rl.top) / rl.height).toFixed(4));
        if (mqDesk.matches) setPaso(activo);
        else if (!planoMovilHecho && planoWrap.getBoundingClientRect().top < vh * 0.8) { planoMovilHecho = true; pasoActivo = 4; if (planoWrap) planoWrap.style.setProperty("--paso", 0); dibujarPlano(4, true); }
      }
    }

    // Galería horizontal fijada
    if (galeria.classList.contains("pin")) {
      galPista.style.transform = `translate3d(${(-S.gal * galMax).toFixed(2)}px,0,0)`;
      obras.forEach((o) => {
        const r = o.getBoundingClientRect();
        if (r.right < -50 || r.left > window.innerWidth + 50) return;
        const d = clamp(Math.abs(r.left + r.width / 2 - window.innerWidth / 2) / (window.innerWidth / 2));
        o.style.setProperty("--z", (1 + 0.08 * d).toFixed(3));
      });
    }

    // Ventana que crece
    {
      const p = S.vent;
      const v = smooth(0.08, 0.72, p);
      const t = smooth(0.78, 0.92, p);
      ventEsc.style.setProperty("--v", v.toFixed(4));
      ventEsc.style.setProperty("--t", t.toFixed(3));
      ventTxt.classList.toggle("on", t > 0.5);
    }

    // Final: "JAAE" que se rellena
    if (pieGig) pieGig.style.setProperty("--fp", (clamp((S.fin - 0.35) / 0.6) * 100).toFixed(1) + "%");

    // Índice lateral
    let actual = 0;
    secciones.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top <= vh * 0.4) actual = i; });
    itemsIndice.forEach((a, i) => a.classList.toggle("on", i === actual));

    if (seguir) pedirEscenas();
  }

  function estadosFinales() {
    palabrasMan.forEach((w) => w.style.setProperty("--w", 1));
    puertaEsc.style.setProperty("--p", 1); puertaEsc.style.setProperty("--t1", 1); puertaEsc.style.setProperty("--t2", 1);
    puertaT2.classList.add("on");
    ventEsc.style.setProperty("--v", 1); ventEsc.style.setProperty("--t", 1); ventTxt.classList.add("on");
    pasos.forEach((p) => p.classList.add("on"));
    listaPasos.style.setProperty("--lp", 1);
    planoWrap.style.setProperty("--paso", 4);
    dibujarPlano(4, false);
    if (pieGig) pieGig.style.setProperty("--fp", "100%");
    const vh = window.innerHeight;
    let actual = 0;
    secciones.forEach((s, i) => { if (s.getBoundingClientRect().top <= vh * 0.4) actual = i; });
    itemsIndice.forEach((a, i) => a.classList.toggle("on", i === actual));
  }

  function pedirEscenas() { if (!rafEsc) rafEsc = requestAnimationFrame(frameEscenas); }
  window.addEventListener("scroll", pedirEscenas, { passive: true });
  window.addEventListener("resize", () => { medirGaleria(); actualizaPuntos(); pedirEscenas(); });
  window.addEventListener("load", () => { medirGaleria(); pedirEscenas(); });
  medirGaleria();
  actualizaPuntos();
  // Primer estado sin interpolación para que no "viaje" al cargar en mitad de la página
  (function primerEstado() {
    const vh = window.innerHeight;
    S.puerta = prog(puertaSec); S.vent = prog(ventSec); S.gal = galeria.classList.contains("pin") ? prog(galeria) : 0;
    const rMan = manifiesto.getBoundingClientRect();
    S.man = clamp((vh * 0.95 - rMan.top) / (rMan.height * 0.8 + vh * 0.3));
    const rFin = finalSec.getBoundingClientRect();
    S.fin = clamp((vh - rFin.top) / (rFin.height * 0.9));
    S.hero = clamp(-hero.getBoundingClientRect().top / (hero.getBoundingClientRect().height * 0.9));
  })();
  pedirEscenas();
  setTimeout(() => { medirGaleria(); pedirEscenas(); }, 1500);
  // las imágenes de la pista cambian el ancho al cargar
  $$("img", galPista).forEach((im) => im.addEventListener("load", () => { medirGaleria(); pedirEscenas(); }, { once: true }));

  /* ---------------------------------------------------------
     Bento: foco de luz + inclinación 3D
     --------------------------------------------------------- */
  $$(".tesela").forEach((t) => {
    t.addEventListener("pointermove", (e) => {
      const r = t.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      t.style.setProperty("--mx", x + "px");
      t.style.setProperty("--my", y + "px");
      if (finePointer && !reduce && window.innerWidth >= 1100 && t.classList.contains("in")) {
        const rx = (0.5 - y / r.height) * 8, ry = (x / r.width - 0.5) * 8;
        t.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }
    });
    t.addEventListener("pointerleave", () => { t.style.transform = ""; });
  });

  /* ---------------------------------------------------------
     Asistente → WhatsApp
     --------------------------------------------------------- */
  const form = $("#asistente");
  if (form) {
    const pasosF = $$(".asist-paso", form);
    const barras = $$(".asist-barra i", form);
    const nTxt = $("[data-paso-n]", form);
    const btnAtras = $("[data-atras]", form);
    const btnSig = $("[data-sig]", form);
    const btnEnviar = $("[data-enviar]", form);
    const err = $("[data-error]", form);
    const prevImgs = $$(".prev-img");
    const prevEt = $("[data-prev-et]");
    const nombresTipo = { closet: "Closet", cocina: "Cocina", puerta: "Puerta", mueble: "Mueble", otro: "Otro" };
    let actual = 0;

    if (!WHATSAPP_NUMBER) { btnEnviar.hidden = true; }

    function irA(n, animar = true) {
      const sale = pasosF[actual];
      const entra = pasosF[n];
      const dir = n > actual ? 1 : -1;
      const hecho = () => {
        pasosF.forEach((p, i) => p.classList.toggle("activo", i === n));
        actual = n;
        nTxt.textContent = String(n + 1);
        barras.forEach((b, i) => b.classList.toggle("on", i <= n));
        btnAtras.hidden = n === 0;
        btnSig.hidden = n === 2;
        btnEnviar.hidden = n !== 2 || !WHATSAPP_NUMBER;
        err.textContent = "";
        if (hasAnime() && animar && !reduce) anime({ targets: entra, opacity: [0, 1], translateX: [dir * 36, 0], duration: 420, easing: "easeOutCubic" });
      };
      if (animar && sale !== entra && hasAnime() && !reduce) {
        anime({ targets: sale, opacity: 0, translateX: -dir * 36, duration: 220, easing: "easeInQuad", complete: () => { sale.style.opacity = ""; sale.style.transform = ""; hecho(); } });
      } else hecho();
    }
    function valida(n) {
      if (n === 0 && !form.tipo.value) { err.textContent = "Elige qué quieres fabricar para continuar."; return false; }
      if (n === 1 && !form.acabado.value) { err.textContent = "Elige un acabado (o \"Aún no sé\")."; return false; }
      if (n === 2 && !form.nombre.value.trim()) { err.textContent = "Dinos tu nombre para saber con quién hablamos."; form.nombre.focus(); return false; }
      return true;
    }
    btnSig.addEventListener("click", () => { if (valida(actual)) irA(actual + 1); });
    btnAtras.addEventListener("click", () => irA(actual - 1));
    // Avance cómodo: al elegir una opción, pasa al siguiente paso
    $$('input[name="tipo"]', form).forEach((r) => r.addEventListener("change", () => {
      const v = r.value;
      prevImgs.forEach((im) => im.classList.toggle("on", im.dataset.tipo === v));
      if (prevEt) prevEt.textContent = nombresTipo[v].toUpperCase();
      err.textContent = "";
      setTimeout(() => { if (actual === 0) irA(1); }, 380);
    }));
    $$('input[name="acabado"]', form).forEach((r) => r.addEventListener("change", () => {
      err.textContent = "";
      setTimeout(() => { if (actual === 1) irA(2); }, 380);
    }));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (actual < 2) { if (valida(actual)) irA(actual + 1); return; }
      if (!valida(2) || !WHATSAPP_NUMBER) return;
      const nombre = form.nombre.value.trim();
      const det = form.detalles.value.trim();
      const msg = `Hola JAAE Carpintería, soy ${nombre}. Quiero cotizar: ${nombresTipo[form.tipo.value].toLowerCase()}. Acabado: ${form.acabado.value}. ${det ? det + " " : ""}¿Me ayudan con una cotización?`;
      const lbl = $("span", btnEnviar);
      const antes = lbl.textContent;
      lbl.textContent = "Abriendo WhatsApp…";
      btnEnviar.disabled = true;
      const w = window.open(waUrl(msg), "_blank");
      if (w) { try { w.opener = null; } catch (_) {} } else { window.location.href = waUrl(msg); }
      setTimeout(() => { lbl.textContent = antes; btnEnviar.disabled = false; }, 2500);
    });
    barras.forEach((b, i) => { b.style.cursor = "default"; void i; });
  }

  /* ---------------------------------------------------------
     FAQ animado (details + grid-rows)
     --------------------------------------------------------- */
  $$(".qa").forEach((d) => {
    const resumen = $("summary", d);
    const cuerpo = $(".qa-r", d);
    if (d.open) d.classList.add("abierto");
    resumen.addEventListener("click", (e) => {
      e.preventDefault();
      if (!d.classList.contains("abierto")) {
        d.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("abierto")));
      } else {
        d.classList.remove("abierto");
        const fin = () => { if (!d.classList.contains("abierto")) d.open = false; };
        cuerpo.addEventListener("transitionend", fin, { once: true });
        setTimeout(fin, 600);
      }
    });
  });

  /* ---------------------------------------------------------
     CTA final magnético
     --------------------------------------------------------- */
  const mag = $(".magnetico");
  if (mag && finePointer && !reduce) {
    const zona = mag.parentElement;
    window.addEventListener("pointermove", (e) => {
      const r = mag.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 220) {
        mag.style.transform = `translate(${clamp(dx * 0.12, -12, 12).toFixed(1)}px,${clamp(dy * 0.18, -12, 12).toFixed(1)}px)`;
      } else if (mag.style.transform) mag.style.transform = "";
    }, { passive: true });
    zona.addEventListener("pointerleave", () => { mag.style.transform = ""; });
  }

  /* ---------------------------------------------------------
     Botón flotante de WhatsApp: etiqueta tras 5 s (desktop)
     --------------------------------------------------------- */
  const waFlot = $(".wa-flot");
  if (waFlot && WHATSAPP_NUMBER) {
    setTimeout(() => { if (window.innerWidth >= 760) { waFlot.classList.add("etq-on"); setTimeout(() => waFlot.classList.remove("etq-on"), 7000); } }, 5000 + MAX);
  }

  /* ---------------------------------------------------------
     Anclas: cierra el menú y respeta movimiento reducido
     --------------------------------------------------------- */
  if (reduce) $$("a[href^='#']").forEach((a) => a.addEventListener("click", () => { html.style.scrollBehavior = "auto"; }));
})();
