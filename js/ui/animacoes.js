export function iniciarAnimacoes() {
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)");
  if (!reduzir.matches && "IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas) => entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("revelado");
        observador.unobserve(entrada.target);
      }
    }), { threshold: 0.08 });
    document.querySelectorAll("[data-revelar]").forEach((no) => {
      if (no.getBoundingClientRect().top < innerHeight) no.classList.add("revelado");
      else no.classList.add("aguarda-revelacao");
      observador.observe(no);
    });
  }
  const estrutura = document.querySelector("[data-estrutura-3d]");
  if (!estrutura) return;
  let quadro = 0, x = 0, y = 0, alvoX = 0, alvoY = 0, visivel = true;
  function animar() {
    quadro = 0;
    if (reduzir.matches || !visivel || document.hidden) return;
    x += (alvoX - x) * 0.08;
    y += (alvoY - y) * 0.08;
    estrutura.style.setProperty("--ponteiro-x", x.toFixed(3) + "deg");
    estrutura.style.setProperty("--ponteiro-y", y.toFixed(3) + "deg");
    if (Math.abs(x - alvoX) + Math.abs(y - alvoY) > 5e-3) quadro = requestAnimationFrame(animar);
  }
  function reagir(evento) {
    if (reduzir.matches || evento.pointerType === "touch") return;
    const r = estrutura.getBoundingClientRect();
    alvoX = ((evento.clientX - r.left) / r.width - 0.5) * 7;
    alvoY = ((evento.clientY - r.top) / r.height - 0.5) * 5;
    if (!quadro) quadro = requestAnimationFrame(animar);
  }
  estrutura.addEventListener("pointermove", reagir, { passive: true });
  estrutura.addEventListener("pointerleave", () => {
    alvoX = alvoY = 0;
    if (!quadro) quadro = requestAnimationFrame(animar);
  });
  new IntersectionObserver((entradas) => {
    visivel = entradas[0].isIntersecting;
    estrutura.classList.toggle("animacao-pausada", !visivel || document.hidden);
  }).observe(estrutura);
  document.addEventListener("visibilitychange", () => {
    estrutura.classList.toggle("animacao-pausada", document.hidden || !visivel);
    if (document.hidden) { cancelAnimationFrame(quadro); quadro = 0; }
  });
  reduzir.addEventListener("change", () => {
    if (reduzir.matches) {
      cancelAnimationFrame(quadro);
      quadro = 0;
      estrutura.style.removeProperty("--ponteiro-x");
      estrutura.style.removeProperty("--ponteiro-y");
    }
  });
}
