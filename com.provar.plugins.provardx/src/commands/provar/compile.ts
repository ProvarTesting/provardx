import { flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { Messages } from '@salesforce/core';
import ProvarDXUtility from '../../utilities/ProvarDXUtility';


/**
 * Command to compile all source files. (PageObjects, CustomAPIs)
 * Class will look out for file to compile in project home src directory.
 * @author Himanshu Sharma
 * 
 */

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file.
const messages = Messages.loadMessages('@provartesting/provardx', 'compile');
export default class compile extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');
    public static examples = [
      `$ sfdx provar:compile -p './myproperties.json' --json --loglevel SEVERE`
    ];
   
      
    protected static flagsConfig = {
      propertyfile: flags.string({char: 'p', description: messages.getMessage('propertyFileFlagDescription')}),
      loglevel: flags.string({char: 'l', description: messages.getMessage('loglevelFlagDescription')})
    };
    
    public static args = [{name: 'file'}];

    public async run(): Promise<AnyJson> {
        const propertyFile : string = this.flags.propertyfile;
        const json : boolean = this.flags.json;
        const loglevel : string = this.flags.loglevel ? this.flags.loglevel : 'INFO';
  
        let provarDxUtils : ProvarDXUtility = new ProvarDXUtility();
        let isValid : boolean = provarDxUtils.validatePropertiesJson(propertyFile);

        if(!isValid) {
            this.ux.error("Invalid property file. Run command sfdx provar:validate -e true' to get the validation errors");
            return {};
        }
        this.ux.log("Provided property file:" + propertyFile);
        let jsonValue = json ? json : false;
        this.ux.log("Json: " + jsonValue);
        this.ux.log("LogLevel: " + loglevel);
        //var properties = provarDxUtils.getProperties();
        
        //TODO : actuall login to compile.
        
        return {};
    }
}
