import { flags, SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
import { Messages } from '@salesforce/core';
import ProvarDXUtility from '../../utilities/ProvarDXUtility';
import { execSync } from 'child_process';


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
      projectpath: flags.string({char: 't', description: messages.getMessage('projectPathFlagDescription')}),
      loglevel: flags.string({char: 'l', description: messages.getMessage('loglevelFlagDescription')})
    };
    
    public static args = [{name: 'file'}];

    public async run(): Promise<AnyJson> {
        const propertyFile : string = this.flags.propertyfile;
        const json : boolean = this.flags.json;
        const loglevel : string = this.flags.loglevel ? this.flags.loglevel : 'INFO';
        const projectPath : string = this.flags.projectpath;

        let provarDxUtils : ProvarDXUtility = new ProvarDXUtility();
        let isValid : boolean = provarDxUtils.validatePropertiesJson(propertyFile);
        let jsonValue = json ? json : false;

        if(!isValid) {
            this.ux.error("Invalid property file. Run command sfdx provar:validate -e true' to get the validation errors");
            return {};
        }
        
        this.ux.log("Provided property file:" + propertyFile);
        this.ux.log("Json: " + jsonValue);
        this.ux.log("LogLevel: " + loglevel);

        var properties = provarDxUtils.getProperties();
        if(projectPath) {
          this.updatePropertiesWithOverrides(properties, projectPath);
        }

        let rawProperties = JSON.stringify(properties);
        execSync('java -cp D:/git/Provar/Java/com.provar.testrunner/provardx.jar com.provar.provardx.DxCommandExecuter ' + 
          this.prepareRawProperties(rawProperties) + " " + "Compile", 
          {stdio: 'inherit'});
          return {};
    }

    public prepareRawProperties(rawProperties:string) : string {
      return '"' + rawProperties.replace(/"/g, "\\\"") + '"';
    }

    public updatePropertiesWithOverrides(properties: any, projectPath: string) {
      properties['projectPath'] = projectPath;
      return properties;
    }
}
