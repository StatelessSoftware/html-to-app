const fs = require("fs");
const shell = require("child_process");
const path = require("path");

let Builder = function() {

    this.installCmd = "";
    this.cleanupCmd = "";
    this.dirBuild = "";

    this.binCmd = function(cmd, cd = true) {

        let result = true;

        if (cmd && cmd !== "") {

            // Wrap the command in the proper working directory
            if (cd) {
                cmd = "cd " + this.dirBuild +
                    " && " + cmd + " && cd ..";
            }

            // Execute the command
            result = shell.execSync(cmd);

        }

        // Return result
        return result;
    }

    this.shouldBuild = function() {
        return !fs.existsSync(this.dirBuild);
    }

    this.run = function(payload) {
        return new Promise((accept, reject) => {

            let buildPath = path.normalize(this.dirBuild);
            payload.build.buildPath = buildPath;

            // Remove the bin forlder if force build
            if (payload.build.force) {
                shell.execSync("rm -rf bin");
            }

            // Install
            if (this.binCmd("mkdir " + buildPath, false) &&
                this.binCmd(this.installCmd) &&
                this.binCmd(this.cleanupCmd)) {
    
                accept(payload);

            }
            else {
                reject("Could not install");
            }

        });
    }

};

module.exports = Builder;
