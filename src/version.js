import meow from 'meow';
import chalk from 'chalk';

const cli = meow();

export const exec = () => {
  console.log(chalk.cyan(cli.pkg.version));
}
