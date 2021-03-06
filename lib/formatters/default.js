'use strict';

const Module = require('module');
const path = require('path');

// eslint-disable-next-line node/no-unsupported-features/node-builtins, node/no-deprecated-api
const createRequire = Module.createRequire || Module.createRequireFromPath;

class DefaultPrinter {
  constructor(options = {}) {
    this.delegates = [];
    this.console = options.console || console;

    let printOptions = {
      console: this.console,
      includeTodo: options.includeTodo,
      quiet: options.quiet,
      updateTodo: options.updateTodo,
      verbose: options.verbose,
    };

    // TODO: make format json work
    if (options.json) {
      let JsonPrinter = require('./json');
      this.delegates.push(new JsonPrinter(printOptions));
      return;
    }

    switch (options.format) {
      case 'pretty': {
        let PrettyPrinter = require('./pretty');
        this.delegates.push(new PrettyPrinter(printOptions));
        break;
      }
      default: {
        try {
          const CustomPrinter = createRequire(
            path.join(options.workingDirectory, '__placeholder__.js')
          )(options.format);

          this.delegates.push(new CustomPrinter(printOptions));
        } catch (error) {
          throw new Error(
            `There was a problem loading the formatter: Could not load "${options.format}"\n${error.message}`
          );
        }
      }
    }
  }

  print(results, todoInfo) {
    for (let delegate of this.delegates) {
      delegate.print(results, todoInfo);
    }
  }
}

module.exports = DefaultPrinter;
