import chalk from 'chalk';

export const em = input => chalk.hex('#999')(input);

export const general = '🐦  tui [options] <command>';

export const headings = {
  commands: em('Commands:'),
  options: em('Options:'),
  examples: em('Examples:'),
};

export const options = {
  h: '--help, -h                Output usage information',
  v: '--version, -v             Output the version number',
  c: '--clipboard, -c           Copies the output to the clipboard, instead of saving to filesystem',
  s: '--soft, -s                Logs the output, rather than saving to clipboard or filesystem',
  e: '--error-boundary, -e      Creates a component wrapped with an ErrorBoundary',
  o: '--overwrite, -o           Overwrites any existing file with the same name',
  p: '--props, -p               Include component props e.g. "children, className, title"',
}

export const commands = {
  ctx: 'ctx         [input] [options]         Creates a file exporting a React context provider and useContext hook wrappper function',
  cmpt: 'cmpt        [input] [options]         Creates a file exporting a React functional component along with a basic jest + react testing library test',
}

export const examples = {
  ctx: `${em('-')} Create a React context with helpers

      ${chalk.cyan('$ tui ctx myNewContext')}
  `,
  cmpt: `${em('-')} Create a React functional component and tests

      ${chalk.cyan('$ tui cmpt myComponent')}
  `,
  cmptProps: `${em('-')} Create a React functional component with the given props, and tests

      ${chalk.cyan('$ tui cmpt myComponent -p "children, className, title"')}
  `,
  cmptError: `${em('-')} Create a React functional component, wrapped in an error boundary, and tests

      ${chalk.cyan('$ tui cmpt myComponentWithErrorBoundary -e')}
  `,
};

export default `
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
