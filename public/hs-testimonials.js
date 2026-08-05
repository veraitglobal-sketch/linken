/**
 * Hansala testimonials — drop-in for any host site.
 * Renders inside Shadow DOM so host CSS cannot hide the seal or provenance.
 *
 * <div data-hansala-testimonials="your-slug" data-preset="minimal"></div>
 * <script async src="https://hansala.com/hs-testimonials.js"></script>
 *
 * Cache-bust when updating: ?v=2
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
    ":host{all:initial;display:block;font-family:system-ui,-apple-system,sans-serif}" +
    ".hs-tm-root{box-sizing:border-box;color:var(--hs-tm-text,#0d1210);text-align:left;" +
    "font-family:system-ui,-apple-system,sans-serif}" +
    ".hs-tm-root *,.hs-tm-root *::before,.hs-tm-root *::after{box-sizing:border-box}" +
    ".hs-tm-list{display:grid;gap:1.75rem;margin:0;padding:0}" +
    ".hs-tm-list[data-layout=stack]{gap:2rem}" +
    ".hs-tm-list[data-layout=carousel]{display:flex;overflow-x:auto;gap:1.25rem;scroll-snap-type:x mandatory}" +
    ".hs-tm-list[data-layout=carousel] .hs-tm-card{flex:0 0 min(100%,22rem);scroll-snap-align:start}" +
    ".hs-tm-card{margin:0;padding:0;border:0;background:transparent;position:relative}" +
    ".hs-tm-mark{display:block;font-family:Georgia,'Times New Roman',serif;font-size:2.4em;" +
    "line-height:1;color:var(--hs-tm-accent,#1a5c51);opacity:.5;margin:0 0 .1em;user-select:none}" +
    ".hs-tm-body{margin:0;font-family:Georgia,'Times New Roman',serif;font-size:1.05em;" +
    "font-weight:500;font-style:normal;line-height:1.35;letter-spacing:-.03em;color:var(--hs-tm-text,#0d1210)}" +
    ".hs-tm-meta{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin-top:1.1em}" +
    ".hs-tm-author{margin:0;font-size:.82em;font-weight:600;letter-spacing:-.01em;color:var(--hs-tm-text,#0d1210)}" +
    ".hs-tm-role{margin:.15em 0 0;font-size:.75em;line-height:1.35;color:var(--hs-tm-muted,#66706b)}" +
    ".hs-tm-prov{margin:.45em 0 0;font-size:.7em;line-height:1.4;color:var(--hs-tm-muted,#66706b)}" +
    ".hs-tm-seal{flex-shrink:0;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;" +
    "text-decoration:none;color:var(--hs-tm-accent,#1a5c51)}" +
    ".hs-tm-empty{margin:0;color:var(--hs-tm-muted,#66706b);font-size:13px}";

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

  /** Seal + provenance are always present — never optional in markup. */
  function card(t, href) {
    var roleBits = [t.author_role, t.author_company && t.author_company.name]
      .filter(Boolean)
      .join(" · ");
    var prov = t.provenance_line
      ? esc(t.provenance_line)
      : "Confirmed on Hansala";
    return (
      '<figure class="hs-tm-card">' +
      '<span class="hs-tm-mark" aria-hidden="true">“</span>' +
      '<blockquote class="hs-tm-body">' +
      esc(t.body) +
      "</blockquote>" +
      '<figcaption class="hs-tm-meta hs-tm-attribution"><div>' +
      '<p class="hs-tm-author">' +
      esc(t.author_name) +
      "</p>" +
      (roleBits ? '<p class="hs-tm-role">' + esc(roleBits) + "</p>" : "") +
      '<p class="hs-tm-prov">' +
      prov +
      "</p>" +
      '</div><a class="hs-tm-seal" href="' +
      esc(href) +
      '" target="_blank" rel="noopener noreferrer">Hansala</a></figcaption></figure>'
    );
  }

  function ensureShadow(host) {
    if (host.shadowRoot) return host.shadowRoot;
    try {
      return host.attachShadow({ mode: "open" });
    } catch (e) {
      return null;
    }
  }

  function renderInto(root, data) {
    var theme = data.theme || {};
    var styleEl = document.createElement("style");
    styleEl.textContent = CSS;
    var wrap = document.createElement("div");
    wrap.className = "hs-tm-root";
    wrap.setAttribute("style", vars(theme.css_vars || {}));

    var items = data.testimonials || [];
    if (!items.length) {
      wrap.innerHTML =
        '<p class="hs-tm-empty">No published testimonials yet.</p>';
    } else {
      var href = (data.attribution && data.attribution.url) || "#";
      var layout = data.layout || "grid";
      var html =
        '<div class="hs-tm-list" data-layout="' + esc(layout) + '">';
      for (var i = 0; i < items.length; i++) html += card(items[i], href);
      wrap.innerHTML = html + "</div>";
    }

    root.innerHTML = "";
    root.appendChild(styleEl);
    root.appendChild(wrap);
  }

  function mount(el) {
    if (el.getAttribute("data-hs-tm-mounted") === "1") return;
    el.setAttribute("data-hs-tm-mounted", "1");

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
        var shadow = ensureShadow(el);
        if (shadow) {
          renderInto(shadow, data);
        } else {
          // Rare fallback — still emit seal/provenance in light DOM
          renderInto(el, data);
        }
        el.removeAttribute("aria-busy");
      })
      .catch(function () {
        el.removeAttribute("aria-busy");
        var shadow = ensureShadow(el);
        var target = shadow || el;
        target.innerHTML =
          '<style>' +
          CSS +
          '</style><p class="hs-tm-empty">Testimonials unavailable.</p>';
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
