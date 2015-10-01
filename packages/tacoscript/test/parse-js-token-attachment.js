/** TODO: move these helpers and tests to external modules, after babel 6.0 is
 *  released
 */

var assert = require("assert");
var parseJs = require("../lib/parse-js").default;
var misMatch = require("./_util").misMatch;

suite("parse-js", function () {

  test("attachesParentheses", function () {
    assert.ok(parseJs("x | y ^ z"));
    assert.ok(parseJs("x | (y ^ z)"));
  });

});
