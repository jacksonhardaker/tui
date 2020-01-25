import meow from 'meow';
import chalk from 'chalk';
import { join } from 'path';
import { general, headings, commands, examples, options } from './usage';

const usage = `
  ${general}

  ${headings.commands}

    ${commands.ctx}
    ${commands.cmpt}

  ${headings.options}

    ${options.h}
    ${options.v}

  ${headings.examples}

    ${examples.ctx}
    ${examples.cmpt}
`;

const cli = meow({
  booleanDefault: true,
  autoHelp: false,
  autoVersion: false,
  flags: {
    version: {
      alias: 'v'
    },
    help: {
      alias: 'h'
    }
  }
})

export const exec = args => {
  const rawArgs = args.slice(2);

  if (rawArgs[0]) {
    try {
      return require(join(__dirname, rawArgs[0])).exec();
    }
    catch (error) {
      // Not using sub command, so continue to process input flags
      if (cli.flags.help) {
        console.log(usage);
      }
      else if (cli.flags.version) {
        const pkg = require('../package.json');
        console.log(chalk.cyan(pkg.version));
      }
      else {
        console.error(chalk.red(error));
      }
    }
  }
  else {
    console.log(usage);
  }
};
