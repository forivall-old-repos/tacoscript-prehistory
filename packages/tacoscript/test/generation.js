// var genJs = require("../lib/gen-js");
var genJs = require("../lib/generation");
// var genTaco = require("../lib/gen-taco");
var assert   = require("assert");
var helper   = require("./_helper");
var parseJs  = require("../lib/helpers/parse-js");
// var horchata = require("horchata");
var chai     = require("chai");
var t        = require("../lib/types");
var _        = require("lodash");

// suite("generation", function () {
//   test("completeness", function () {
//     _.each(t.VISITOR_KEYS, function (keys, type) {
//       assert.ok(!!generate.CodeGenerator.prototype[type], type + " should exist");
//     });
//
//     _.each(generate.CodeGenerator.prototype, function (fn, type) {
//       if (!/[A-Z]/.test(type[0])) return;
//       assert.ok(t.VISITOR_KEYS[type], type + " should not exist");
//     });
//   });
// });

_.each(helper.get("generation"), function (testSuite) {
  suite("generation-js-circular/" + testSuite.title, function () {
    _.each(testSuite.tests, function (task) {
      test(task.title, !task.disabled && function () {

        var actualAst = parseJs(task.js.code, {
          filename: task.js.loc,
          nonStandard: true,
          strictMode: false,
          sourceType: "module",
          features: {
            "es7.decorators": true,
            "es7.comprehensions": true,
            "es7.asyncFunctions": true,
            "es7.exportExtensions": true,
            "es7.functionBind": true
          }
        });

        var actualJsCode = genJs(actualAst, task.options, task.taco.code).code;
        chai.expect(actualJsCode).to.equal(task.js.code, task.js.loc + " (generated) !== " + task.js.loc);
      });
    });
  });
});
