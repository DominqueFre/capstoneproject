// Help popover logic for .bar-help and .bar-help-btn

document.addEventListener("DOMContentLoaded", function () {
  const helpers = Array.from(document.querySelectorAll("[data-help]"));

  function closeAll(except) {
    helpers.forEach((help) => {
      if (help === except) return;
      help.classList.remove("is-open");
      const btn = help.querySelector(".bar-help-btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  helpers.forEach((help) => {
    const btn = help.querySelector(".bar-help-btn");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const willOpen = !help.classList.contains("is-open");
      closeAll(help);
      help.classList.toggle("is-open", willOpen);
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  });

  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest("[data-help]")) closeAll();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeAll();
  });
});
