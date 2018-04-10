// Node environment
const env = process.env.NODE_ENV || 'default';

// Import dependencies
const getCliArguments = require("command-line-args");
const CliConfigurator = require("cli-configurator");

// Import chainlinks
let Importer = require("./lib/importer");
let Converter = require("./lib/converter");
let Builder = require("./lib/builder");
let Exporter = require("./lib/exporter");

// Setup cli parameters
let cli = require("./lib/cli")();
let configurator = new CliConfigurator("html-to-app");

// Load the default config
let defaultConfig = false;
try {
    defaultConfig = require("./config.json")["html-to-app"];
}
catch (ex) {
    console.log("Could not load default configuration file.");
}

// Check if we're just trying to create a config file
if (cli.createConfig) {
    try {
        configurator.write(defaultConfig);
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
    config = configurator.read();
}
catch (ex) {    // No config, use default
    config = defaultConfig;
}

if (config === false) {
    config = defaultConfig;
}

// Create the chainlinks
let importer = new Importer(cli, config);
let converter = new Converter(cli, config);
let builder = new Builder(cli, config);
let exporter = new Exporter(cli, config);

// Create the payload
let payload = new Object();

// Start the engine
console.log("Importing...");
importer.run(payload)
    .then(payload => {
        console.log("Converting...");
        return converter.run(payload);
    })
    .then(payload => {
        console.log("Building...");
        return builder.run(payload);
    })
    .then(payload => {
        console.log("Exporting...");
        return exporter.run(payload);
    })
    .then(payload => {
        console.log("Done.");
    })
    .catch(error => {
        console.log(error);
    })
;