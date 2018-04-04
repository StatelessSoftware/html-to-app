// Node environment
const env = process.env.NODE_ENV || 'default';

// Import dependencies
const getCliArguments = require("command-line-args");
const CliConfigurator = require("cli-configurator");

// Setup cli parameters
let cli = require("./lib/cli")();
let configurator = new CliConfigurator("html-to-app");

// Check if we're just trying to create a config file
if (cli.createConfig) {
    try {
        configurator.write(require("./config.json"));
        console.log("Config file created.");
    }
    catch (ex) {
        console.log(ex);
    }
    
    process.exit();
}

// Get the existing config file
let config = false;
try {
    config = configurator.get();
}
catch (ex) {
    // No config, use default
    config = require("./config.json");
}

// Import chainlinks
let importer = require("./lib/chainlinks/importer");
let converter = require("./lib/chainlinks/converter");
let builder = require("./lib/chainlinks/builder");
let exporter = require("./lib/chainlinks/exporter");

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
        executeCommand(builder.precmd);
        console.log("Building...");
        return builder.run(payload);
    })
    .then((payload) => {
        executeCommand(builder.postcmd);
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
