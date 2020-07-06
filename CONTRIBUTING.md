## Contributing

1. When contributing to this repository please first create a new issue before
   starting your work.
1. Fork this repository and create your _topic_ branch from **development** (see [Branches section](#branches) below).
1. Edit the code in your fork and add test cases for the same.
1. If you have added new `sfdx command` then update the documentation (README.md) with the signature of new method.
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

## Pull Requests

-   Develop features and bug fixes in _topic_ branches.
-   Create a pull request for merging _topic_ branch in `development`.
