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
      alias: 'h'
    },
    clipboard: {
      alias: 'c'
    },
    errorBoundary: {
      alias: 'e',
    },
    overwrite: {
      alias: 'o'
    },
    props: {
      type: 'string',
      alias: 'p',
      default: ''
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
  console.log(chalk.redBright(errorBoundary));
  console.log(chalk.greenBright(errorBoundary ? 'cmpt.error.js.template' : 'cmpt.js.template'));
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

    if (!flags.clipboard) {
      try {
        mkdirp.sync(`${cwd()}/__tests__`);
        fs.writeFileSync(`${cwd()}/${filename}`, output, { flag: flags.overwrite ? '' : 'wx', encoding: 'utf8' });
        fs.writeFileSync(`${cwd()}/${testFilename}`, testOutput, { flag: flags.overwrite ? '' : 'wx', encoding: 'utf8' });
        spinner.succeed(`${filename} and ${testFilename} created!`);
      }
      catch (error) {
        return spinner.fail(error.message);
      }
    }
    else {

      try {
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
      catch (error) {
        spinner.fail(chalk.red(error));
      }
    }
  }
  catch (error) {
    spinner.fail(chalk.red(error));
  }

}

export const exec = () => {
  const input = cli.input.filter(input => input !== 'cmpt');
  console.log(cli.flags);

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
