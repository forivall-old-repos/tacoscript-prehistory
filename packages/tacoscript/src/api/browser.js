/* eslint no-new-func: 0 */

require("./node");
var transform = module.exports = require("../transformation");

/**
 * Add `options` and `version` to `babel` global.
 */

transform.options = require("../transformation/file/options");
transform.version = require("../../package").version;

/**
 * Add `transform` api to `babel` global.
 */

transform.transform = transform;

/**
 * Tranform and execute script, adding in inline sourcemaps.
 */

transform.run = function (code, opts = {}) {
  opts.sourceMaps = "inline";
  return new Function(transform(code, opts).code)();
};

/**
 * Load scripts via xhr, and `transform` when complete (optional).
 */

transform.load = function (url, callback, opts = {}, hold) {
  opts.filename = opts.filename || url;

  var xhr = global.ActiveXObject ? new global.ActiveXObject("Microsoft.XMLHTTP") : new global.XMLHttpRequest();
  xhr.open("GET", url, true);
  if ("overrideMimeType" in xhr) xhr.overrideMimeType("text/plain");

  /**
   * When successfully loaded, transform (optional), and call `callback`.
   */

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;

    var status = xhr.status;
    if (status === 0 || status === 200) {
      var param = [xhr.responseText, opts];
      if (!hold) transform.run.apply(transform, param);
      if (callback) callback(param);
    } else {
      throw new Error(`Could not load ${url}`);
    }
  };

  xhr.send(null);
};

/**
 * Register load event to transform and execute scripts.
 */

// if (global.addEventListener) {
//   global.addEventListener("DOMContentLoaded", runScripts, false);
// } else if (global.attachEvent) {
//   global.attachEvent("onload", runScripts);
// }
