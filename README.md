# provartesting/provardx

ProvarDX is a Salesforce CLI Plugin for existing Provar customer to allow them to execute Provar Test Cases from the command line and leveraging the Salesforce CLI and SalesforceDX applications. This provides an alternative mechanism to running test cases than running under ANT.

The ProvarDX CLI plugin is a free to use command library that leverages the commercial Provar Runtime library. You must be a Provar customer with a valid paid license to write and maintain your test cases.

[![Version](https://img.shields.io/npm/v/@provartesting/provardx.svg)](https://npmjs.org/package/@provartesting/provardx)
[![Downloads/week](https://img.shields.io/npm/dw/@provartesting/provardx.svg)](https://npmjs.org/package/@provartesting/provardx)
[![License](https://img.shields.io/npm/l/@provartesting/provardx.svg)](https://github.com/ProvarTesting/provardx/provardx/blob/master/package.json)

## Installation into the Salesforce CLI

Install the plugin into your Salesforce CLI using this command:

```sh-session
$ sfdx plugins:install @provartesting/provardx
```

You can check a successful installation with `sfdx plugins`. Updates are applied when executing `sfdx plugins:update`.

<!-- install -->

## Commands

<!-- commands -->
* [`sfdx provar:compile [-p <string>] [-h <string>] [-c <string>] [--json] [-l <string>]`](#sfdx-provarcompile--p-string--h-string--c-string---json--l-string)
* [`sfdx provar:metadatacache [-m <string>] [-c <string>] [-p <string>] [-n <string>] [-o <string>] [--json] [-l <string>]`](#sfdx-provarmetadatacache--m-string--c-string--p-string--n-string--o-string---json--l-string)
* [`sfdx provar:runtests [-f <string>] [-p <string>] [-o <string>] [-c <string>] [-m <string>] [-s <string>] [--json] [-l <string>]`](#sfdx-provarruntests--f-string--p-string--o-string--c-string--m-string--s-string---json--l-string)
* [`sfdx provar:validate [-p <string>] [--json] [-l <string>]`](#sfdx-provarvalidate--p-string---json--l-string)

## `sfdx provar:compile [-p <string>] [-h <string>] [-c <string>] [--json] [-l <string>]`

Pre-compiles any /src PageObject or PageControl Java source files into object code to use in runtests

```
USAGE
  $ sfdx provar:compile [-p <string>] [-h <string>] [-c <string>] [--json] [-l <string>]

OPTIONS
  -c, --projectpath=projectpath    Specify project path override
  -h, --provarhome=provarhome      Specify provar home override
  -l, --loglevel=loglevel          Specify log level for command output
  -p, --propertyfile=propertyfile  Specify custom property file.
  --json                           format output as json

EXAMPLE
  $ sfdx provar:compile -p './myproperties.json' --json --loglevel SEVERE
```

_See code: [src/commands/provar/compile.ts](https://github.com/ProvarTesting/provardx/blob/v0.0.1/src/commands/provar/compile.ts)_

## `sfdx provar:metadatacache [-m <string>] [-c <string>] [-p <string>] [-n <string>] [-o <string>] [--json] [-l <string>]`

Command to pre-download any required metadata for a specified user or provar connections.

```
USAGE
  $ sfdx provar:metadatacache [-m <string>] [-c <string>] [-p <string>] [-n <string>] [-o <string>] [--json] [-l 
  <string>]

OPTIONS
  -c, --cachepath=cachepath                      Relative or full file path for where the metadata cache will be stored.
  -l, --loglevel=loglevel                        Specify the log level for command

  -m, --metadatalevel=metadatalevel              Permitted values reload (get all metadata - default) | refresh (only
                                                 download changes).

  -n, --connections=connections                  Specify the name of connection for which metadata to be downloaded.

  -o, --connectionoverrides=connectionoverrides  Specify comma seperated values for connection overrides, eg
                                                 Admin:test@provar.com,Reg:test1@provar.com

  -p, --propertyfile=propertyfile                Specify custom property file.

  --json                                         format output as json

EXAMPLE
  $ sfdx provar:metadatacache -m 'refresh' -c './metadata' -f './myproperties.json'
```

_See code: [src/commands/provar/metadatacache.ts](https://github.com/ProvarTesting/provardx/blob/v0.0.1/src/commands/provar/metadatacache.ts)_

## `sfdx provar:runtests [-f <string>] [-p <string>] [-o <string>] [-c <string>] [-m <string>] [-s <string>] [--json] [-l <string>]`

Runs the specified list of Provar test cases against the currently configured SFDX defaultuserrname

```
USAGE
  $ sfdx provar:runtests [-f <string>] [-p <string>] [-o <string>] [-c <string>] [-m <string>] [-s <string>] [--json] 
  [-l <string>]

OPTIONS
  -c, --cachepath=cachepath                            Specify relative or full file path for where a metadata cache has
                                                       already been downloaded using either a VCS extract or metadata
                                                       ProvarDX command.

  -f, --filespec=filespec                              Specify comma-delimited, ordered paths of test cases to be
                                                       executed. If not provided all tests in the PROJECTPATH will be
                                                       executed.

  -l, --loglevel=loglevel                              Specify the level of feedback provided during the compilation
                                                       (see above) and execution.

  -m, --metadatalevel=metadatalevel                    Specify permitted values reload (get all metadata - default) |
                                                       refresh (only download changes). This overrides any settings made
                                                       in the propertyfile.

  -o, --connectionoverridefile=connectionoverridefile  Connection file in the format provardx-connection-schema.json
                                                       providing a mapping between the Provar project Connection names
                                                       and the target users to be used.

  -p, --propertyfile=propertyfile                      provardx-properties.json file. If filepath specified the filename
                                                       will be assumed or it can be specified (.e.g myprops.json). File
                                                       must be in JSON format and conform to the provardx-properties
                                                       JSON schema.

  -s, --secrets=secrets                                Specify path to secrets file

  --json                                               format output as json

EXAMPLE
  $ sfdx provar:runtests -f './myproperties.json'
```

_See code: [src/commands/provar/runtests.ts](https://github.com/ProvarTesting/provardx/blob/v0.0.1/src/commands/provar/runtests.ts)_

## `sfdx provar:validate [-p <string>] [--json] [-l <string>]`

Validate the provardx property file agains standard JSON Schema

```
USAGE
  $ sfdx provar:validate [-p <string>] [--json] [-l <string>]

OPTIONS
  -l, --loglevel=loglevel          Allow to provide loglevels.
  -p, --propertyfile=propertyfile  Specify custom property file.
  --json                           format output as json

EXAMPLES
  $ sfdx provar:validate
       Property file is valid.
    
  $ sfdx provar:validate --json
       Invalid property file.
       [Detailed validation error shown]
    
  $ sfdx provar:validate -p './provardx-properties.json' --json
       Invalid property file.
       [Detailed validation error shown]
```

_See code: [src/commands/provar/validate.ts](https://github.com/ProvarTesting/provardx/blob/v0.0.1/src/commands/provar/validate.ts)_
<!-- commandsstop -->
