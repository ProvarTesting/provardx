import { Validator, ValidatorResult } from "jsonschema";
import * as fs from 'fs';

/**
 * Utility class for provar dx commands. 
 * @author Himanshu Sharma
 */
export default class ProvarDXUtility {
   
    provarDxJsonSchemaLoc : string = './resources/provardx-properties-schema.json';
    provarDxPropertiesJsonLoc : string = './provardx-properties.json';
    validationResults : ValidatorResult;
    propertyInstance: any;

    validatePropertiesJson(propertyJson: string): boolean {
        var jsonValidator = new Validator();

        var schema = JSON.parse(fs.readFileSync(this.provarDxJsonSchemaLoc).toString());
        var propertiesLoc = propertyJson ? propertyJson : this.provarDxPropertiesJsonLoc;
        var instance = JSON.parse(fs.readFileSync(propertiesLoc).toString());
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
};
