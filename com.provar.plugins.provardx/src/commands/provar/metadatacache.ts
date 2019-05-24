import { flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { Messages } from '@salesforce/core';
import ProvarDXUtility from '../../utilities/ProvarDXUtility';
import { execSync } from 'child_process';


/**
 * @description
 *The metadatacache ensures that the metadata cache is up to date prior to running Provar tasks. 
 *It can be executed in parallel with other commands as part of a pipeline script, 
 *but needs to complete before runtests is executed to avoid any duplication of metadata download.
 *If no user and no propertyfile is specified then the metadata will be downloaded for the SFDX current default user. 
 *This may not be what is expected or desired but is consistent with other DX commands! It is up to the user to correctly specify the user(s). 
 *For download metadata for multiple users it’s recommended to reuse the propertyfile and override the metadata cache settings in the property file with the -m flag.

 * @author Himanshu Sharma
 */

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file.
const messages = Messages.loadMessages('@provartesting/provardx', 'metadatacache');
export default class metadatacache extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');
  public static examples = [
    `$ sfdx provar:metadatacache -m 'refresh' -c './metadata' -f './myproperties.json'`
    ];
 
    
  protected static flagsConfig = {
    // flag with a value (-f, --propertyfile=VALUE)
    metadatalevel: flags.string({char: 'm', description: messages.getMessage('metadataLevelFlagDescription')}),
    // flag with a value (-c, --cachepath=VALUE)
    cachepath: flags.string({char: 'c', description: messages.getMessage('cachePathFlagDescription')}),
    // flag with a value (-p, --propertyfile=VALUE)
    propertyfile: flags.string({char: 'p', description: messages.getMessage('propertyFileFlagDescription')}),
    // flag with a value (-l, --loglevel VALUE)
    loglevel: flags.string({char: 'l', description: messages.getMessage('loglevelFlagDescription')})
  };

  
  public static args = [{name: 'file'}];

  public async run(): Promise<AnyJson> {
    const metadataLevel : string = this.flags.metadatalevel;
    const cachePath : string = this.flags.cachepath;
    const propertyFile : string = this.flags.propertyfile;
    const json : string = this.flags.propertyFile;
    const logLevel : string = this.flags.loglevel ? this.flags.loglevel : 'INFO';

    let provarDxUtils : ProvarDXUtility = new ProvarDXUtility();
    let isValid : boolean = provarDxUtils.validatePropertiesJson(propertyFile);

    if(!isValid) {
        this.ux.error("Invalid property file. Run command sfdx provar:validate -e true' to get the validation errors");
        return {};
    }

    this.ux.log("Metadata level" + ' : ' + metadataLevel);
    this.ux.log("Cache Path" + ' : ' + cachePath);
    this.ux.log("Property File" + ' : ' + propertyFile);
    this.ux.log("JSON" + ' : ' + json);
    this.ux.log("Log level" + ' : ' + logLevel);
    
    let properties = this.updatePropertiesWithOverrides(provarDxUtils.getProperties(), metadataLevel, cachePath, propertyFile);
    let rawProperties = JSON.stringify(properties);

    let updateProperties = provarDxUtils.prepareRawProperties(rawProperties);

    let jarPath = properties.provarHome +'/provardx/provardx.jar';
        execSync('java -cp "' + jarPath + '" com.provar.provardx.DxCommandExecuter ' + updateProperties + " " + "Metadata", 
          {stdio: 'inherit'});

        return {};
  }

  public updatePropertiesWithOverrides(properties: any, metadataLevel: string, cachePath: string, propertyFile: string) {
    properties.metadata.metadataLevel = metadataLevel == null ? properties.metadata.metadataLevel : metadataLevel;
    properties.metadata.cachePath = cachePath == null ? properties.metadata.cachePath: cachePath;
    properties.propertyFile = propertyFile == null ? properties.propertyFile: propertyFile;
    return properties;
  }

}
