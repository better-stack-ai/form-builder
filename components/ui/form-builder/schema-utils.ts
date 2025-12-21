import type {
  FormBuilderComponentDefinition,
  FormBuilderField,
  JSONSchema,
  JSONSchemaProperty,
} from "./types";

/**
 * Helper to convert fields to JSON Schema properties (recursive)
 */
function fieldsToProperties(
  fields: FormBuilderField[],
  components: FormBuilderComponentDefinition[]
): Record<string, JSONSchemaProperty> {
  const properties: Record<string, JSONSchemaProperty> = {};

  for (const field of fields) {
    const component = components.find((c) => c.type === field.type);
    if (!component) {
      console.warn(`Unknown component type: ${field.type}`);
      continue;
    }

    const isRequired = field.props.required ?? false;
    const schemaProp = component.toJSONSchema(field.props, isRequired);

    // Handle nested object fields
    if (field.type === "object" && field.children && field.children.length > 0) {
      schemaProp.properties = fieldsToProperties(field.children, components);
      const childRequired = field.children
        .filter((child) => child.props.required)
        .map((child) => child.id);
      if (childRequired.length > 0) {
        schemaProp.required = childRequired;
      }
    }

    // Handle nested array fields
    if (field.type === "array" && field.itemTemplate && field.itemTemplate.length > 0) {
      schemaProp.items = {
        type: "object",
        properties: fieldsToProperties(field.itemTemplate, components),
      };
      const itemRequired = field.itemTemplate
        .filter((item) => item.props.required)
        .map((item) => item.id);
      if (itemRequired.length > 0) {
        schemaProp.items.required = itemRequired;
      }
    }

    properties[field.id] = schemaProp;
  }

  return properties;
}

/**
 * Helper to get required field IDs from a list of fields
 */
function getRequiredFieldIds(fields: FormBuilderField[]): string[] {
  return fields.filter((f) => f.props.required).map((f) => f.id);
}

/**
 * Convert internal fields to JSON Schema
 */
export function fieldsToJSONSchema(
  fields: FormBuilderField[],
  components: FormBuilderComponentDefinition[]
): JSONSchema {
  const properties = fieldsToProperties(fields, components);
  const required = getRequiredFieldIds(fields);

  return {
    type: "object",
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

/**
 * Helper to parse JSON Schema properties into fields (recursive)
 */
function propertiesToFields(
  properties: Record<string, JSONSchemaProperty>,
  requiredSet: Set<string>,
  components: FormBuilderComponentDefinition[]
): FormBuilderField[] {
  const fields: FormBuilderField[] = [];

  for (const [key, prop] of Object.entries(properties)) {
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
      // Handle nested object fields
      if (field.type === "object" && prop.properties) {
        const childRequiredSet = new Set(prop.required || []);
        field.children = propertiesToFields(prop.properties, childRequiredSet, components);
      }

      // Handle nested array fields
      if (field.type === "array" && prop.items?.properties) {
        const itemRequiredSet = new Set(prop.items.required || []);
        field.itemTemplate = propertiesToFields(prop.items.properties, itemRequiredSet, components);
      }

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
 * Convert JSON Schema to internal fields
 */
export function jsonSchemaToFields(
  schema: JSONSchema | null | undefined,
  components: FormBuilderComponentDefinition[]
): FormBuilderField[] {
  if (!schema || !schema.properties) {
    return [];
  }

  const requiredSet = new Set(schema.required || []);
  return propertiesToFields(schema.properties, requiredSet, components);
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
