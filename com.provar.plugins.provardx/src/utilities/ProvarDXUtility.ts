import { Validator, ValidatorResult } from "jsonschema";
import * as fs from 'fs';
import { schema } from "./DxPropertiesSchema";

/**
 * Utility class for provar dx commands. 
 * @author Himanshu Sharma
 */


export default class ProvarDXUtility {
    provarDxPropertiesJsonLoc : string = './provardx-properties.json';
    validationResults : ValidatorResult;
    propertyInstance: any;

    validatePropertiesJson(propertyJson: string): boolean {
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
    
    hasDuplicateConnectionOverride(instance: Object): boolean {
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

    getValidationResults(): ValidatorResult {
        return this.validationResults;
    }
    
    getProperties(): any {
        return this.propertyInstance;
    }

    prepareRawProperties(rawProperties:string) : string {
        return '"' + rawProperties.replace(/"/g, "\\\"") + '"';
    }
};
