import type { TypedSchema, TypedSchemaError } from 'vee-validate';
import { Schema, ValidationError } from 'joi';
import { normalizeFormPath } from '../../shared';

export function toTypedSchema<TSchema extends Schema>(joiSchema: TSchema): TypedSchema {
  const schema: TypedSchema = {
    __type: 'VVTypedSchema',
    async parse(value) {
      try {
        const result = await joiSchema.validateAsync(value, { abortEarly: false });

        return {
          value: result,
          errors: [],
        };
      } catch (err) {
        if (!(err instanceof ValidationError)) {
          throw err;
        }

        const error = err as ValidationError;

        return {
          errors: processIssues(error),
          rawError: err,
        };
      }
    },
    cast(values) {
      try {
        return joiSchema.validate(values).value as typeof values;
      } catch {
        return values;
      }
    },
  };

  return schema;
}

function processIssues(error: ValidationError): TypedSchemaError[] {
  const errors: Record<string, TypedSchemaError> = {};

  error.details.forEach(detail => {
    const path = normalizeFormPath(detail.path.join('.'));

    if (errors[path]) {
      errors[path].errors.push(detail.message);

      return;
    }

    errors[path] = {
      path,
      errors: [detail.message],
    };
  });

  return Object.values(errors);
}
