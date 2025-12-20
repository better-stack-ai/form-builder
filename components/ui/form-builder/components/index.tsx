import {
  Type,
  Mail,
  Hash,
  AlignLeft,
  CheckSquare,
  ToggleLeft,
  ChevronDown,
  Circle,
  Lock,
  Globe,
  Phone,
  Calendar,
  Palette,
} from "lucide-react";
import { z } from "zod";
import type {
  FormBuilderComponentDefinition,
  FormBuilderFieldProps,
  JSONSchemaProperty,
} from "../types";

/**
 * Helper to convert a value to a number, handling empty strings and undefined
 */
function toNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Helper to build inputProps object
 */
function buildInputProps(
  placeholder?: string,
  inputType?: string
): { placeholder?: string; type?: string } | undefined {
  const props: { placeholder?: string; type?: string } = {};
  if (placeholder) props.placeholder = placeholder;
  if (inputType) props.type = inputType;
  return Object.keys(props).length > 0 ? props : undefined;
}

/**
 * Helper to extract placeholder from JSONSchemaProperty
 */
function getPlaceholder(prop: JSONSchemaProperty): string | undefined {
  return prop.inputProps?.placeholder || prop.placeholder;
}

/**
 * Helper to extract label from JSONSchemaProperty
 */
function getLabel(prop: JSONSchemaProperty, key: string): string {
  return prop.label || prop.title || key;
}

// Base properties schema shared by most components
const basePropertiesSchema = {
  label: z.string().min(1).meta({ label: "Label" }),
  placeholder: z.string().optional().meta({ label: "Placeholder" }),
  description: z.string().optional().meta({ label: "Description" }),
  required: z.boolean().default(false).meta({ label: "Required", fieldType: "switch" }),
};

/**
 * Text Input Field
 */
