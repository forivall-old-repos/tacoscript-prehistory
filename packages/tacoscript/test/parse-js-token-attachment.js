require('source-map-support').install({handleUncaughtExceptions: false});
var mochaFixtures = require('mocha-fixtures-generic');
var assert = require("assert");
var parseJs = require("../lib/parse-js");
var printAst = require("../lib/helpers/print-ast").default;
var misMatch = require("./_util").misMatch;
var _ = require("lodash");

suite("parse-js", function () {

  test("attachesParentheses", function () {
    assert.ok(parseJs("x | y ^ z"));
    assert.ok(parseJs("x | (y ^ z)"));
  });

});

var fixtures = mochaFixtures(__dirname + "/parsing-fixtures", function () {
  return require("../test-parsing-fixtures.json");
});

_.each(fixtures, function (suites, name) {
  _.each(suites, function (testSuite) {
    suite(name + "/" + testSuite.title, function () {
      _.each(testSuite.tests, function (task) {
        test(task.title, !task.disabled && function () {
          return runTest(task);
        });
      });
    });
  });
});

function save(test, ast) {
  require("fs").writeFileSync(test.expect.loc, printAst(ast));
}

function runTest(test) {
  var opts = test.options;
  opts.locations = true;
  opts.ranges = true;

  try {
    var ast = parseJs(test.actual.code, opts);
  } catch (err) {
    if (opts.throws) {
      if (err.message === opts.throws) {
        return;
      } else {
        err.message = "Expected error message: " + opts.throws + ". Got error message: " + err.message;
        throw err;
      }
    }

    throw err;
  }

  if (!test.expect.code) {
    test.expect.loc += "on";
    return save(test, ast);
  }

  if (opts.throws) {
    throw new Error("Expected error message: " + opts.throws + ". But parsing succeeded.");
  } else {
    var mis = misMatch(JSON.parse(test.expect.code), ast);
    if (mis) {
      // save(test, ast);
      throw new Error(mis);
    }
  }
}
