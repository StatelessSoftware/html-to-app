process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
const env = process.env.NODE_ENV || 'default';

// Import dependencies
const getCliArguments = require("command-line-args");
const config = require("config");
const shell = require("child_process");
const fs = require("fs");

// Build chain functions
const configureChainLink = require("./config-link");

// Build chain components
let importer = new (require("./chainlinks/importer"));
let converter = new (require("./chainlinks/converter"));
let builder = new (require("./chainlinks/builder"));
let exporter = new (require("./chainlinks/exporter"));

// Create empty payload
let payload = {
    import: { names: [], views: [], layout: [] },
    convert: { views: [], layout: [] },
    build: { force: false }
};

// Setup cli parameters
let cli = {
    params: [
        {
            name: "forceBuild",
            alias: "f",
            type: Boolean
        },
        {
            name: "createConfig",
            alias: "c",
            type: Boolean
        }
    ],
    args: [],
    config: {
        "importer": {
            "dirHTML": "./html/",
            "dirImages": "./html/images",
            "dirCSS": "./html/",
            "dirJS": "./html/",
    
            "typeCSS": "scss",
            "typeJS": "js",
    
            "layoutFile": "layout.html",
            "ignoreViews": [
                "styleguide.html"
            ]
    
        },
        "converter": {
            "layout": {
                "target": "document.documentElement.outerHTML",
                "remove": "pingendo",
                "prepend": "<!DOCTYPE html>",
                "append": "",
                "remap": []
            },
            "view": {
                "target": "document.body.innerHTML",
                "remove": "script, pingendo",
                "prepend": "",
                "append": "",
                "remap": [
                    /*
                    {
                        "tag": "a",
                        "from": "test.html",
                        "to": "/test",
                        "prepend": "",
                        "append": ""
                    }
                    */
                ]
            }
        },
        "builder": {
            "dirBuild": "./dist",
            "installCmd": "express -v hbs -c sass && npm i",
            "cleanupCmd": "rm -rf public/* views/*.hbs"
        },
        "exporter": {
            "dirBuild": "./dist",
            "dirViews": "./views",
            "dirImages": "./public/images",
            "dirCSS": "./public/stylesheets",
            "dirJS": "./public/javascripts",
            "viewExtension": ".hbs"
        }
    },
    isConfigured: false
};

// Pull cli arguments
try {
    cli.args = getCliArguments(cli.params);
}
catch (ex) {
    console.log("Error: Invalid command line arguments.");
    process.exit();
}

// Configure the chainlinks to defaults
importer = configureChainLink(importer, cli.config.importer);
converter = configureChainLink(converter, cli.config.converter);
builder = configureChainLink(builder, cli.config.builder);
exporter = configureChainLink(exporter, cli.config.exporter);

// Pull config file
try {
    cli.config.importer = config.get("importer");
    cli.config.converter = config.get("converter");
    cli.config.builder = config.get("builder");
    cli.config.exporter = config.get("exporter");
    
    // Configure the chainlinks
    importer = configureChainLink(importer, cli.config.importer);
    converter = configureChainLink(converter, cli.config.converter);
    builder = configureChainLink(builder, cli.config.builder);
    exporter = configureChainLink(exporter, cli.config.exporter);
}
catch (ex) {

    // Create a config file if asked to do so
    if (cli.args.createConfig) {

        // Check for config dir
        if (!fs.existsSync("config")) { 
            // Create dir
            shell.execSync("mkdir config");
        }
        
        // Check for environment config file
        if (!fs.existsSync("config/" + env + ".json")) {
        
            // Create file
            fs.writeFileSync("config/" + env + ".json",
                JSON.stringify(
                    {
                        "importer": importer,
                        "converter": converter,
                        "builder": builder,
                        "exporter": exporter
                    },
                    null,
                    '\t'
                )
            );
        
        }

    }
    
}

// Append properties to payload
payload.build.force = cli.args.forceBuild;

// Start the engine
console.log("Importing...");
importer.run(payload)
    .then((payload) => {
        console.log("Converting...");
        return converter.run(payload);
    })
    .then((payload) => {
        if (builder.shouldBuild() || cli.args.forceBuild) {
            console.log("Building...");
            return builder.run(payload);
        }
        else {
            console.log("Skipping build...");
            return payload;
        }
    })
    .then((payload) => {
        console.log("Exporting...");
        return exporter.run(payload);
    })
    .then((payload) => {
        console.log("Exported", payload, "files.");
        console.log("Finished.");
    })
    .catch((error) => {
        console.log(error);
    })
;
