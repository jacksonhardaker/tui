import fs from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import meow from 'meow';
import chalk from 'chalk';
import ora from 'ora';
import clipboardy from 'clipboardy';
import { general, commands, headings, examples, options } from './usage';

const spinner = ora('Loading template...');

const usage = `
  ${general}

  ${headings.commands}

    ${commands.ctx}

  ${headings.options}

    ${options.h}
    ${options.s}
    ${options.c}
    ${options.o}

  ${headings.examples}

    ${examples.ctx}
`;

const cli = meow({
  autoHelp: false,
  flags: {
    help: {
      alias: 'h',
    },
    clipboard: {
      alias: 'c',
    },
    overwrite: {
      alias: 'o',
    },
    soft: {
      alias: 's',
    },
  }
});

const handleHelp = ({ help }, input) => {
  if (help || !input[0]) {
    console.log(usage);
  }
};

const buildTemplate = (name, flags) => {
  spinner.start();
  try {
    const capitalizedName = `${name[0].toUpperCase()}${name.slice(1)}`;
    const template = fs.readFileSync(join(__dirname, 'templates', 'ctx.js.template'), 'utf8');

    spinner.text = 'Generating output...';

    const filename = `${capitalizedName}Context.js`;
    const output = template.replace(/{{name}}/g, capitalizedName);

    if (flags.soft) {
      spinner.stop();
      console.log(chalk.green(filename));
      console.log(chalk.blue(output));
    }
    else if (!flags.clipboard) {
      fs.writeFileSync(`${cwd()}/${filename}`, output, { flag: flags.overwrite ? 'wx' : '', encoding: 'utf8' });
      spinner.succeed(`${filename} created!`);
    }
    else {
      clipboardy.writeSync(output);
      spinner.succeed(`${filename} contents copied to clipboard!`);
    }
  }
  catch (error) {
    spinner.fail(chalk.red(error));
  }
}

export const exec = () => {
  const input = cli.input.filter(input => input !== 'ctx');

  try {
    if (input[0]) {
      buildTemplate(input[0], cli.flags);
    }
  }
  catch (error) {
    console.error(chalk.red(error));
  }
  finally {
    handleHelp(cli.flags, input)
  }
};
