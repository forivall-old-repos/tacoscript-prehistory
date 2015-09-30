require('source-map-support').install({handleUncaughtExceptions: false});
var mochaFixtures = require('mocha-fixtures-generic');
var parseJs       = require("../lib/parse-js");
var horchata      = require("horchata");
var genJs         = require("../lib/gen-js");
var genTaco       = require("../lib/gen-taco");
var chai          = require("chai");
var _             = require("lodash");

var noop = function() {};
var fixtures = mochaFixtures(__dirname + "/fixtures", {
  fixtures: {
    "js": { loc: ["code.js"] },
    "taco": { loc: ["code.taco"] }
  },
  skip: noop,
  getTaskOptions: noop
});
var parsers = {
  js: function(fixture) {
    return parseJs(fixture.code, {
      filename: fixture.loc,
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
  },
  taco: function(fixture) {
    return horchata.parse(fixture.code, {
      filename: fixture.loc
    });
  }
};

var generators = {
  js: function(ast, options, sourceCode) {
    return genJs(ast, options, sourceCode).code;
  },
  taco: function(ast, options, sourceCode) {
    return genTaco(ast, options, sourceCode).code;
  }
};


module.exports = function(name, parse, generate) {
  _.each(fixtures.translation, function (testSuite) {
    suite("translation-" + name + "/" + testSuite.title, function () {
      _.each(testSuite.tests, function (task) {
        test(task.title, !task.disabled && function () {

          var ast = parsers[parse](task[parse]);
          var generatedCode = generators[generate](ast, task.options, task[parse].code);

          // TODO: remove use of _.trim
          chai.expect(_.trim(generatedCode)).to.equal(_.trim(task[generate].code), task[parse].loc + " (generated) !== " + task[generate].loc);
        });
      });
    });
  });
};
