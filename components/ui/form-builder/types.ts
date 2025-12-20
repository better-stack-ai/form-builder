import type { z } from "zod";

/**
 * JSON Schema types for form builder I/O
 */
export interface JSONSchema {
  type: "object";
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  $schema?: string;
}

export interface JSONSchemaProperty {
  type: string;
  // Standard JSON Schema properties
  title?: string;
  description?: string;
  default?: unknown;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  // Form builder metadata (preserved in JSON Schema)
  label?: string;
  fieldType?: string;
  placeholder?: string;
  inputType?: string;
  inputProps?: {
    placeholder?: string;
    type?: string;
    [key: string]: unknown;
  };
  // For nested objects
  properties?: Record<string, JSONSchemaProperty>;
  additionalProperties?: boolean;
  // For arrays
  items?: JSONSchemaProperty;
  required?: string[];
}

/**
 * Internal field representation used by form builder
 */
export interface FormBuilderField {
  id: string;
  type: string;
  props: FormBuilderFieldProps;
}

export interface FormBuilderFieldProps {
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  // Validation
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  // For select/radio
  options?: string[];
  // For custom field types
  inputType?: string;
  fieldType?: string;
}

/**
 * Component definition provided by developers
 */
export interface FormBuilderComponentDefinition {
  /** Unique identifier for this component type */
  type: string;
  /** Display name shown in the palette */
  label: string;
  /** Icon shown in the palette */
  icon?: React.ComponentType<{ className?: string }>;
  /** Default props when a new field is created */
  defaultProps: Partial<FormBuilderFieldProps>;
  /** Zod schema for the property panel */
  propertiesSchema: z.ZodObject<z.ZodRawShape>;
  /** Convert field props to JSON Schema property */
  toJSONSchema: (props: FormBuilderFieldProps, isRequired: boolean) => JSONSchemaProperty;
  /** Try to parse a JSON Schema property into this component type */
  fromJSONSchema: (prop: JSONSchemaProperty, key: string, isRequired: boolean) => FormBuilderField | null;
  /** Optional custom preview component */
  PreviewComponent?: React.ComponentType<{ field: FormBuilderField }>;
}

/**
 * Form builder context for sharing state
 */
export interface FormBuilderContextValue {
  fields: FormBuilderField[];
  selectedFieldId: string | null;
  components: FormBuilderComponentDefinition[];
  mode: "build" | "preview";
  setFields: (fields: FormBuilderField[]) => void;
  setSelectedFieldId: (id: string | null) => void;
  setMode: (mode: "build" | "preview") => void;
  addField: (componentType: string, index?: number) => void;
  updateField: (id: string, props: Partial<FormBuilderFieldProps>) => void;
  removeField: (id: string) => void;
  moveField: (fromIndex: number, toIndex: number) => void;
}

/**
 * Drag data types for dnd-kit
 */
export interface PaletteDragData {
  type: "palette";
  componentType: string;
}

export interface FieldDragData {
  type: "field";
  fieldId: string;
  index: number;
}

export type DragData = PaletteDragData | FieldDragData;
