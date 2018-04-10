const fs = require("fs");
const path = require("path");
const shell = require("child_process");
const shelljs = require("shelljs");

module.exports = function(cli, config) {

    this.copyFile = (from, to) => {
        return new Promise((accept, reject) => {
            fs.createReadStream(from)
                .pipe(fs.createWriteStream(to))
                .on("error", error => {
                    console.log("\tCould not copy \"", from, "\" to \"", to, "\".");
                })
                .on("close", () => {
                    accept();
                })
        });
    };

    this.writeFile = (filename, payload) => {
        filename += config.exporter.viewExtension;
        return new Promise((accept, reject) => {
            fs.writeFile(filename, payload, "utf8", error => {
                if (error) {
                    reject(error);
                }
                else {
                    accept(filename);
                }
            });
        });
    };

    this.run = (payload) => {
        return new Promise((accept, reject) => {

            let writeLoaders = [];
            let moveLoaders = [];

            // Check config
            if (!config.exporter) {
                reject("Exporter is not configured");
            }

            // Check for a precmd
            if (config.exporter.precmd !== undefined &&
                config.exporter.precmd.length) {
                
                // Run the precmd
                shell.execSync(config.exporter.precmd);
            }

            // Check payload
            if (!payload.import) {
                reject("Payload import not present.");
            }
            if (!payload.convert) {
                reject("Payload conversion not present.");
            }

            // Create export directories
            shelljs.mkdir("-p", config.exporter.viewDirectory);
            shelljs.mkdir("-p", config.exporter.styleDirectory);
            shelljs.mkdir("-p", config.exporter.scriptDirectory);
            shelljs.mkdir("-p", config.exporter.imageDirectory);

            // Layout
            let layout = payload.convert.layout || payload.import.layout;
            let layoutFile = config.exporter.viewDirectory + '/' +
                config.importer.layout;
            if (layout && !config.converter.view.inheritLayout) {
                writeLoaders.push(this.writeFile(
                    layoutFile,
                    layout
                ));
            }

            // Views
            let views = payload.convert.views || payload.import.views;
            if (payload.import.viewNames.length === views.length) {
                views.forEach((view, i) => {
                    writeLoaders.push(this.writeFile(
                        config.exporter.viewDirectory + '/' + payload.import.viewNames[i],
                        view
                    ));
                });
            }

            // Copy images
            payload.import.images.forEach((file, i) => {

                let from = config.importer.imageDirectory + '/' + file;
                let to = config.exporter.imageDirectory + '/' + file;

                moveLoaders.push(this.copyFile(from, to));
            });

            // Copy stylesheets
            payload.import.stylesheets.forEach((file, i) => {

                let from = config.importer.styleDirectory + '/' + file;
                let to = config.exporter.styleDirectory + '/' + file;

                moveLoaders.push(this.copyFile(from, to));
            });

            // Copy scripts
            payload.import.scripts.forEach((file, i) => {

                let from = config.importer.scriptDirectory + '/' + file;
                let to = config.exporter.scriptDirectory + '/' + file;

                moveLoaders.push(this.copyFile(from, to));
            });

            // Output some info
            console.log("Exporter:");
            console.log("\tWriting", writeLoaders.length, "files.");
            console.log("\tCopying", moveLoaders.length, "files.");

            // Merge loader arrays
            writeLoaders.concat(moveLoaders);

            // Start the export
            Promise.all(writeLoaders)
                .then(values => {

                    // Check for a postcmd
                    if (config.exporter.postcmd !== undefined &&
                        config.exporter.postcmd.length) {
                        shell.execSync(config.exporter.postcmd);
                    }

                    accept(values.length);
                })
                .catch(error => {
                    reject(error);
                })

        });
    };

};
