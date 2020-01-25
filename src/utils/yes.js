const yes = /^(y|yes)$/i;

const isYes = input => !!input.match(yes);

export default isYes;
