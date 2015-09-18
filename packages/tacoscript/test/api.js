require("../lib/api/node");

var PluginManager        = require("../lib/transformation/file/plugin-manager");
var Transformer          = require("../lib/transformation/transformer");
var transform            = require("../lib/transformation");
var Pipeline             = require("../lib/transformation/pipeline");
var assert               = require("assert");
var File                 = require("../lib/transformation/file");

function assertIgnored(result) {
  assert.ok(result.ignored);
}

function assertNotIgnored(result) {
  assert.ok(!result.ignored);
}

// shim
function transformAsync(code, opts) {
  return {
    then: function (resolve) {
      resolve(transform(code, opts));
    }
  };
}

suite("api", function () {
  test("code option false", function () {
    return transformAsync("foo('bar');", { code: false }).then(function (result) {
      assert.ok(!result.code);
    });
  });

  test("ast option false", function () {
    return transformAsync("foo('bar');", { ast: false }).then(function (result) {
      assert.ok(!result.ast);
    });
  });

  test("ignore option", function () {
    return Promise.all([
      transformAsync("", {
        ignore: "node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertIgnored),

      transformAsync("", {
        ignore: "foo/node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertIgnored),

      transformAsync("", {
        ignore: "foo/node_modules/*.bar",
        filename: "/foo/node_modules/foo.bar"
      }).then(assertIgnored)
    ]);
  });

  test("only option", function () {
    return Promise.all([
      transformAsync("", {
        only: "node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertNotIgnored),

      transformAsync("", {
        only: "foo/node_modules",
        filename: "/foo/node_modules/bar"
      }).then(assertNotIgnored),

      transformAsync("", {
        only: "foo/node_modules/*.bar",
        filename: "/foo/node_modules/foo.bar"
      }).then(assertNotIgnored),

      transformAsync("", {
        only: "node_modules",
        filename: "/foo/node_module/bar"
      }).then(assertIgnored),

      transformAsync("", {
        only: "foo/node_modules",
        filename: "/bar/node_modules/foo"
      }).then(assertIgnored),

      transformAsync("", {
        only: "foo/node_modules/*.bar",
        filename: "/foo/node_modules/bar.foo"
      }).then(assertIgnored)
    ])
  });

  test("addHelper unknown", function () {
    var file = new File({}, transform.pipeline);
    assert.throws(function () {
      file.addHelper("foob");
    }, /Unknown helper foob/);
  });

  test("resolveModuleSource option", function () {
    var actual = 'import foo from "foo-import-default";\nimport "foo-import-bare";\nexport { foo } from "foo-export-named";';
    var expected = 'import foo from "resolved/foo-import-default";\nimport "resolved/foo-import-bare";\nexport { foo } from "resolved/foo-export-named";';

    return transformAsync(actual, {
      blacklist: [], // TODO: test blacklist
      resolveModuleSource: function (originalSource) {
        return "resolved/" + originalSource;
      }
    }).then(function (result) {
      assert.equal(result.code.trim(), expected);
    });
  });

  test("extra options", function () {
    var file1 = new File({ extra: { foo: "bar" } }, transform.pipeline);
    assert.equal(file1.opts.extra.foo, "bar");

    var file2 = new File({}, transform.pipeline);
    var file3 = new File({}, transform.pipeline);
    assert.ok(file2.opts.extra !== file3.opts.extra);
  });

  suite("plugins", function () {
    test("unknown plugin", function () {
      assert.throws(function () {
        new PluginManager().subnormaliseString("foo bar");
      }, /Unknown plugin/);
    });

    test("key collision", function () {
      assert.throws(function () {
        new PluginManager({
          transformers: { "es6.arrowFunctions": true }
        }).validate("foobar", { key: "es6.arrowFunctions" });
      }, /collides with another/);
    });

    test("not transformer", function () {
      assert.throws(function () {
        new PluginManager().validate("foobar", {});
      }, /didn't export a Plugin instance/);

      assert.throws(function () {
        new PluginManager().validate("foobar", "");
      }, /didn't export a Plugin instance/);

      assert.throws(function () {
        new PluginManager().validate("foobar", []);
      }, /didn't export a Plugin instance/);
    });

    test("object request");

    test("string request");

    test("transformer request");
  });
});
