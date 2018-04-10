const fs = require("fs");
const path = require("path");
const shell = require("child_process");
const shelljs = require("shelljs");

module.exports = function(cli, config) {

    this.execSyncInBuild = (cmd) => {
        if (cmd && cmd.length) {
            return shell.execSync(cmd, {
                "cwd": config.buildDirectory
            });
        }
        else {
            return true;
        }
    };

    this.run = (payload) => {
        return new Promise((accept, reject) => {

            // Check the config
            if (!config.builder || !config.buildDirectory) {
                reject("Builder is not configured.");
            }

            // Check for a precmd
            if (config.builder.precmd !== undefined &&
                config.builder.precmd.length) {
                
                // Run the precmd
                shell.execSync(config.builder.precmd);
            }
            
            // Check if should build
            let shouldBuild = !fs.existsSync(config.buildDirectory) ||
                cli.force;

            // Remove the bin folder if force build
            if (cli.force) {

                // Remove build directory recursively
                let shellVerbosity = shelljs.config.silent;
                let shellFatal = shelljs.config.fatal;
                shelljs.config.silent = true;
                shelljs.config.fatal = true;

                try {
                    shelljs.rm("-rf", config.buildDirectory);
                }
                catch (ex) {
                    reject("Cannot remove build directory.  " +
                        "Please make sure it is not open in another window.");
                }

                shelljs.config.silent = shellVerbosity;
                shelljs.config.fatal = shellFatal;

            }

            // Create build directory if necessary
            if (shouldBuild) {
                shelljs.mkdir("-p", config.buildDirectory);
            }
            // Check if we should install
            if (shouldBuild) {
                // Install
                if (!this.execSyncInBuild(config.builder.installCmd) ||
                    !this.execSyncInBuild(config.builder.cleanupCmd)) {

                    reject("Could not install.");
                    
                }
            }

            // Check for an app directory to merge
            let shouldMerge = false;
            if (config.appDirectory && fs.existsSync(config.appDirectory) &&
                fs.readdirSync(config.appDirectory).length) {
                try {
                    // Merge the directory
                    shell.execSync("cp -rf " + config.appDirectory + '/* ' +
                        config.buildDirectory);
                }
                catch (ex) {
                    reject ("Could not merge app directory.");
                }
            }

            // Check for a postcmd
            if (config.builder.postcmd !== undefined &&
                config.builder.postcmd.length) {
                shell.execSync(config.builder.postcmd);
            }

            accept(payload);

        });
    };

};
