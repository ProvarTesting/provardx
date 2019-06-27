import * as fs from 'fs';
import { schema } from "./DxPropertiesSchema";

import { Validator, ValidatorResult } from "jsonschema";
import { AnyJson } from '@salesforce/ts-types';
import { cli } from 'cli-ux';
/**
 * Utility class for provar dx commands. 
 * @author Himanshu Sharma
 */
export default class ProvarDXUtility {
    provarDxPropertiesJsonLoc : string = './provardx-properties.json';
    validationResults : ValidatorResult;
    propertyInstance: any;

    /**
     * Validate the dx properties json file.
     * @param propertyJson 
     */
    public validatePropertiesJson(propertyJson: string): boolean {
        let jsonValidator = new Validator();
        let propertiesLoc = propertyJson ? propertyJson : this.provarDxPropertiesJsonLoc;
        let instance = JSON.parse(fs.readFileSync(propertiesLoc).toString());
        this.propertyInstance = instance;
        
        this.validationResults = jsonValidator.validate(instance, schema);
        
        if(this.validationResults.errors.length > 0) {
            return false;
        }
        return true;
    }
    
    /**
     * Check for duplicate connection override properties.
     * @param instance 
     */
    public hasDuplicateConnectionOverride(instance: Object): boolean {
        let overrideMap = new Map();
        let override = instance["connectionOverride"];
        for(let i = 0; i < override.length ; i++) {
            let connectionName = override[i].connection;
            if(overrideMap.has(connectionName)){
                return true;
            }
            overrideMap.set(connectionName, override[i].username)
        }
        return false;
    }

    /**
     * Returns the validation results
     */
    public getValidationResults(): ValidatorResult {
        return this.validationResults;
    }
    
    /**
     * Returns the validated dx properties instance
     */
    public getProperties(): any {
        return this.propertyInstance;
    }

    /**
     * Updates the dx properties json string before it is send to command executer.
     * @param rawProperties 
     */
    public prepareRawProperties(rawProperties:string) : string {
        return '"' + rawProperties.replace(/"/g, "\\\"") + '"';
    }

    /**
     * Gets the dx user info and generated the password for dx user if not already created.
     * @param overrides Connection overrides provided in dx property file.
     */
    public async getDxUsersInfo(overrides: string) : Promise<AnyJson> {
        let dxUsers = [];
        for(let i = 0; i < overrides.length; i++) {
            let username = overrides[i]["username"];
            let message = 'Validating and retriving dx user info: ' + username;
            let dxUserInfo = await this.executeCommand('sfdx force:user:display --json -u ' + username, message);
            let jsonDxUser = JSON.parse(dxUserInfo.toString());
            if(jsonDxUser.status !== 0) {
                console.error('[WARNING] ' + jsonDxUser.message +'. Skipping operation.');
                continue;
            }
            if(jsonDxUser.result.password == null) {
                let generatePasswordCommand = 'sfdx force:user:password:generate --targetusername ' + username;
                await this.executeCommand(generatePasswordCommand, 'Generating password for user: '+ username);
                dxUserInfo = await this.executeCommand('sfdx force:user:display --json -u ' + username, "Getting generated password for user: "+ username);
                jsonDxUser = JSON.parse(dxUserInfo.toString());
            }
            jsonDxUser.result.connection = overrides[i]["connection"];
            jsonDxUser.result.password = jsonDxUser.result.password.replace("&", "038;"); //replacing '&' with its ASCII value, '&' caused arguments to truncate when passed to java args.
            dxUsers.push(jsonDxUser);
        }
        if(dxUsers.length == 0){
            return null;
        }
        return dxUsers;
    }

    /**
     * Executes the provided dx command.
     * @param command Command string
     * @param message Message to be displayed while command execution is in progress.
     */
    private async executeCommand(command:string, message:string): Promise<AnyJson>  {
        if(message) {
            cli.action.start(message)
        }
        let isSucessful = false;
        const { promisify } = require('util');
        const exec = promisify(require('child_process').exec)
        try {
            const result =  await exec(command);
            isSucessful = true;
            return result.stdout;
        } catch (e) {
            let errorMessage = e.message;
            errorMessage = errorMessage.substring(errorMessage.indexOf('{'), errorMessage.indexOf('}')+1);
            return errorMessage;
        } finally {
            if(message) {
                cli.action.stop(isSucessful ? 'successful' : 'failed');
            }
        }
    }
};
