const fs = require("fs");
const path = require("path");
const shell = require("child_process");

module.exports = function(cli, config) {

    this.convertSingle = (dom, func, layout = false) => {
        // Remove tags
        if (func.remove) {
            dom.window.document.querySelectorAll(func.remove).forEach(element => {
                element.remove();
            });
        }

        // Relative remap
        if (config.useRelative === true && config.url) {
            func.remap.push({
                target: "*[href], *[src]",
                from: config.url,
                to: ''
            });
        }

        // Remaps
        func.remap.forEach(remap => {
            if (remap.target) {
                dom.window.document.querySelectorAll(remap.target)
                    .forEach(element => {
                    
                    let href = '';
                    let elementType = element.nodeName.toLowerCase();

                    // Get href
                    switch (elementType) {
                        case 'a':
                        case "link":
                            href = element.href;

                            break;

                        case "img":
                        case "script":
                            href = element.src;

                            break;
                    }

                    // Remap
                    if (remap.from !== undefined && remap.to !== undefined) {
                        href = href.replace(remap.from, remap.to);
                    }

                    // Prepend
                    if (remap.prepend) {
                        href = remap.prepend + href;
                    }

                    // Append
                    if (remap.append) {
                        href = href + remap.prepend;
                    }

                    // Rehash
                    if (remap.integrity) {
                        element.integrity = remap.integrity;
                    }

                    // Set href
                    switch (elementType) {
                        case "a":
                        case "link":
                            element.href = href;

                            break;

                        case "img":
                        case "script":
                            element.src = href;

                            break;
                    }

                })
            }
            else {
                throw "Remap must contain a target.";
            }
        });

        // Retarget dom & stringify
        if (func.target) {
            let target = "dom.window." + func.target;
            dom = eval(target);
        }

        // Prepend
        if (func.prepend) {
            dom = func.prepend + dom;
        }

        // Append
        if (func.append) {
            dom = dom + func.append;
        }

        // Views inherit layout
        if (layout && func.inheritLayout) {
            dom = layout.replace("{{{body}}}", dom);
        }

        return dom;

    };

    this.run = (payload) => {
        return new Promise((accept, reject) => {
            try {

                // Check the payload for import
                if (payload.import === undefined) {
                    reject("Payload import not present.");
                }

                // Check the converter configuration
                if (config.converter === undefined) {
                    reject("Converter is not configured.");
                }

                // Check for a precmd
                if (config.converter.precmd !== undefined &&
                    config.converter.precmd.length) {
                    
                    // Run the precmd
                    shell.execSync(config.converter.precmd);
                }
   

                payload.convert = {};
                payload.convert.views = [];

                // Check for a layout
                if (config.importer.layout && payload.import.layout) {
                    // Convert the layout
                    payload.convert.layout = this.convertSingle(
                        payload.import.layout,
                        config.converter.layout
                    );
                }
                
                // Loop through the views
                payload.import.views.forEach((view, i) => {
                    // Convert the view & push it to the converted views
                    payload.convert.views.push(
                        this.convertSingle(view, config.converter.view,
                            payload.convert.layout)
                    );
                });

                // Check for a postcmd
                if (config.converter.postcmd !== undefined &&
                    config.converter.postcmd.length) {
                    shell.execSync(config.converter.postcmd);
                }

                accept(payload);

            }
            catch (ex) {
                reject(ex);
            }
        });
    };

};
