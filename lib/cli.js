const getCommandLine = require("command-line-args");

module.exports = function() {
    try {
        return getCommandLine([
            {
                name: "createConfig",
                alias: "c",
                type: Boolean,
            },
            {
                name: "force",
                alias: "f",
                type: Boolean,
            }
        ]);
    }
    catch (ex) {
        throw "Invalid command line paramaters.";

        return false;
    }
};
