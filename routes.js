/* Local launcher, 2026-11-11. Exact firmware allowlist; no range guessing. */
(function (root) {
  var routes = {};
  function add(versions, src, module) {
    versions.split(' ').forEach(function (fw) { routes[fw] = {src:src,module:module}; });
  }
  add('9.00 9.03 9.04 9.50 9.51 9.60', '900/alert.js', true);
  add('10.00 10.01 10.50 10.70 10.71 11.00 11.02', 'css/main.js', false);
  add('11.50 11.52 12.00 12.02', 'slopkit/chain_lapse.js', true);
  add('12.50 12.52 13.00', 'slopkit/chain_poops.js', true);
  add('13.02 13.04 13.50 13.52', 'slopkit/jb.js?v=19', true);
  add('14.00', 'slopkit/jb2.js', true);
  root.MustafaRoute = function (ua) {
    var m = /PlayStation 4[ /](\d+\.\d{2})(?:\D|$)/i.exec(ua);
    return {fw:m ? m[1] : null, route:m ? routes[m[1]] || null : null};
  };
})(typeof window !== 'undefined' ? window : globalThis);
