const fs = require("fs");
const path = require("path");
const shell = require("child_process");

let Exporter = function() {

    this.dirBuild = "";
    this.dirViews = "";
    this.dirImages = "";
    this.dirCSS = "";
    this.dirJS = "";
    
    this.viewExtension = "";

    this.normalizePath = function(p) {
        return path.normalize(
            this.dirBuild + '/' + p
        );
    }

    this.createDirIfNotExists = function(dir) {

        // Normalize the path
        dir = this.normalizePath(dir);

        // Check if the directory exists
        if (!fs.existsSync(dir)) {
            // Make the directory
            return shell.execSync("mkdir " + dir);
        }
        else {
            return true;
        }

    }

    this.copyFile = function(from, to) {
        return new Promise((accept, reject) => {

            // Get proper paths
            from = path.normalize(from);
            to = path.normalize(this.dirBuild + '/' + to);

            // Copy file
            fs.createReadStream(from)
                .pipe(fs.createWriteStream(to))
                .on("error", error => {
                    console.log("\tCould not copy \"", from, "\" to \"", to, "\".");
                })
                .on("close", () => {
                    accept();
                })

        })
    }

    this.writeFile = function(filename, payload) {
        return new Promise((accept, reject) => {

            // Normalize path
            filename = this.dirViews + '/' + filename + this.viewExtension;
            filename = this.normalizePath(filename);
    
            // Write the file
            fs.writeFile(filename, payload, "utf8", error => {
                if (error) {
                    reject(error);
                }
                else {
                    accept(filename)
                }
            });

        });

    }

    this.run = function(payload) {
        return new Promise((accept, reject) => {

            // Export the payload flat files
            let writes = [];
            let moves = [];

            // Create public directories
            this.createDirIfNotExists(this.dirViews);
            this.createDirIfNotExists(this.dirCSS);
            this.createDirIfNotExists(this.dirJS);
            this.createDirIfNotExists(this.dirImages);

            // Layout
            if (payload.convert.layout && payload.import.names.length) {
                writes.push(this.writeFile(payload.import.names[0],
                    payload.convert.layout));
            }

            // Views
            if (payload.convert.views.length &&
                payload.import.names.length > 1)
            {

                payload.convert.views.forEach((view, i) => {
                    writes.push(this.writeFile(payload.import.names[i + 1],
                        payload.convert.views[i]));
                });
            }

            // Copy images
            if (payload.import.images) {
                payload.import.images.forEach((file, i) => {

                    let from = payload.import.dirImages + '/' + file;
                    let to = this.dirImages + '/' + file;

                    moves.push(this.copyFile(from, to));
                });
            }

            // Copy css
            if (payload.import.css) {
                payload.import.css.forEach((file, i) => {

                    let from = payload.import.dirCSS + '/' + file;
                    let to = this.dirCSS + '/' + file;

                    moves.push(this.copyFile(from, to));
                });
            }

            // Copy js
            if (payload.import.js) {
                payload.import.js.forEach((file, i) => {

                    let from = payload.import.dirJS + '/' + file;
                    let to = this.dirJS + '/' + file;

                    moves.push(this.copyFile(from, to));
                });
            }

            // Output some info
            console.log("Exporter:");
            console.log("\tWriting", writes.length, "files.");
            console.log("\tCopying", moves.length, "files.");

            // Merge the arrays
            writes.concat(moves);

            // Start the export
            Promise.all(writes)
                .then(values => {
                    accept(values.length);
                })
                .catch(error => {
                    reject(error);
                })

        });
    }

};

module.exports = Exporter;
