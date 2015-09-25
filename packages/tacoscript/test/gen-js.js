var genJs = require("../lib/gen-js");
var assert   = require("assert");
var t        = require("../lib/types");
var _        = require("lodash");

// sanity check
suite("javascript generation", function () {
  test("completeness", function () {
    _.each(t.VISITOR_KEYS, function (keys, type) {
      assert.ok(!!genJs.CodeGenerator.prototype[type], type + " should exist");
    });

    _.each(genJs.CodeGenerator.prototype, function (fn, type) {
      if (!/[A-Z]/.test(type[0])) return;
      assert.ok(t.VISITOR_KEYS[type], type + " should not exist");
    });
  });
});
