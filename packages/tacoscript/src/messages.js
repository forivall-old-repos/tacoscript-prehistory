import * as util from  "util";

/**
 * Mapping of messages to be used in Tacoscript.
 * Borrowed from Babel.
 * Messages can include $0-style placeholders.
 */

export const MESSAGES = {
  unsupportedOutputType: "Unsupported output type $1",
  illegalMethodName: "Illegal method name $1",
  pluginUnknown: "Unknown plugin $1",
};

/**
 * Get a message with $0 placeholders replaced by arguments.
 */

export function get(key: string, ...args): string {
  var msg = MESSAGES[key];
  if (!msg) throw new ReferenceError(`Unknown message ${JSON.stringify(key)}`);

  // stringify args
  args = parseArgs(args);

  // replace $0 placeholders with args
  return msg.replace(/\$(\d+)/g, function (str, i) {
    return args[--i];
  });
}

/**
 * Stingify arguments to be used inside messages.
 */

export function parseArgs(args: Array<any>): Array<string> {
  return args.map(function (val) {
    if (val != null && val.inspect) {
      return val.inspect();
    } else {
      try {
        return JSON.stringify(val) || val + "";
      } catch (e) {
        return util.inspect(val);
      }
    }
  });
}
