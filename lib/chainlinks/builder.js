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
            let shouldBuild = this.shouldBuild();
            payload.build.buildPath = buildPath;

            // Remove the bin forlder if force build
            if (payload.build.force) {
                try {
                    shell.execSync("rm -rf " + buildPath);
                    shouldBuild = true;

                }
                catch (ex) {
                    reject("Cannot remove build directory.  Please make sure it is not open in another window.");
                }
            }

            // Create build directory if necessary
            if (!fs.existsSync(buildPath)) {
                this.binCmd("mkdir " + buildPath, false);
            }

            // Check for an app directory to merge
            this._mergeCmd = false;
            if (this.dirMerge && this.dirMerge.length &&
                fs.existsSync(this.dirMerge)) {

                // Create app directory path
                let mergePath = path.normalize(this.dirMerge);

                // Check directory contents
                if (fs.readdirSync(mergePath).length) {
                
                    // Merge the directory
                    this._mergeCmd = "cp -rf ../" + mergePath + "/* .";

                }

            }

            // Check if we should install
            if (shouldBuild) {

                // Install
                if (
                    this.binCmd(this.installCmd) &&
                    this.binCmd(this.cleanupCmd))
                {

                }
                else {
                    reject("Could not install");
                }

            }

            // Merge build
            if (this._mergeCmd && this.binCmd(this._mergeCmd)) {

            }
            else if (this._mergeCmd) {
                reject("Could not merge");
            }
        
            accept(payload);

        });
    }

};

module.exports = Builder;
