# Changelog - html-to-app

## [0.2.2] - 2018-03-30

### Fixes

- [Issue #29] - Build -f throws exception if app is open in another window
- [Issue #28] - App isn't merged without -f

## [0.2.1] - 2018-03-29

### Additions

- [Issue #21] - Allow for contributions (md files, etc)

### Fixes

- [Issue #24] - App merge doesn't work
- [Issue #23] - Remaps with hash checks result in 403
- [Issue #22] - Configuration file created successfully even if it exists.

## [0.2.0] - 2018-03-27

### Additions

- [Issue #18] - App directory
- [Issue #17] - Readme

### Fixes

- [Issue #19] - Remove testing tag from config

## [0.1.1] - 2018-03-26

### Fixes

- [Issue #14] - Checking builder.shouldBuild() is not idempotent
- [Issue #13] - html-to-app fails if out-of-source build, with -f, and dist folder already existing
- [Issue #12] - html-to-app -c should kill program after creating config file

## [0.1.0] - 2018-03-26

### Additions

- [Issue #10] - Config creator should export full-featured config file
- [Issue #7] - Pre & Post commands at each step
- [Issue #6] - Converter needs to remap directories
- [Issue #2] - Importer should have ignore files functionality

### Fixes

- [Issue #8] - Out-of-source build creates extra subnested dist folder
- [Issue #5] - Build fails if images directory doesnt exist
- [Issue #4] - Default config file should be in seperate file
- [Issue #3] - Default config should support out-of-source build

## [0.0.2] - 2018-03-24

### Fixes

- Remove config directory from source-control
- Create a blank config file if non-existant
- Changed the default image import path from `./assets/images/` to `./images`
