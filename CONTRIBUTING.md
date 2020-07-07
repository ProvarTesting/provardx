## Contributing

1. Refer to the [development](developing.md) doc to familiarize yourself with the codebase.
1. When contributing to this repository please first create a new issue before
   starting your work.
1. Fork this repository and create your _topic_ branch from **development** (see [Branches section](#branches) below).
1. Edit the code in your fork and add test cases for the same.
1. If you have added new `provardx command` then update the documentation (README.md) with the signature of new method.
1. Ensure the test suite passes.
1. Make sure your code lints.
1. Issue the pull request when you are done. We'll review your code, suggest any
   needed (if required), and merge it.

## Branches

-   We work in `development`.
-   Release (aka. _production_) branch is `master`.
-   Our work happens in _topic_ branches (feature and/or bug-fix).
    -   feature as well as bug-fix branches are based on `development`

### Merging between branches

-   _topic_ branches are:
    -   based on `development` and will be squash-merged into `development`.

### Merging `development` into `master`

We're following Gitflow: _topic_ branches (feature or bug-fix) -> `development` -> `master`.

-   _topic_ branches: based on development and implement changes for new features or bug fix.
-   `development`: main development branch where all topic branches are merged for ongoing development.
-   `master`: production branch of what has been released. Tags will also be created for release versions.

## Pull Requests

-   Develop features and bug fixes in _topic_ branches.
-   Create a pull request for merging _topic_ branch in `development`.
