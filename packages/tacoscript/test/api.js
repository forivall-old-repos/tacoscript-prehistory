/**
 * Test the node-based API
 *
 * TODO: currently, this is unadapted from babel's test suite. Once ready,
 * tacoscript's API should pass these tests.
 */

require("../lib/api/node");

var translate            = require("../lib/translateation");
var assert               = require("assert");
var File                 = require("../lib/translateation/file");

function assertIgnored(result) {
  assert.ok(result.ignored);
}

function assertNotIgnored(result) {
  assert.ok(!result.ignored);
}

// shim
function translateAsync(code, opts) {
  return {
    then: function (resolve) {
      resolve(translate(code, opts));
    }
  };
}

suite("api", function () {
  test("code option false", function () {
    return translateAsync("foo('bar');", { code: false }).then(function (result) {
      assert.ok(!result.code);
    });
  });

  test("ast option false", function () {
    return translateAsync("foo('bar');", { ast: false }).then(function (result) {
      assert.ok(!result.ast);
    });
  });

  test("ignore option", function () {
    return Promise.all([
      translateAsync("", {
        ignore: "node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertIgnored),

      translateAsync("", {
        ignore: "foo/node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertIgnored),

      translateAsync("", {
        ignore: "foo/node_modules/*.bar",
        filename: "/foo/node_modules/foo.bar"
      }).then(assertIgnored)
    ]);
  });

  test("only option", function () {
    return Promise.all([
      translateAsync("", {
        only: "node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertNotIgnored),

      translateAsync("", {
        only: "foo/node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertNotIgnored),

      translateAsync("", {
        only: "foo/node_modules/*.bar",
        filename: "/foo/node_modules/foo.bar"
      }).then(assertNotIgnored),

      translateAsync("", {
        only: "node_modules",
        filename: "/foo/node_module/bar"
      }).then(assertIgnored),

      translateAsync("", {
        only: "foo/node_modules",
        filename: "/bar/node_modules/foo"
      }).then(assertIgnored),

      translateAsync("", {
        only: "foo/node_modules/*.bar",
        filename: "/foo/node_modules/bar.foo"
      }).then(assertIgnored)
    ])
  });

  test("resolveModuleSource option", function () {
    var actual = 'import foo from "foo-import-default";\nimport "foo-import-bare";\nexport { foo } from "foo-export-named";';
    var expected = 'import foo from "resolved/foo-import-default";\nimport "resolved/foo-import-bare";\nexport { foo } from "resolved/foo-export-named";';

    return translateAsync(actual, {
      blacklist: [], // TODO: test blacklist
      resolveModuleSource: function (originalSource) {
        return "resolved/" + originalSource;
      }
    }).then(function (result) {
      assert.equal(result.code.trim(), expected);
    });
  });

  test("extra options", function () {
    var file1 = new File({ extra: { foo: "bar" } });
    assert.equal(file1.opts.extra.foo, "bar");

    var file2 = new File({});
    var file3 = new File({});
    assert.ok(file2.opts.extra !== file3.opts.extra);
  });

});