export const textFieldDefinition: FormBuilderComponentDefinition = {
  type: "text",
  label: "Text Input",
  icon: Type,
  defaultProps: {
    label: "Text Field",
    placeholder: "",
    required: false,
  },
  propertiesSchema: z.object({
    ...basePropertiesSchema,
    minLength: z.number().int().min(0).optional().meta({ label: "Min Length" }),
    maxLength: z.number().int().min(1).optional().meta({ label: "Max Length" }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    inputProps: buildInputProps(props.placeholder),
    default: props.defaultValue as string | undefined,
    minLength: toNumber(props.minLength),
    maxLength: toNumber(props.maxLength),
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    // Match string type without enum or special fieldType or inputProps.type
    if (
      prop.type !== "string" ||
      prop.enum ||
      prop.fieldType ||
      prop.inputType ||
      prop.format ||
      prop.inputProps?.type
    ) {
      return null;
    }
    return {
      id: key,
      type: "text",
      props: {
        label: getLabel(prop, key),
        placeholder: getPlaceholder(prop),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
        minLength: prop.minLength,
        maxLength: prop.maxLength,
      },
    };
  },
};

/**
 * Email Input Field
 */
export const emailFieldDefinition: FormBuilderComponentDefinition = {
  type: "email",
  label: "Email",
  icon: Mail,
  defaultProps: {
    label: "Email",
    placeholder: "email@example.com",
    required: false,
  },
  propertiesSchema: z.object({
    ...basePropertiesSchema,
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    inputProps: buildInputProps(props.placeholder, "email"),
    default: props.defaultValue as string | undefined,
    format: "email",
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (
      prop.type !== "string" ||
      (prop.format !== "email" && prop.inputType !== "email" && prop.inputProps?.type !== "email")
    ) {
      return null;
    }
    return {
      id: key,
      type: "email",
      props: {
        label: getLabel(prop, key),
        placeholder: getPlaceholder(prop),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
      },
    };
  },
};

/**
 * Number Input Field
 */
export const numberFieldDefinition: FormBuilderComponentDefinition = {
  type: "number",
  label: "Number",
  icon: Hash,
  defaultProps: {
    label: "Number",
    required: false,
  },
  propertiesSchema: z.object({
    ...basePropertiesSchema,
    min: z.number().optional().meta({ label: "Minimum" }),
    max: z.number().optional().meta({ label: "Maximum" }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "number",
    label: props.label,
    description: props.description,
    inputProps: buildInputProps(props.placeholder),
    default: toNumber(props.defaultValue),
    minimum: toNumber(props.min),
    maximum: toNumber(props.max),
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.type !== "number" && prop.type !== "integer") {
      return null;
    }
    return {
      id: key,
      type: "number",
      props: {
        label: getLabel(prop, key),
        placeholder: getPlaceholder(prop),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
        min: prop.minimum,
        max: prop.maximum,
      },
    };
  },
};

/**
 * Textarea Field
 */
export const textareaFieldDefinition: FormBuilderComponentDefinition = {
  type: "textarea",
  label: "Text Area",
  icon: AlignLeft,
  defaultProps: {
    label: "Text Area",
    placeholder: "",
    required: false,
  },
  propertiesSchema: z.object({
    ...basePropertiesSchema,
    minLength: z.number().int().min(0).optional().meta({ label: "Min Length" }),
    maxLength: z.number().int().min(1).optional().meta({ label: "Max Length" }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    fieldType: "textarea",
    inputProps: buildInputProps(props.placeholder),
    default: props.defaultValue as string | undefined,
    minLength: toNumber(props.minLength),
    maxLength: toNumber(props.maxLength),
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.type !== "string" || prop.fieldType !== "textarea") {
      return null;
    }
    return {
      id: key,
      type: "textarea",
      props: {
        label: getLabel(prop, key),
        placeholder: getPlaceholder(prop),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
        minLength: prop.minLength,
        maxLength: prop.maxLength,
      },
    };
  },
};

/**
 * Checkbox Field
 */
export const checkboxFieldDefinition: FormBuilderComponentDefinition = {
  type: "checkbox",
  label: "Checkbox",
  icon: CheckSquare,
  defaultProps: {
    label: "Checkbox",
    required: false,
  },
  propertiesSchema: z.object({
    label: z.string().min(1).meta({ label: "Label" }),
    description: z.string().optional().meta({ label: "Description" }),
    required: z.boolean().default(false).meta({ label: "Required", fieldType: "switch" }),
    defaultValue: z.boolean().default(false).meta({ label: "Default Value", fieldType: "switch" }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "boolean",
    label: props.label,
    description: props.description,
    default: props.defaultValue as boolean | undefined,
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.type !== "boolean" || prop.fieldType === "switch") {
      return null;
    }
    return {
      id: key,
      type: "checkbox",
      props: {
        label: getLabel(prop, key),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
      },
    };
  },
};

/**
 * Switch Field
 */
export const switchFieldDefinition: FormBuilderComponentDefinition = {
  type: "switch",
  label: "Switch",
  icon: ToggleLeft,
  defaultProps: {
    label: "Switch",
    required: false,
  },
  propertiesSchema: z.object({
    label: z.string().min(1).meta({ label: "Label" }),
    description: z.string().optional().meta({ label: "Description" }),
    required: z.boolean().default(false).meta({ label: "Required", fieldType: "switch" }),
    defaultValue: z.boolean().default(false).meta({ label: "Default Value", fieldType: "switch" }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "boolean",
    label: props.label,
    description: props.description,
    fieldType: "switch",
    default: props.defaultValue as boolean | undefined,
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.type !== "boolean" || prop.fieldType !== "switch") {
      return null;
    }
    return {
      id: key,
      type: "switch",
      props: {
        label: getLabel(prop, key),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
      },
    };
  },
};

/**
 * Select Field
 */
export const selectFieldDefinition: FormBuilderComponentDefinition = {
  type: "select",
  label: "Select",
  icon: ChevronDown,
  defaultProps: {
    label: "Select Field",
    required: false,
    options: ["Option 1", "Option 2", "Option 3"],
  },
  propertiesSchema: z.object({
    label: z.string().min(1).meta({ label: "Label" }),
    placeholder: z.string().optional().meta({ label: "Placeholder" }),
    description: z.string().optional().meta({ label: "Description" }),
    required: z.boolean().default(false).meta({ label: "Required", fieldType: "switch" }),
    defaultValue: z.string().optional().meta({ label: "Default Value", description: "Must match one of the options" }),
    options: z
      .string()
      .meta({
        label: "Options (one per line)",
        fieldType: "textarea",
        description: "Enter each option on a new line",
      }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    inputProps: buildInputProps(props.placeholder),
    default: props.defaultValue as string | undefined,
    enum: props.options,
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.type !== "string" || !prop.enum || prop.fieldType === "radio") {
      return null;
    }
    return {
      id: key,
      type: "select",
      props: {
        label: getLabel(prop, key),
        placeholder: getPlaceholder(prop),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
        options: prop.enum,
      },
    };
  },
};

/**
 * Radio Group Field
 */
export const radioFieldDefinition: FormBuilderComponentDefinition = {
  type: "radio",
  label: "Radio Group",
  icon: Circle,
  defaultProps: {
    label: "Radio Group",
    required: false,
    options: ["Option 1", "Option 2", "Option 3"],
  },
  propertiesSchema: z.object({
    label: z.string().min(1).meta({ label: "Label" }),
    description: z.string().optional().meta({ label: "Description" }),
    required: z.boolean().default(false).meta({ label: "Required", fieldType: "switch" }),
    defaultValue: z.string().optional().meta({ label: "Default Value", description: "Must match one of the options" }),
    options: z
      .string()
      .meta({
        label: "Options (one per line)",
        fieldType: "textarea",
        description: "Enter each option on a new line",
      }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    fieldType: "radio",
    default: props.defaultValue as string | undefined,
    enum: props.options,
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.type !== "string" || !prop.enum || prop.fieldType !== "radio") {
      return null;
    }
    return {
      id: key,
      type: "radio",
      props: {
        label: getLabel(prop, key),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
        options: prop.enum,
      },
    };
  },
};

/**
 * Password Input Field
 */
export const passwordFieldDefinition: FormBuilderComponentDefinition = {
  type: "password",
  label: "Password",
  icon: Lock,
  defaultProps: {
    label: "Password",
    placeholder: "••••••••",
    required: false,
  },
  propertiesSchema: z.object({
    ...basePropertiesSchema,
    minLength: z.number().int().min(0).optional().meta({ label: "Min Length" }),
    maxLength: z.number().int().min(1).optional().meta({ label: "Max Length" }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    inputProps: buildInputProps(props.placeholder, "password"),
    default: props.defaultValue as string | undefined,
    minLength: toNumber(props.minLength),
    maxLength: toNumber(props.maxLength),
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (
      prop.type !== "string" ||
      (prop.inputType !== "password" && prop.inputProps?.type !== "password")
    ) {
      return null;
    }
    return {
      id: key,
      type: "password",
      props: {
        label: getLabel(prop, key),
        placeholder: getPlaceholder(prop),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
        minLength: prop.minLength,
        maxLength: prop.maxLength,
      },
    };
  },
};

/**
 * URL/Website Input Field
 */
export const urlFieldDefinition: FormBuilderComponentDefinition = {
  type: "url",
  label: "Website URL",
  icon: Globe,
  defaultProps: {
    label: "Website",
    placeholder: "https://example.com",
    required: false,
  },
  propertiesSchema: z.object({
    ...basePropertiesSchema,
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    inputProps: buildInputProps(props.placeholder),
    default: props.defaultValue as string | undefined,
    format: "uri",
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.type !== "string" || prop.format !== "uri") {
      return null;
    }
    return {
      id: key,
      type: "url",
      props: {
        label: getLabel(prop, key),
        placeholder: getPlaceholder(prop),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
      },
    };
  },
};

/**
 * Phone Input Field
 */
export const phoneFieldDefinition: FormBuilderComponentDefinition = {
  type: "phone",
  label: "Phone Number",
  icon: Phone,
  defaultProps: {
    label: "Phone Number",
    placeholder: "+1 (555) 123-4567",
    required: false,
  },
  propertiesSchema: z.object({
    ...basePropertiesSchema,
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    inputProps: buildInputProps(props.placeholder, "tel"),
    default: props.defaultValue as string | undefined,
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (
      prop.type !== "string" ||
      (prop.inputType !== "tel" && prop.inputProps?.type !== "tel")
    ) {
      return null;
    }
    return {
      id: key,
      type: "phone",
      props: {
        label: getLabel(prop, key),
        placeholder: getPlaceholder(prop),
        description: prop.description,
        required: isRequired,
        defaultValue: prop.default,
      },
    };
  },
};

/**
 * Date Picker Field
 * 
 * Stores dates as ISO datetime strings in JSON Schema (format: "date-time")
 * but works with JavaScript Date objects in the form UI.
 */
export const dateFieldDefinition: FormBuilderComponentDefinition = {
  type: "date",
  label: "Date Picker",
  icon: Calendar,
  defaultProps: {
    label: "Date",
    required: false,
  },
  propertiesSchema: z.object({
    label: z.string().min(1).meta({ label: "Label" }),
    description: z.string().optional().meta({ label: "Description" }),
    required: z.boolean().default(false).meta({ label: "Required", fieldType: "switch" }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    format: "date-time",
    fieldType: "date",
    label: props.label,
    description: props.description,
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    // Match string type with date-time format or explicit date fieldType
    if (
      prop.type !== "string" ||
      (prop.format !== "date-time" && prop.fieldType !== "date")
    ) {
      return null;
    }
    return {
      id: key,
      type: "date",
      props: {
        label: getLabel(prop, key),
        description: prop.description,
        required: isRequired,
      },
    };
  },
};

/**
 * Color Picker Field
 * 
 * A custom field type that demonstrates how to integrate custom components
 * with the form-builder and auto-form systems. The color is stored as a
 * hex string (e.g., "#3b82f6") in the JSON Schema.
 */
export const colorFieldDefinition: FormBuilderComponentDefinition = {
  type: "color",
  label: "Color Picker",
  icon: Palette,
  defaultProps: {
    label: "Color",
    required: false,
  },
  propertiesSchema: z.object({
    label: z.string().min(1).meta({ label: "Label" }),
    description: z.string().optional().meta({ label: "Description" }),
    required: z.boolean().default(false).meta({ label: "Required", fieldType: "switch" }),
    defaultValue: z.string().optional().meta({ 
      label: "Default Color",
      description: "Enter a hex color like #3b82f6",
    }),
  }),
  toJSONSchema: (props: FormBuilderFieldProps): JSONSchemaProperty => ({
    type: "string",
    label: props.label,
    description: props.description,
    fieldType: "color",
    default: props.defaultValue as string | undefined,
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
        defaultValue: prop.default,
      },
    };
  },
};

/**
 * All default components in order of specificity (more specific first)
 * This order matters for fromJSONSchema matching
 */
export const defaultComponents: FormBuilderComponentDefinition[] = [
  // Specific types first
  emailFieldDefinition,
  passwordFieldDefinition,
  urlFieldDefinition,
  phoneFieldDefinition,
  dateFieldDefinition,
  colorFieldDefinition,
  textareaFieldDefinition,
  switchFieldDefinition,
  radioFieldDefinition,
  selectFieldDefinition,
  checkboxFieldDefinition,
  numberFieldDefinition,
  // Generic fallback last
  textFieldDefinition,
];

/**
 * Get component definition by type
 */
export function getComponentByType(
  type: string,
  components: FormBuilderComponentDefinition[] = defaultComponents
): FormBuilderComponentDefinition | undefined {
  return components.find((c) => c.type === type);
}
