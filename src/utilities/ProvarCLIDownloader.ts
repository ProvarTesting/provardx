import * as path from 'path';
import * as fs from 'fs';
import * as cliProgress from 'cli-progress';
import * as extractZip from 'extract-zip';
import * as https from 'https';
import { Messages } from '@salesforce/core';
import { cli } from 'cli-ux';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages(
    '@provartesting/provardx',
    'provarCLIDownloader'
);
export default class ProvarCLIDownloader {
    private DEFAULT_DIR = process.cwd();
    private PROVAR_CLI_MIN_VERSION = '2.2.1.06';
    private PROVAR_CLI_MAX_VERSION = '2.3.0.04';
    private PROVAR_CLI_VERSION = this.PROVAR_CLI_MAX_VERSION.substring(
        0,
        this.PROVAR_CLI_MAX_VERSION.lastIndexOf('.')
    );
    private PROVAR_CLI_URL = `https://download.provartesting.com/${this.PROVAR_CLI_VERSION}/Provar_ANT_${this.PROVAR_CLI_MAX_VERSION}.zip`;

    private PROVAR_CLI_FOLDER_NAME = (folderPath, suffix = '') =>
        `${folderPath}/ProvarCLI${suffix}`;
    private propertyInstance = null;

    public async verifyProvarCLIVersion(
        propertyFile: string
    ): Promise<boolean> {
        const provarHomeUri = this.getProvarHome(propertyFile);
        if (provarHomeUri && !this.isCLI(provarHomeUri)) {
            return true;
        }

        if (!provarHomeUri) {
            const downloadCLI = await cli.confirm(
                messages.getMessage('cliNotPresent')
            );
            if (!downloadCLI) {
                return false;
            }
            await this.downloadLatestCLI(propertyFile);
        } else if (this.isCLI(provarHomeUri)) {
            const provarCLIVersion = this.getCurrentProvarCLIVersion(
                provarHomeUri
            );

            const {
                downloadRequired,
                downloadMessage
            } = this.verifyIsSupportedVersion(provarCLIVersion);
            if (!downloadMessage && !downloadRequired) {
                return true;
            }
            const downloadCLI = await cli.confirm(downloadMessage);
            if (!downloadCLI) {
                if (!downloadRequired) {
                    return true;
                }
                return false;
            }
            await this.downloadLatestCLI(propertyFile);
        }
        return true;
    }

    private getProvarHome(propertyFile): string {
        this.readPropertiesFile(propertyFile);
        let provarHome = this.propertyInstance?.provarHome;
        if (!provarHome) {
            switch (process.platform) {
                case 'darwin':
                    provarHome =
                        process.env.PROVAR_HOME ||
                        path.join(
                            '/Applications',
                            'Provar.app',
                            'Contents',
                            'Eclipse'
                        );
                    break;
                case 'win32':
                    provarHome =
                        process.env.PROVAR_HOME ||
                        path.join('C:\\', 'Program Files', 'Provar');
                    break;
            }
        }
        if (!fs.existsSync(provarHome) || !fs.statSync(provarHome).isFile) {
            return null;
        }
        return provarHome;
    }

    private readPropertiesFile(propertyFile = './provardx-properties.json') {
        const propertiesLoc = propertyFile;
        if (
            !fs.existsSync(propertiesLoc) ||
            !fs.statSync(propertiesLoc).isFile
        ) {
            return;
        }
        const instance = JSON.parse(fs.readFileSync(propertiesLoc).toString());
        this.propertyInstance = instance;
    }

