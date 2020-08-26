/*
 * Copyright (c) 2020 Make Positive Provar Ltd
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.md file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { execSync } from 'child_process';
import ProvarDXUtility from '../../utilities/ProvarDXUtility';

/**
 * The metadatacache ensures that the metadata cache is up to date prior to running Provar tasks.
 * It can be executed in parallel with other commands as part of a pipeline script,
 * but needs to complete before runtests is executed to avoid any duplication of metadata download.
 * If no user and no propertyfile is specified then the metadata will be downloaded for the SFDX current default user.
 * This may not be what is expected or desired but is consistent with other DX commands! It is up to the user to correctly specify the user(s).
 * For download metadata for multiple users it's recommended to reuse the propertyfile and override the metadata cache settings in the property file with the -m flag.
 * @author Himanshu Sharma
 */

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file.
const messages = Messages.loadMessages(
    '@provartesting/provardx',
    'metadatacache'
);
export default class MetadataCache extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');
    public static examples = [
        "$ sfdx provar:metadatacache -m 'refresh' -c './metadata' -f './myproperties.json'"
    ];

    public static args = [{ name: 'file' }];

    protected static flagsConfig = {
        // flag with a value (-f, --propertyfile=VALUE)
        metadatalevel: flags.string({
            char: 'm',
            description: messages.getMessage('metadataLevelFlagDescription')
        }),
        // flag with a value (-c, --cachepath=VALUE)
        cachepath: flags.string({
            char: 'c',
            description: messages.getMessage('cachePathFlagDescription')
        }),
        // flag with a value (-p, --propertyfile=VALUE)
        propertyfile: flags.string({
            char: 'p',
            description: messages.getMessage('propertyFileFlagDescription')
        }),
        // flag with a value (-l, --loglevel VALUE)
        loglevel: flags.string({
            char: 'l',
            description: messages.getMessage('loglevelFlagDescription')
        }),
        // flag with a value (-n, --connections VALUE)
        connections: flags.string({
            char: 'n',
            description: messages.getMessage('connectionNameFlagDescription')
        }),
        // flag with a value (-o, --connectionoverrides VALUE)
        connectionoverrides: flags.string({
            char: 'o',
            description: messages.getMessage(
                'connectionoverridesFlagDescription'
            )
        })
    };

    public async run(): Promise<AnyJson> {
        const metadataLevel: string = this.flags.metadatalevel;
        const cachePath: string = this.flags.cachepath;
        const propertyFile: string = this.flags.propertyfile;
        // const json : string = this.flags.propertyFile;
        // const logLevel : string = this.flags.loglevel ? this.flags.loglevel : 'INFO';
        const connections: string = this.flags.connections;
        const connectionoverrides: string = this.flags.connectionoverrides;

        if (
            !metadataLevel || !cachePath
        ) {
            this.ux.error(
                "ERROR running provar:metadatacache :  Please specify a cachepath and metadatalevel"
            );
            return {};
        }

        (!["Reload", "Refresh", "Reuse"].includes(metadataLevel)) {
            this.ux.error(
                "ERROR running provar:metadatacache : Please specify a valid metadata level(-m flag). Valid levels are : 'Reuse', 'Refresh' and 'Reload'"
            );
            return {};
        }

        const provarDxUtils: ProvarDXUtility = new ProvarDXUtility();
        const isValid: boolean = provarDxUtils.validatePropertiesJson(
            propertyFile
        );
        const propertiesInstance = provarDxUtils.getProperties();

        if (connections) {
            propertiesInstance.connectionName = connections;
        }

        if (
            !isValid ||
            provarDxUtils.hasDuplicateConnectionOverride(propertiesInstance)
        ) {
            this.ux.error(
                "ERROR running provar:metadatacache : Please specify a valid property file. Run command sfdx provar:validate' to know the validation errors"
            );
            return {};
        }

        const properties = this.updatePropertiesWithOverrides(
            propertiesInstance,
            metadataLevel,
            cachePath,
            propertyFile,
            connectionoverrides
        );
        const rawProperties = JSON.stringify(properties);

        const updateProperties = provarDxUtils.prepareRawProperties(
            rawProperties
        );

        const userInfo = await provarDxUtils.getDxUsersInfo(
            properties.connectionOverride
        );
        if (userInfo == null && !connections) {
            this.ux.error(
                '[ERROR] No valid user org found to download metadata. Terminating command.'
            );
            return {};
        }

        const userInfoString = connections && userInfo === null ? "NA" : provarDxUtils.prepareRawProperties(
            JSON.stringify({ dxUsers: userInfo })
        );
        const jarPath = properties.provarHome + '/provardx/provardx.jar';
        execSync(
            'java -cp "' +
            jarPath +
            '" com.provar.provardx.DxCommandExecuter ' +
            updateProperties +
            ' ' +
            userInfoString +
            ' ' +
            'Metadata',
            { stdio: 'inherit' }
        );
        return {};
    }

    public updatePropertiesWithOverrides(
        // tslint:disable-next-line: no-any
        properties: any,
        metadataLevel: string,
        cachePath: string,
        propertyFile: string,
        connectionOverrides: string
    ) {
        properties.metadata.metadataLevel =
            metadataLevel == null
                ? properties.metadata.metadataLevel
                : metadataLevel;
        properties.metadata.cachePath =
            cachePath == null ? properties.metadata.cachePath : cachePath;
        properties.propertyFile =
            propertyFile == null ? properties.propertyFile : propertyFile;
        this.doConnectionOverrides(properties, connectionOverrides);
        return properties;
    }

    private doConnectionOverrides(
        // tslint:disable-next-line: no-any
        properties: any,
        connectionOverride: string
    ): void {
        if (!connectionOverride && !properties.connectionName) {
            return;
        }

        if (properties.connectionName && properties.connectionOverride) {
            const overrides = properties.connectionName.split(',');
            const connOver = [];
            for (const override of properties.connectionOverride) {
                if (overrides.indexOf(override.connection) != -1) {
                    connOver.push(override);
                }
            }
            properties.connectionOverride = connOver;
        }

        if (connectionOverride) {
            const overrides = connectionOverride.split(',');
            for (const override of overrides) {
                const v = override.split(':');
                const prop = properties.connectionOverride.find(f => f.connection === v[0]);
                if(prop){
                    prop.username = v[1];
                }
            }
        }
    }
}
