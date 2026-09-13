(() => {
  requestAnimationFrame(() => document.body.classList.add("is-ready"));

  const nav = document.querySelector(".nav");
  const bar = document.querySelector(".progress");
  const parallax = document.querySelector(".hero-parallax");
  const onScroll = () => {
    const y = window.scrollY || 0;
    nav?.classList.toggle("solid", y > 20);
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    }
    if (parallax && y < window.innerHeight * 1.2) {
      parallax.style.transform = `translate3d(0, ${y * 0.42}px, 0)`;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const nodes = document.querySelectorAll(".in");
  if (!nodes.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    nodes.forEach((el) => el.classList.add("ok"));
  } else {
  const count = (el) => {
    const to = Number(el.dataset.count || 0);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3)))).padStart(2, "0");
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("ok");
          entry.target.querySelectorAll("[data-count]").forEach(count);
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14 },
  );
  nodes.forEach((el) => io.observe(el));
  }

  const track = document.querySelector("#deck");
  if (track) {
    const slides = [...track.querySelectorAll(".slide")];
    const now = document.querySelector("#deck-now");
    const prev = document.querySelector("#deck-prev");
    const next = document.querySelector("#deck-next");
    const dots = document.querySelector("#deck-dots");
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.className = "dot";
      b.type = "button";
      b.setAttribute("aria-label", `Go to ${i + 1}`);
      b.addEventListener("click", () => slides[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }));
      dots?.append(b);
    });

    const index = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let dist = Infinity;
      slides.forEach((slide, i) => {
        const c = slide.offsetLeft + slide.offsetWidth / 2;
        const d = Math.abs(c - mid);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      return best;
    };

    const sync = () => {
      const i = index();
      if (now) now.textContent = String(i + 1).padStart(2, "0");
      dots?.querySelectorAll(".dot").forEach((d, n) => d.classList.toggle("on", n === i));
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    };

    const go = (dir) => {
      const i = Math.min(slides.length - 1, Math.max(0, index() + dir));
      slides[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    };

    prev?.addEventListener("click", () => go(-1));
    next?.addEventListener("click", () => go(1));
    track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });

    let hold = false;
    let startX = 0;
    let startLeft = 0;
    let moved = 0;
    track.addEventListener("pointerdown", (e) => {
      hold = true;
      moved = 0;
      startX = e.clientX;
      startLeft = track.scrollLeft;
      track.classList.add("is-drag");
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!hold) return;
      moved = startX - e.clientX;
      track.scrollLeft = startLeft + moved;
    });
    const endDrag = () => {
      if (!hold) return;
      hold = false;
      track.classList.remove("is-drag");
      const i = index();
      slides[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    slides.forEach((slide) => {
      slide.addEventListener("click", (e) => {
        if (Math.abs(moved) > 8) e.preventDefault();
      });
    });
    track.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        track.scrollLeft += e.deltaY;
        e.preventDefault();
      },
      { passive: false },
    );
    sync();
  }

  const hero = document.querySelector("#hero");
  if (hero) {
    const slides = [...hero.querySelectorAll(".hero-slide")];
    const cap = document.querySelector("#hero-cap");
    const dots = document.querySelector("#hero-dots");
    let i = slides.findIndex((s) => s.classList.contains("is-on"));
    if (i < 0) i = 0;
    const wait = 4200;
    let clock;

    slides.forEach((_, n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Cover ${n + 1}`);
      b.addEventListener("click", () => show(n));
      dots?.append(b);
    });

    const show = (next) => {
      const prev = i;
      i = (next + slides.length) % slides.length;
      slides.forEach((s, n) => {
        s.classList.toggle("is-on", n === i);
        s.classList.toggle("is-out", n === prev && prev !== i);
        if (n === i) {
          const img = s.querySelector("img");
          if (img) {
            img.style.animation = "none";
            void img.offsetWidth;
            img.style.animation = "";
          }
        }
      });
      const active = slides[i];
      if (cap && active) {
        cap.textContent = `${String(i + 1).padStart(2, "0")} · ${active.dataset.name || ""}`;
        cap.href = active.dataset.href || "./projects.html";
      }
      dots?.querySelectorAll("button").forEach((d, n) => d.classList.toggle("on", n === i));
      play();
    };

    const play = () => {
      clearInterval(clock);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      clock = setInterval(() => show(i + 1), wait);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(clock);
      else play();
    });
    show(i);
  }

  const form = document.querySelector(".form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = form.querySelector(".form-note");
    if (note) note.textContent = "Received — we will write back if we are the right contractor.";
    form.reset();
  });
})();
