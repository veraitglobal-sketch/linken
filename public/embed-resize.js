(function () {
  var ATTR = "data-hansala-embed";
  function apply(iframe, height) {
    if (!iframe || !height) return;
    iframe.style.height = Math.max(48, height) + "px";
  }
  function onMessage(event) {
    var data = event.data;
    if (!data || data.type !== "hansala-embed-resize") return;
    var frames = document.querySelectorAll("iframe[" + ATTR + "]");
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === event.source) {
        apply(frames[i], data.height);
        return;
      }
    }
  }
  window.addEventListener("message", onMessage);
})();
