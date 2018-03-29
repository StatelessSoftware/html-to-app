process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
const env = process.env.NODE_ENV || 'default';

// Import dependencies
const getCliArguments = require("command-line-args");
const config = require("config");
const executeCommand = require("./execute-cmd");
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
    config: require("../config.json"),
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

    console.log("No configuration, using defaults.");
    
}

// Create a config file if asked to do so
if (cli.args.createConfig) {

    // Check for config dir
    if (!fs.existsSync("config")) { 
        // Create dir
        executeCommand("mkdir config");
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

        console.log("Configuration file created successfully.");
    
    }
    else {
        console.log("Configuration file already exists.  Will NOT overwrite!");
    }

    // Kill the program
    process.exit();

}

// Append properties to payload
payload.build.force = cli.args.forceBuild;

// Check if we need to build
let shouldBuild = builder.shouldBuild() || cli.args.forceBuild;

// Start the engine
console.log("Importing...");
executeCommand(importer.precmd);
importer.run(payload)
    .then((payload) => {
        executeCommand(importer.postcmd);
        executeCommand(converter.precmd);
        console.log("Converting...");
        return converter.run(payload);
    })
    .then((payload) => {
        executeCommand(converter.postcmd);
        if (shouldBuild) {
            executeCommand(builder.precmd);
            console.log("Building...");
            return builder.run(payload);
        }
        else {
            console.log("Skipping build...");
            return payload;
        }
    })
    .then((payload) => {
        if (shouldBuild) {
            executeCommand(builder.postcmd);
        }
        executeCommand(exporter.precmd);
        console.log("Exporting...");
        return exporter.run(payload);
    })
    .then((payload) => {
        executeCommand(exporter.postcmd);
        console.log("Exported", payload, "files.");
        console.log("Finished.");
    })
    .catch((error) => {
        console.log(error);
    })
;
