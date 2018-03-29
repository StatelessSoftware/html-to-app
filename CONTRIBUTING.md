# Contributing
html-to-app relies on the community to make it great.  Therefore, we try to make things as easy as possible to contribute.  Please read through this page before commiting - any code that does not adhere to these guidelines will not be accepted without modification.

## Getting Started
### Search for a ticket
Before you go and tackle a bugfix or adding functionality, you should make sure nobody else is already on top of it!

### Submit a ticket
Submit a ticket, clearly describing the bug or functionality, how to reproduce, etc.  Each ticket should describe one single issue or addition.

### Fork the repo
Fork the html-to-app repository.

### Pull Request
Please keep your pull request message short and sweet, but make sure to reference the ticket that it addresses!
Each pull request should represent one ticket.

## Commits
Keeping clean, logical, and working commits is imperative to the overall cleanliness of StatelessCMS.

### Commit Messages
Commit messages should be short and concise, yet accurately describe what you did

### Test Before Commitng
Please run a test before each commit!

Tests should run cleanly without any warnings, failures, or exceptions.  Tests should run while debugging without stopping the debugger.

## Coding Style
If you are unsure of how something should be styled, StatelessCMS will always follow Google's styleguide for that language (or C in the case of C-based languages)
Any code contributions must follow the appropriate styleguide.
Also, please lint your code and ensure you do not mess up any whitespace!

## Documenting Your Code
Please document your code while writing it, using Doxygen's style.

```c
/** Member variables look like this. */

/**
 * Code blocks look like this
 *
 * @param string myString Parameters look like this
 * @return boolean Returns look like this
 */
```

Make sure you document your code before submitting a pull request, run doxygen and make sure it does not throw any warnings or errors.

*** Author headings will be deleted ***
Please do not create file headers, as we do not use them in the project at this time.  (besides in the main file autoload.php).  Recognition will be based on your git commits, so make sure you set your git config email and name properly.

## Versioning
Please do not change the verion file header, but please do mark in your pull request the proposed version number.  Version numbers follow the MAJOR.MINOR.PATCH version system.
