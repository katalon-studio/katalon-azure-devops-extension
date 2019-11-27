module.exports = {
  updateCommand(command, ...options) {
    return options.reduce((cmd, option) => {
      const { flag, value } = option;
      if (cmd.includes(flag)) {
        return cmd;
      }
      if (value) {
        return `${cmd} ${flag}="${value}"`;
      }
      return `${cmd} ${flag}`;
    }, command);
  },
};
