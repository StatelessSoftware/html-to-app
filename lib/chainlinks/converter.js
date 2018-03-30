let Converter = function() {

    this.layout = {
        "target": "",
        "remove": "",
        "prepend": "",
        "append": ""
    };

    this.view = {
        "target": "",
        "remove": "",
        "prepend": "",
        "append": ""

    };

    /**
     * Convert a single DOM element, based on the function provided
     * 
     * @param {JSDOM} dom DOM content to convert
     * @param {object} func Function object to convert with.  Should be this.layout
     *  or this.view (or a new compatible object).
     * @return {string} Returns the HTML content
     */
    this.convertSingle = function(dom, func) {

        // Remove tags
        if (func.remove) {
            dom.window.document.querySelectorAll(func.remove).forEach((element) => {
                element.remove();
            });
        }

        // Remaps
        if (func.remap) {
            
            func.remap.forEach((remap) => {

                if (remap.tag) {

                    dom.window.document.querySelectorAll(remap.tag).forEach((element) => {

                        let href = "";
                        let elementType = element.nodeName.toLowerCase();
    
                        switch (elementType) {
                            case "a":
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
                    
                    });

                }
                else {
                    throw "All Converter remaps must contain a tag";
                }

            })

            // JS Files

            // Images

        }

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
        
        return dom;

    }

    this.run = function(payload) {
        return new Promise((accept, reject) => {

            try {

                // Check if a layout exists in the payload
                if (payload.import && payload.import.layout) {
    
                    // Convert the layout & push it to the converted layout
                    payload.convert.layout.push(this.convertSingle(
                        payload.import.layout, this.layout));
    
                }
    
                // Check if views exist in the payload
                if (payload.import && payload.import.views.length) {
    
                    // Loop through views
                    payload.import.views.forEach((view, i) => {
                        // Convert the view & push it to the converted views
                        payload.convert.views.push(this.convertSingle(
                            view, this.view));
                    });
    
                }

                accept(payload);    

            }
            catch (ex) {
                reject(ex);
            }
        });
    };

};

module.exports = Converter;
