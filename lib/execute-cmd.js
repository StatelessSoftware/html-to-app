const shell = require("child_process");

module.exports = function(cmd) {
    if (cmd && cmd.length) {
        shell.execSync(cmd);
    }
};