    private isCLI(provarHome) {
        const filepath = `${provarHome}/provar.ini`;
        if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile) {
            return true;
        }
        return false;
    }

    private getCurrentProvarCLIVersion(basePath = this.DEFAULT_DIR) {
        basePath += '/lib/';
        const folderName = 'com.provar.testrunner_';
        const dirName = fs
            .readdirSync(basePath, {
                withFileTypes: true
            })
            .find((e) => e.isDirectory() && e.name.startsWith(folderName));

        if (!dirName) {
            throw messages.getMessage('directoryError', [folderName]);
        }

        const finalPath = `${basePath}${dirName.name}/ProvarVersion`;
        const content = fs.readFileSync(finalPath).toString();
        return this.getVersionFromString(content);
    }

    private getVersionFromString(content = '') {
        const versionRegex = /[\d]+.[\d]+.[\d]+.[\d]+/;
        const matches = content.match(versionRegex);
        if (!matches) {
            return null;
        }
        return matches[0];
    }

    private async downloadLatestCLI(propertyFile) {
        let folderPath = await cli.prompt(
            messages.getMessage('enterFolderPath'),
            { required: false }
        );
        if (!folderPath || !fs.existsSync(folderPath)) {
            folderPath = this.DEFAULT_DIR;
        }
        const provarHome = this.PROVAR_CLI_FOLDER_NAME(folderPath);
        await this.downloadCLI(folderPath);

        cli.info(`\n${messages.getMessage('provarHome', [provarHome])}\n`);

        const updateProperties = await cli.confirm(
            messages.getMessage('updateProvarHome', [provarHome])
        );
        if (updateProperties) {
            this.updateProvarHomeInPropertiesFile(propertyFile, provarHome);
        }
    }

    private async downloadCLI(folderPath: string) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(
                this.PROVAR_CLI_FOLDER_NAME(folderPath, '.zip')
            );

            const request = https.get(this.PROVAR_CLI_URL, (response) => {
                const prog = new cliProgress.SingleBar(
                    {},
                    cliProgress.Presets.shades_classic
                );

                cli.info('\nDownloading...');
                prog.start(100, 0);
                const len = parseInt(response.headers['content-length']);
                let received = 0;
                response.on('data', (chunks) => {
                    file.write(chunks);
                    received += chunks.length;
                    prog.update((received / len) * 100);
                });
                response.on('end', () => {
                    resolve(true);
                    file.close();
                    prog.stop();
                    this.unzipCLI(folderPath);
                });
            });

            request.on('error', (e) => {
                cli.warn(e);
                fs.unlink(folderPath, () => {});
                reject(e.message);
            });
        });
    }

    private unzipCLI(folderPath) {
        extractZip(this.PROVAR_CLI_FOLDER_NAME(folderPath, '.zip'), {
            dir: this.PROVAR_CLI_FOLDER_NAME(folderPath)
        });
    }

    private updateProvarHomeInPropertiesFile(
        propertyFile = './provardx-properties.json',
        provarHome
    ) {
        const propertiesFileContent = this.propertyInstance;
        propertiesFileContent.provarHome = provarHome;
        fs.writeFileSync(
            propertyFile,
            JSON.stringify(propertiesFileContent, null, '\t')
        );
    }

    private compareVersion(v1, v2) {
        if (typeof v1 !== 'string') return false;
        if (typeof v2 !== 'string') return false;
        v1 = v1.split('.');
        v2 = v2.split('.');
        const length = Math.min(v1.length, v2.length);
        for (let i = 0; i < length; ++i) {
            v1[i] = parseInt(v1[i], 10);
            v2[i] = parseInt(v2[i], 10);
            if (v1[i] > v2[i]) return 1;
            if (v1[i] < v2[i]) return -1;
        }
        return v1.length == v2.length ? 0 : v1.length < v2.length ? -1 : 1;
    }

    private verifyIsSupportedVersion(provarCLIVersion) {
        const returnObj = {
            downloadRequired: false,
            downloadMessage: ''
        };

        const diffWithMinVersion = this.compareVersion(
            this.PROVAR_CLI_MIN_VERSION,
            provarCLIVersion
        );
        const diffWithMaxVersion = this.compareVersion(
            this.PROVAR_CLI_MAX_VERSION,
            provarCLIVersion
        );

        if (diffWithMaxVersion === 0) {
            // Intentionally left blank
        } else if (diffWithMinVersion === 1) {
            returnObj.downloadRequired = true;
            returnObj.downloadMessage = messages.getMessage(
                'cliVersionLessThanMinSupportedVersion',
                [provarCLIVersion, this.PROVAR_CLI_MAX_VERSION]
            );
        } else if (
            (diffWithMinVersion === 0 || diffWithMinVersion === -1) &&
            diffWithMaxVersion === 1
        ) {
            returnObj.downloadRequired = false;
            returnObj.downloadMessage = messages.getMessage(
                'cliNewVersionAvailable',
                [this.PROVAR_CLI_MAX_VERSION]
            );
        } else {
            returnObj.downloadRequired = true;
            returnObj.downloadMessage = messages.getMessage(
                'cliVersionNotSupported',
                [provarCLIVersion, this.PROVAR_CLI_MAX_VERSION]
            );
        }
        return returnObj;
    }
}
