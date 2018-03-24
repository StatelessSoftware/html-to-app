process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

// Import dependencies
const getCliArguments = require("command-line-args");
const config = require("config");

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
        }
    ],
    args: [],
    config: {
        "importer": {
            "dirHTML": "./",
            "dirImages": "./images",
            "dirCSS": "./",
            "dirJS": "./",
    
            "typeCSS": "scss",
            "typeJS": "js",
    
            "layoutFile": "layout.html"
        },
        "converter": {
            "layout": {
                "target": "document.documentElement.outerHTML",
                "remove": "pingendo",
                "prepend": "<!DOCTYPE html>",
                "append": ""
            },
            "view": {
                "target": "document.body.innerHTML",
                "remove": "script, pingendo",
                "prepend": "",
                "append": ""
            }
        },
        "builder": {
            "dirBuild": "./bin",
            "installCmd": "express -v hbs -c sass && npm i",
            "cleanupCmd": "rm -rf public/* views/*.hbs"
        },
        "exporter": {
            "dirBuild": "./bin",
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
cli.config.importer = config.get("importer");
cli.config.converter = config.get("converter");
cli.config.builder = config.get("builder");
cli.config.exporter = config.get("exporter");

// Configure the chainlinks
importer = configureChainLink(importer, cli.config.importer);
converter = configureChainLink(converter, cli.config.converter);
builder = configureChainLink(builder, cli.config.builder);
exporter = configureChainLink(exporter, cli.config.exporter);

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
