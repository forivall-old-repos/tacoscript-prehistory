import * as babylon from "babylon";

import { plugins as babylonPlugins } from "babylon/lib/parser";
import tokenAttachmentPlugin from "./babylon-token-attachment-plugin";
babylonPlugins.tokenAttachment = tokenAttachmentPlugin;

/**
 * Parse `code` with normalized options, collecting tokens and comments.
 */

export default function (code, opts = {}) {
  var parseOpts = {
    allowImportExportEverywhere: opts.looseModules,
    allowReturnOutsideFunction:  opts.looseModules,
    allowHashBang:               true,
    ecmaVersion:                 6,
    strictMode:                  opts.strictMode,
    sourceType:                  opts.sourceType,
    locations:                   true,
    features:                    opts.features || {},
    plugins:                     opts.plugins || {},
    ranges:                      true
  };
  parseOpts.plugins.tokenAttachment = true;

  if (opts.nonStandard) {
    parseOpts.plugins.jsx = true;
    parseOpts.plugins.flow = true;
  }
  // TODO: add metadata to ast to notify the tacoscript generator that
  // whitespace has been properly attached to the AST. otherwise, don't include
  // formatting specifiers when generating tacoscript, and use babel's generator
  // to generate javascript.
  return babylon.parse(code, parseOpts);
}
