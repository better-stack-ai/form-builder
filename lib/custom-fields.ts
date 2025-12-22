/**
 * Custom Field Definitions
 * 
 * This file demonstrates how consumers can create their own custom field
 * definitions for the form-builder using the exported utilities.
 * 
 * These definitions are separate from the core form-builder package,
 * allowing consumers to add custom field types without modifying the package.
 */

import { File, ImageIcon, Palette } from "lucide-react";
import { z } from "zod";
import {
  defineComponent,
  baseMetaSchema,
  type StringFieldProps,
  type JSONSchemaProperty,
} from "@/components/ui/form-builder";

/**
 * Helper to extract label from JSONSchemaProperty
 */
function getLabel(prop: JSONSchemaProperty, key: string): string {
  return prop.label || prop.title || key;
}

/**
 * Color Picker Field
 * 
 * A custom field type that demonstrates how to integrate custom components
 * with the form-builder and auto-form systems. The color is stored as a
 * hex string (e.g., "#3b82f6") in the JSON Schema.
 */
export const colorFieldDefinition = defineComponent<"string">({
  type: "color",
  backingType: "string",
  label: "Color Picker",
  icon: Palette,
  defaultProps: {
    label: "Color",
    required: false,
  },
  propertiesSchema: baseMetaSchema
    .merge(z.object({
      defaultValue: z.string().optional().meta({ 
        label: "Default Color",
        description: "Enter a hex color like #3b82f6",
      }),
    })),
  toJSONSchema: (props: StringFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    fieldType: "color",
    default: props.defaultValue,
    // Pattern for hex colors
    pattern: "^#[0-9A-Fa-f]{6}$",
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    // Match string type with explicit color fieldType
    if (prop.type !== "string" || prop.fieldType !== "color") {
      return null;
    }
    return {
      id: key,
      type: "color",
      props: {
        label: getLabel(prop, key),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default as string | undefined,
      },
    };
  },
});

/**
 * File Upload Field
 * 
 * A custom field type for file uploads. The file URL is stored as a string
 * in the JSON Schema. Requires a custom component to be provided via fieldComponents.
 */
export const fileFieldDefinition = defineComponent<"string">({
  type: "file",
  backingType: "string",
  label: "File Upload",
  icon: File,
  defaultProps: {
    label: "File",
    required: false,
  },
  propertiesSchema: baseMetaSchema
    .merge(z.object({
      defaultValue: z.string().optional().meta({ 
        label: "Default URL",
        description: "Pre-populated file URL for editing existing data",
      }),
    })),
  toJSONSchema: (props: StringFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    fieldType: "file",
    default: props.defaultValue,
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.type !== "string" || prop.fieldType !== "file") {
      return null;
    }
    return {
      id: key,
      type: "file",
      props: {
        label: getLabel(prop, key),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default as string | undefined,
      },
    };
  },
});

/**
 * Image Upload Field
 * 
 * A custom field type for image uploads with preview. The image URL is stored
 * as a string in the JSON Schema. Requires a custom component to be provided via fieldComponents.
 */
export const imageFieldDefinition = defineComponent<"string">({
  type: "image",
  backingType: "string",
  label: "Image Upload",
  icon: ImageIcon,
  defaultProps: {
    label: "Image",
    required: false,
  },
  propertiesSchema: baseMetaSchema
    .merge(z.object({
      defaultValue: z.string().optional().meta({ 
        label: "Default URL",
        description: "Pre-populated image URL for editing existing data",
      }),
    })),
  toJSONSchema: (props: StringFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    fieldType: "image",
    default: props.defaultValue,
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.type !== "string" || prop.fieldType !== "image") {
      return null;
    }
    return {
      id: key,
      type: "image",
      props: {
        label: getLabel(prop, key),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default as string | undefined,
      },
    };
  },
});
