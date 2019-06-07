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
