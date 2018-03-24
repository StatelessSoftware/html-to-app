const {JSDOM} = require("jsdom");
const fs = require("fs");
const path = require("path");

let Importer = function() {
    
    this.dirHTML = "";
    this.dirImages = "";
    this.dirCSS = "";
    this.dirJS = "";
    this.layoutFile = "";
    
    this.typeCSS = "";
    this.typeJS = "";

    this._images = [];
    this._views = [];
    this._layout = [];
    this._css = [];
    this._js = [];

    /**
     * Fix a filename to work in the right directory
     * @param string filename Filename to fix
     */
    this.fixFilename = function(filename = "", dir = this.dirHTML) {
        // Prepend html directory
        if (dir) {
            filename = dir + "/" + filename;
        }
        
        if (filename.length) {
            filename = path.normalize(filename);
        }

        return filename;
    }

    /**
     * Load a single HTML file into DOM
     * 
     * @param string file Filename to load
     * @return Promise Returns a promise, which returns the DOM content on accept
     */
    this.loadFile = function(file) {
        // Load the file
        return JSDOM.fromFile(this.fixFilename(file));
    };

    /**
     * Read a directory for filetype
     * 
     * @param string dir Directory to parse
     * @param string filetype Filetype to read (extension without the dot)
     */
    this.readdirFiletype = function(dir, filetype) {

        // Fixup input
        dir = this.fixFilename("", dir);
        filetype = "." + filetype;

        // Parse the directory
        let files = fs.readdirSync(dir);
        let results = [];
        
        // Load views
        if (files.length) {
            files.forEach(file => {

                // Check filetype
                if (file.includes(filetype) !== false) {
                    // Load the file
                    results.push(file);
                }

            });
        }

        return results;

    }

    /**
     * Load all files
     */
    this.run = function(payload) {
        return new Promise((accept, reject) => {

            // Create load functions
            var loadFunctions = [];

            // Check if the layout exists
            if (fs.existsSync(this.fixFilename(this.layoutFile))) {

                // Load the layout
                loadFunctions = [
                    this.loadFile(this.layoutFile)
                ];

                // Remember the name
                payload.import.names.push(this.layoutFile.split(".")[0]);

            }
            else {
                reject("Layout file " + this.fixFilename(this.layoutFile) +
                    " does not exist.");
            }

            // Load the view files
            this._views = fs.readdirSync(this.fixFilename());
            
            // Load views
            if (this._views.length) {
                this._views.forEach(view => {

                    // Layout is not a view
                    if (view !== this.layoutFile &&
                        view.includes(".html") !== false
                    ) {
    
                        // Load the file
                        loadFunctions.push(this.loadFile(view));

                        // Remember the name
                        payload.import.names.push(view.split(".")[0]);

                    }

                });
            }

            // Parse for images
            payload.import.dirImages = this.fixFilename("", this.dirImages);
            payload.import.images = fs.readdirSync(payload.import.dirImages);

            // Parse for css
            payload.import.dirCSS = this.fixFilename("", this.dirCSS);
            payload.import.typeCSS = this.typeCSS;
            payload.import.css = this.readdirFiletype(this.dirCSS, this.typeCSS);

            // Parse for js
            payload.import.dirJS = this.fixFilename("", this.dirJS);
            payload.import.typeJS = this.typeJS;
            payload.import.js = this.readdirFiletype(this.dirJS, this.typeJS);

            console.log("\t" + loadFunctions.length + " views (including layouts)");
            console.log("\t" + payload.import.images.length + " images");
            console.log("\t" + payload.import.css.length + " " + this.typeCSS + " files");
            console.log("\t" + payload.import.js.length + " " + this.typeJS + " files");

            // Load layout file
            Promise.all(loadFunctions)
                .then(doms => {

                    // Check if we got doms
                    if (doms.length) {

                        // Each succeeding one is each view
                        doms.forEach((dom, i) => {
                            
                            // The first one is the layout
                            if (i === 0) {
                                payload.import.layout = dom;
                            }
                            else {
                                payload.import.views.push(dom);
                            }

                        });

                    }

                    // Load the views
                    accept(payload);

                })
                .catch(error => {
                    reject(error);
                })
            ;
        });
    };
    
};

module.exports = Importer;
