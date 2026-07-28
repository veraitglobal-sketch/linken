/**
 * Hansala testimonials — drop-in for any host site.
 *
 * <div data-hansala-testimonials="your-slug" data-preset="minimal"></div>
 * <script async src="https://hansala.com/hs-testimonials.js"></script>
 */
(function () {
  "use strict";

  var SCRIPT =
    document.currentScript ||
    document.getElementsByTagName("script")[
      document.getElementsByTagName("script").length - 1
    ];

  var ORIGIN = (function () {
    try {
      return new URL(SCRIPT.src).origin;
    } catch (e) {
      return "https://hansala.com";
    }
  })();

  var CSS =
    ".hs-tm-root{box-sizing:border-box;color:var(--hs-tm-text);text-align:left}" +
    ".hs-tm-root *{box-sizing:border-box}" +
    ".hs-tm-list{display:grid;gap:1.75rem;margin:0;padding:0}" +
    ".hs-tm-card{margin:0;padding:0;border:0;background:transparent;position:relative}" +
    ".hs-tm-mark{display:block;font-family:Georgia,'Times New Roman',serif;font-size:2.4em;" +
    "line-height:1;color:var(--hs-tm-accent);opacity:.5;margin:0 0 .1em;user-select:none}" +
    ".hs-tm-body{margin:0;font-family:Georgia,'Times New Roman',serif;font-size:1.05em;" +
    "font-weight:500;font-style:normal;line-height:1.35;letter-spacing:-.03em;color:var(--hs-tm-text)}" +
    ".hs-tm-meta{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin-top:1.1em}" +
    ".hs-tm-author{margin:0;font-size:.82em;font-weight:600;letter-spacing:-.01em;color:var(--hs-tm-text);" +
    "font-family:system-ui,-apple-system,sans-serif}" +
    ".hs-tm-role{margin:.15em 0 0;font-size:.75em;line-height:1.35;color:var(--hs-tm-muted);" +
    "font-family:system-ui,-apple-system,sans-serif}" +
    ".hs-tm-prov{margin:.45em 0 0;font-size:.7em;line-height:1.4;color:var(--hs-tm-muted);" +
    "font-family:system-ui,-apple-system,sans-serif}" +
    ".hs-tm-seal{flex-shrink:0;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;" +
    "text-decoration:none;color:var(--hs-tm-accent);font-family:system-ui,-apple-system,sans-serif}" +
    ".hs-tm-empty{margin:0;color:var(--hs-tm-muted);font-size:13px;font-family:system-ui,sans-serif}";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function vars(obj) {
    var out = "";
    for (var k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) out += k + ":" + obj[k] + ";";
    }
    return out;
  }

  function card(t, href) {
    var roleBits = [t.author_role, t.author_company && t.author_company.name]
      .filter(Boolean)
      .join(" · ");
    return (
      '<figure class="hs-tm-card">' +
      '<span class="hs-tm-mark" aria-hidden="true">“</span>' +
      '<blockquote class="hs-tm-body">' +
      esc(t.body) +
      "</blockquote>" +
      '<figcaption class="hs-tm-meta"><div>' +
      '<p class="hs-tm-author">' +
      esc(t.author_name) +
      "</p>" +
      (roleBits ? '<p class="hs-tm-role">' + esc(roleBits) + "</p>" : "") +
      (t.provenance_line
        ? '<p class="hs-tm-prov">' + esc(t.provenance_line) + "</p>"
        : "") +
      '</div><a class="hs-tm-seal" href="' +
      esc(href) +
      '" target="_blank" rel="noopener noreferrer">Hansala</a></figcaption></figure>'
    );
  }

  function style(root) {
    if (root.querySelector("style[data-hs-tm]")) return;
    var el = document.createElement("style");
    el.setAttribute("data-hs-tm", "1");
    el.textContent = CSS;
    root.appendChild(el);
  }

  function render(el, data) {
    var theme = data.theme || {};
    el.className = (el.className ? el.className + " " : "") + "hs-tm-root";
    el.setAttribute("style", vars(theme.css_vars || {}));
    style(el);
    var items = data.testimonials || [];
    if (!items.length) {
      el.innerHTML = '<p class="hs-tm-empty">No published testimonials yet.</p>';
      return;
    }
    var href = (data.attribution && data.attribution.url) || "#";
    var html = '<div class="hs-tm-list">';
    for (var i = 0; i < items.length; i++) html += card(items[i], href);
    el.innerHTML = html + "</div>";
  }

  function mount(el) {
    var slug = el.getAttribute("data-hansala-testimonials");
    if (!slug) return;
    var origin = el.getAttribute("data-api") || ORIGIN;
    var q = [];
    var preset = el.getAttribute("data-preset");
    var limit = el.getAttribute("data-limit");
    if (preset) q.push("preset=" + encodeURIComponent(preset));
    if (limit) q.push("limit=" + encodeURIComponent(limit));
    var url =
      origin.replace(/\/$/, "") +
      "/api/v1/companies/" +
      encodeURIComponent(slug) +
      "/testimonials" +
      (q.length ? "?" + q.join("&") : "");

    el.setAttribute("aria-busy", "true");
    fetch(url, { credentials: "omit" })
      .then(function (r) {
        if (!r.ok) throw new Error("bad");
        return r.json();
      })
      .then(function (data) {
        render(el, data);
        el.removeAttribute("aria-busy");
      })
      .catch(function () {
        el.removeAttribute("aria-busy");
        el.innerHTML = '<p class="hs-tm-empty">Testimonials unavailable.</p>';
      });
  }

  function boot() {
    var nodes = document.querySelectorAll("[data-hansala-testimonials]");
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
