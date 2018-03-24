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
