import fs from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import meow from 'meow';
import chalk from 'chalk';
import ora from 'ora';
import clipboardy from 'clipboardy';
import kebabCase from 'kebab-case';
import mkdirp from 'mkdirp';
import readline from 'readline';
import { general, commands, headings, examples, options } from './usage';
import isYes from './utils/yes';

const spinner = ora('Loading template...');

const usage = `
  ${general}

  ${headings.commands}

    ${commands.cmpt}

  ${headings.options}

    ${options.h}
    ${options.s}
    ${options.c}
    ${options.o}
    ${options.p}
    ${options.e}

  ${headings.examples}

    ${examples.cmpt}
    ${examples.cmptProps}
    ${examples.cmptError}
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
    errorBoundary: {
      alias: 'e',
    },
    overwrite: {
      alias: 'o',
    },
    props: {
      type: 'string',
      alias: 'p',
      default: '',
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

const continuePrompt = (getInput, contCallback) => {
  getInput.question(`Component code copied to clipboard! Continue? (y/n): `, response => {
    if (isYes(response)) {
      getInput.close();
      contCallback();
    }
    else {
      continuePrompt(getInput, contCallback);
    }
  });
}

const getNamesAndTemplates = (name, { errorBoundary, props }) => {
  const capitalizedName = `${name[0].toUpperCase()}${name.slice(1)}`;
  const kebabCasedName = kebabCase(capitalizedName).replace(/^-/, '');
  const template = fs.readFileSync(join(__dirname, 'templates', errorBoundary ? 'cmpt.error.js.template' : 'cmpt.js.template'), 'utf8');
  const testTemplate = fs.readFileSync(join(__dirname, 'templates', 'cmpt.test.js.template'), 'utf8');

  spinner.text = 'Generating output...';

  const filename = `${capitalizedName}.js`;
  const testFilename = `__tests__/${capitalizedName}.test.js`;
  const output = template.replace(/{{name}}/g, capitalizedName).replace(/{{test-name}}/g, kebabCasedName).replace(/{{props}}/g, props);
  const testOutput = testTemplate.replace(/{{name}}/g, capitalizedName).replace(/{{test-name}}/g, kebabCasedName).replace(/{{props}}/g, csvPropsToJsx(props));

  return {
    filename,
    testFilename,
    output,
    testOutput
  };
}

const csvPropsToJsx = props => props.replace(/\s/g, '').split(',').map(prop => `${prop}=""`).join(' ');

const buildTemplate = (name, flags) => {
  spinner.start();

  try {
    const { filename, testFilename, output, testOutput } = getNamesAndTemplates(name, flags);

    if (flags.soft) {
      spinner.stop();
      console.log(chalk.green(filename));
      console.log(chalk.blue(output));
      console.log(chalk.green(testFilename));
      console.log(chalk.blue(testOutput));
    }
    else if (!flags.clipboard) {
      mkdirp.sync(`${cwd()}/__tests__`);
      fs.writeFileSync(`${cwd()}/${filename}`, output, { flag: flags.overwrite ? '' : 'wx', encoding: 'utf8' });
      fs.writeFileSync(`${cwd()}/${testFilename}`, testOutput, { flag: flags.overwrite ? '' : 'wx', encoding: 'utf8' });
      spinner.succeed(`${filename} and ${testFilename} created!`);
    }
    else {
      const getInput = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      clipboardy.writeSync(output);
      spinner.succeed(`${filename} contents copied to clipboard!`);

      getInput.pause();

      continuePrompt(getInput, () => {
        clipboardy.writeSync(testOutput);
        spinner.succeed(`${testFilename} contents copied to clipboard!`);
      });
    }
  }
  catch (error) {
    spinner.fail(chalk.red(error));
  }

}

export const exec = () => {
  const input = cli.input.filter(input => input !== 'cmpt');

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
