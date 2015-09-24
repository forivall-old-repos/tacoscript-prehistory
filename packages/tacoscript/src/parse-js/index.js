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
  return babylon.parse(code, parseOpts);
}
