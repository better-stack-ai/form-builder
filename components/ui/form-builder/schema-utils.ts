import type {
  FormBuilderComponentDefinition,
  FormBuilderField,
  JSONSchema,
  JSONSchemaProperty,
} from "./types";

/**
 * Convert internal fields to JSON Schema
 */
export function fieldsToJSONSchema(
  fields: FormBuilderField[],
  components: FormBuilderComponentDefinition[]
): JSONSchema {
  const properties: Record<string, JSONSchemaProperty> = {};
  const required: string[] = [];

  for (const field of fields) {
    const component = components.find((c) => c.type === field.type);
    if (!component) {
      console.warn(`Unknown component type: ${field.type}`);
      continue;
    }

    const isRequired = field.props.required ?? false;
    const schemaProp = component.toJSONSchema(field.props, isRequired);
    properties[field.id] = schemaProp;

    if (isRequired) {
      required.push(field.id);
    }
  }

  return {
    type: "object",
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

/**
 * Convert JSON Schema to internal fields
 */
export function jsonSchemaToFields(
  schema: JSONSchema | null | undefined,
  components: FormBuilderComponentDefinition[]
): FormBuilderField[] {
  if (!schema || !schema.properties) {
    return [];
  }

  const fields: FormBuilderField[] = [];
  const requiredSet = new Set(schema.required || []);

  for (const [key, prop] of Object.entries(schema.properties)) {
    const isRequired = requiredSet.has(key);
    let field: FormBuilderField | null = null;

    // Try each component's fromJSONSchema in order
    // Components are ordered by specificity (more specific first)
    for (const component of components) {
      field = component.fromJSONSchema(prop, key, isRequired);
      if (field) {
        break;
      }
    }

    if (field) {
      fields.push(field);
    } else {
      // Fallback: create a generic text field for unknown types
      console.warn(`Could not parse JSON Schema property: ${key}`, prop);
      fields.push({
        id: key,
        type: "text",
        props: {
          label: prop.title || key,
          description: prop.description,
          placeholder: prop.placeholder,
          required: isRequired,
        },
      });
    }
  }

  return fields;
}

/**
 * Generate a unique field ID
 */
export function generateFieldId(prefix: string = "field"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize a field ID to be a valid JSON Schema property key
 */
export function sanitizeFieldId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&");
}
