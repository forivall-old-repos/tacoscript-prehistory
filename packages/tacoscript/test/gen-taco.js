var genTaco = require("../lib/gen-taco");
var assert   = require("assert");
var t        = require("../lib/types");
var _        = require("lodash");

// sanity check
suite("tacoscript generation", function () {
  test("completeness", function () {
    _.each(t.VISITOR_KEYS, function (keys, type) {
      assert.ok(!!genTaco.CodeGenerator.prototype[type], type + " should exist");
    });

    _.each(genTaco.CodeGenerator.prototype, function (fn, type) {
      if (!/[A-Z]/.test(type[0])) return;
      assert.ok(t.VISITOR_KEYS[type], type + " should not exist");
    });
  });
});
