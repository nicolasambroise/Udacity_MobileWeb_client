/**
 * Smooth Scroll to top
 */
document.getElementById('toTop').addEventListener('click', (event) => {
  event.preventDefault();
  // My Speed depend of current scroll position
  const duration = document.documentElement.scrollTop;
  const start = window.pageYOffset;
  const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
  if ('requestAnimationFrame' in window === false) {window.scroll(0, 0);return;}
  function scroll() {
    const current_time = 'now' in window.performance ? performance.now() : new Date().getTime();
    const time = Math.min(1, ((current_time - startTime) / duration));
    window.scroll(0, Math.ceil((time * (0 - start)) + start));
    if (window.pageYOffset === 0) {return;}
    requestAnimationFrame(scroll);
  }
  scroll();
});

/**
 * Defer CSS style Load
 * https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery
 */

var loadDeferredStyles = function() {
  console.log('loadDeferredStyles');
  var addStylesNode = document.getElementById('deferred-styles');
  var replacement = document.createElement('div');
  replacement.innerHTML = addStylesNode.textContent;
  document.body.appendChild(replacement);
  addStylesNode.parentElement.removeChild(addStylesNode);
};
var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
     window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
if (raf){ raf(function() { window.setTimeout(loadDeferredStyles, 0); });}
else { window.addEventListener('load', loadDeferredStyles);}
