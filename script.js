/* Zajednička skripta: tema, zamućeni naslov, pojavljivanje pri skrolanju, bočni indeks, obrazac. */
(() => {
  const R = document.documentElement;
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Svijetla / tamna tema (izbor se pamti)
  const tgl = document.getElementById("theme");
  if (tgl) tgl.onclick = () => {
    const d = R.dataset.theme === "dark" ? "light" : "dark";
    R.dataset.theme = d;
    try { localStorage.setItem("theme", d); } catch (e) {}
  };

  // Naslov: svaka riječ ima vlastito horizontalno zamućenje koje se smiri pri učitavanju,
  // a izoštri se kad prijeđeš preko nje. Jačina: data-blur na elementu .w
  const F = [...document.querySelectorAll("feGaussianBlur.hb")];
  const W = [...document.querySelectorAll(".w")];
  if (F.length && W.length) {
    const rest = W.map(w => +w.dataset.blur || 7);
    const cur = rest.map(r => (rm ? r : r * 6));
    const tgt = rest.slice();
    let raf = 0, t0 = 0;
    const step = t => {
      const dt = Math.min(0.1, (t - t0) / 1000 || 0.016);
      t0 = t;
      const a = 1 - Math.exp(-dt * 5), k = innerWidth / 1440;
      let moving = false;
      cur.forEach((c, i) => {
        const d = tgt[i] - c;
        if (Math.abs(d) > 0.05) { cur[i] = c + d * a; moving = true; } else cur[i] = tgt[i];
        if (F[i]) F[i].setAttribute("stdDeviation", (cur[i] * k).toFixed(2) + " 0");
      });
      raf = moving ? requestAnimationFrame(step) : 0;
    };
    const go = () => { if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(step); } };
    W.forEach((w, i) => {
      w.addEventListener("pointerenter", () => { tgt[i] = rest[i] * 0.06; go(); });
      w.addEventListener("pointerleave", () => { tgt[i] = rest[i]; go(); });
    });
    go();
    addEventListener("resize", go);
  }

  // Elementi se pojavljuju postupno dok skrolaš
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll(".rv").forEach(el => io.observe(el));

  // Bočni indeks (samo na početnoj): aktivna je sekcija koja je na sredini ekrana
  const S = [...document.querySelectorAll("[data-s]")].filter(s => s.tagName !== "FOOTER");
  const T = [...document.querySelectorAll(".idx i")];
  const N = document.getElementById("idxn");
  if (S.length && T.length) {
    T.forEach((t, j) => { t.style.display = j < S.length ? "" : "none"; });
    let busy = false, last = -1;
    const upd = () => {
      busy = false;
      const y = innerHeight / 2;
      let i = 0;
      S.forEach((s, j) => { if (s.getBoundingClientRect().top <= y) i = j; });
      if (i === last) return;
      last = i;
      T.forEach((t, j) => t.classList.toggle("on", j === i));
      if (N) N.textContent = "0" + (i + 1);
    };
    const queue = () => { if (!busy) { busy = true; requestAnimationFrame(upd); } };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    upd();
  }

  // Kontakt obrazac (Formspree): šalje bez napuštanja stranice; bez JS-a radi običnim slanjem
  const form = document.querySelector("form[data-ajax]");
  if (form) form.addEventListener("submit", async e => {
    e.preventDefault();
    const note = form.querySelector(".note"), btn = form.querySelector(".send");
    btn.disabled = true;
    note.textContent = "Šaljem…";
    try {
      const r = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (r.ok) { form.reset(); note.textContent = "Hvala! Poruka je poslana."; }
      else note.textContent = "Slanje nije uspjelo. Pokušaj ponovno za nekoliko trenutaka.";
    } catch (err) {
      note.textContent = "Nema veze s poslužiteljem. Provjeri internet i pokušaj ponovno.";
    }
    btn.disabled = false;
  });
})();