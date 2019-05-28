import AJV from "ajv";
import { readFileSync } from "fs";
import { join } from "path";

const schemaData = readFileSync(join(__dirname, '../settings.schema.json'), 'utf-8');
const schema = JSON.parse(schemaData);
const ajv = new AJV({ useDefaults: true });

const validate = ajv.compile(schema);

export const v = validate;
