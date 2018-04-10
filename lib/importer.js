const fs = require("fs");
const path = require("path");
const shell = require("child_process");
const {JSDOM} = require("jsdom");

module.exports = function(cli, config) {

    /**
     * Load a single view into DOM
     * 
     * @param {string} filename Filename to load
     * @return {JSDOM} Returns a JSDOM object of the view
     */
    this.loadView = (filename) => {
        let domOptions = {};
        filename = config.importer.viewDirectory + '/' + filename;

        if (config.url !== undefined && config.url.length) {
            domOptions = {url: config.url};
        }

        return JSDOM.fromFile(filename, domOptions);
    };

    /**
     * Read a directory for a certain file extension
     * 
     * @param {string} dir Directory to search
     * @param {string} extension Extension to search for (without the dot)
     * @return {array} Returns an array of matching files
     */
    this.readdirFileType = (dir, extension) => {

        let results = [];
        extension = '.' + extension;

        // Parse the directory
        fs.readdirSync(dir).forEach(file => {
            if (file.includes(extension)) {
                results.push(file);
            }
        });

        return results;

    };

    /**
     * Run the import
     * 
     * @param {payload} payload Payload state object
     * @return {Promise} Returns a Promise object
     */
    this.run = (payload) => {
        return new Promise((accept, reject) => {

            payload.import = {};
            payload.import.views = [];
            payload.import.viewNames = [];
            payload.import.stylesheets = [];
            payload.import.scripts = [];
            payload.import.images = [];

            // Check for configuration
            if (config.importer === undefined) {
                reject("Importer is not configured.");
            }

            // Check if import directory exists
            if (!config.importer.viewDirectory ||
                !fs.existsSync(config.importer.viewDirectory)) {
                reject("View directory not found.");
            }

            // Check for a precmd
            if (config.importer.precmd !== undefined &&
                config.importer.precmd.length) {
                
                // Run the precmd
                shell.execSync(config.importer.precmd);
            }

            // Create view loaders
            let viewLoaders = [];

            // Check for a layout
            let hasLayout = false;
            if (config.importer.layout !== undefined &&
                config.importer.layout.length) {

                let layout = path.normalize(
                    config.importer.viewDirectory + '/' +
                    config.importer.layout + '.html'
                );

                // Check if the layout exists
                if (fs.existsSync(layout)) {

                    // Layout exists
                    hasLayout = true;

                    // Push the file to the view loader
                    viewLoaders.push(
                        this.loadView(config.importer.layout + '.html')
                    );
                }

            }

            // Check for view files
            fs.readdirSync(config.importer.viewDirectory).forEach(view => {
                // Check if layout is a view
                if (view.length && view.includes(".html") && 
                    view !== config.importer.layout + '.html' &&
                    !config.importer.ignore.includes(view)) {
                    
                    // Load the view
                    viewLoaders.push(
                        this.loadView(view)
                    );

                    // Push the name to the viewNames
                    payload.import.viewNames.push(view.replace(".html", ""));

                }
            });

            // Check for images
            if (fs.existsSync(config.importer.imageDirectory)) {
                payload.import.images = fs.readdirSync(config.importer.imageDirectory);
            }

            // Check for stylsheets
            if (fs.existsSync(config.importer.styleDirectory)) {
                payload.import.stylesheets = this.readdirFileType(
                    config.importer.styleDirectory,
                    config.importer.styleType
                );
            }

            // Check for scripts
            if (fs.existsSync(config.importer.scriptDirectory)) {
                payload.import.scripts = this.readdirFileType(
                    config.importer.scriptDirectory,
                    config.importer.scriptType
                );
            }

            // Log
            console.log("Importer:");
            if (viewLoaders.length) {
                console.log("\t" + viewLoaders.length + " views (including layouts)");
            }
            if (payload.import.images) {
                console.log("\t" + payload.import.images.length + " images");
            }
            if (payload.import.stylesheets) {
                console.log("\t" + payload.import.stylesheets.length + " " +
                    config.importer.styleType + " files");
            }
            if (payload.import.scripts) {
                console.log("\t" + payload.import.scripts.length + " " +
                    config.importer.scriptType + " files");
            }

            // Run viewloaders
            Promise.all(viewLoaders)
                .then(doms => {
                    // Check if we have view DOMs
                    if (doms.length) {

                        doms.forEach((dom, i) => {

                            // First DOM is the layout
                            if (i === 0 && hasLayout) {
                                payload.import.layout = dom;
                            }
                            else {
                                payload.import.views.push(dom);
                            }

                        });

                        // Check for a postcmd
                        if (config.importer.postcmd !== undefined &&
                            config.importer.postcmd.length) {
                            
                            // Run the postcmd
                            try {
                                shell.execSync(config.importer.postcmd);
                            }
                            catch (ex) {
                                reject(ex);
                            }
                        }

                        // Import successful
                        accept(payload);

                    }
                })
                .catch(error => {
                    reject(error);
                })

        });
    };

};
