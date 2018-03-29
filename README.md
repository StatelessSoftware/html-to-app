# html-to-app
Convert HTML flat file sites to Apps

## Installation

`
npm i -g StatelessSoftware/html-to-app
`

## Preparation

You should have a flat-file html site, and possibly an app directory containing your app (the code will be merged with the build on each run).

If you would like to customize the build, create a config file by typing:

`
html-to-app -c
`

## Usage

To build your app, simply type:

`
html-to-app
`

### Force a new build

To clean the build and rebuild, run

`
html-to-app -f
`

### Configuration

The configuration consists of 4 top-level build-chain objects: importer, converter, builder, and exporter.  All paths are relative to the current working directory.  Filenames do not contain the directory, as it is deduced from it's parent build-chain object.

## Importer

- **dirHTML** - The location of the HTML flat-files, relative to the current working directory.
- **dirImages** - The location of asset images in the flat-file site.
- **dirCSS** - The location of css (css, less, sass, etc) files to copy
- **dirJS** - The location of js (js, ts, etc) files to copy
- **typeCSS** - The type of CSS to copy to the build (css, scss, less, etc)
- **typeJS** - The type of JS to copy to the build (js, ts, etc)
- **layoutFile** - The location of the HTML layout file.
- **ignoreViews** - An array of HTML filenames to skip.
- **precmd** - A shell command to be run before the importer.
- **postcmd** - A shell command to run after the importer.

## Converter

- **layout**
    - **target** DOM string pointing to the html content of the page.  Normally should be document.documentElement.outerHTML to grab the entire document
    - **remove** Query selector to match elements to remove.  i.e. "script, #hello, .mine" will remove all `script` tags, any element with the ID `hello`, and any element with the class `mine`
    - **prepend** - String to prepend to the document.  Default for layouts should be the document type, as this is stripped in the target process.
    - **append** - String to append to the document
    - **remap** - Array of remaps.  Remaps "remap" the folder structure of tags in your HTML files to resemble the build. 
        - **tag** - Tag to match
        - **from** - String or regex to replace the href or src from
        - **to** - String to replace the href or src to
        - **prepend** - A string to prepend to the path
        - **append** - A string to append to the path
- **view**
    - **target** DOM string pointing to the html content of the view.  Normally should be document.body.innerHTML to grab only the `<body>` inner
    - **remove** Query selector to match elements to remove.  i.e. "script, #hello, .mine" will remove all `script` tags, any element with the ID `hello`, and any element with the class `mine`
    - **prepend** - String to prepend to the document.  Default for layouts should be the document type, as this is stripped in the target process.
    - **append** - String to append to the document
    - **remap** - Array of remaps.  Remaps "remap" the folder structure of tags in your HTML files to resemble the build. 
        - **tag** - Tag to match
        - **from** - String or regex to replace the href or src from
        - **to** - String to replace the href or src to
        - **prepend** - A string to prepend to the path
        - **append** - A string to append to the path
- **precmd** - Shell command to run before the convert
- **postcmd** - Shell command to run after the convert

## Builder

- **dirBuild** - Build directory
- **dirMerge** - App directory to merge with the build
- **installCmd** - Command to install the app (e.g. `express`)
- **cleanupCmd** - Command to run after the app installs (inside the build directory)
- **precmd** - Shell command to run before the build
- **postcmd** - Shell command to run after the build

## Exporter

- **dirBuild** - Export directory (can be seperate from the build directory)
- **dirViews** - Directory to export views to (inside the build)
- **dirImages** - Directory to copy images to (inside the build)
- **dirCSS** - Directory to copy css to
- **dirJS** - Directory to copy js to
- **viewExtension** - Extension to convert the views to
- **precmd** - Shell command to run before the export
- **postcmd** - Shell command to run after the export