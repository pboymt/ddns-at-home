import AJV, { ValidateFunction } from "ajv";
import { readFileSync } from "fs";
import { join } from "path";

export function validateSetting(): ValidateFunction {
    const schemaData = readFileSync(join(__dirname, '../../settings.schema.json'), 'utf-8');
    const schema = JSON.parse(schemaData) as Record<string, unknown>;
    const ajv = new AJV({ useDefaults: true });

    const validate = ajv.compile(schema);
    return validate;
}
