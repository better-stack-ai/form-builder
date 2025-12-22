/**
 * Properties Editor Tests
 *
 * Tests that each field definition's propertiesSchema can be serialized
 * to JSON Schema and that the validation properties are correctly typed.
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// Type for JSON Schema property used in tests
type JSONSchemaObject = {
  type?: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  [key: string]: unknown;
};

type JSONSchemaProperty = {
  type?: string;
  label?: string;
  fieldType?: string;
  description?: string;
  default?: unknown;
  [key: string]: unknown;
};
import {
  textFieldDefinition,
  emailFieldDefinition,
  numberFieldDefinition,
  textareaFieldDefinition,
  checkboxFieldDefinition,
  switchFieldDefinition,
  selectFieldDefinition,
  radioFieldDefinition,
  passwordFieldDefinition,
  urlFieldDefinition,
  phoneFieldDefinition,
  dateFieldDefinition,
  defaultComponents,
} from "@/components/ui/form-builder/components";
import { colorFieldDefinition } from "@/lib/custom-fields";

describe("Field definition propertiesSchema serialization", () => {
  describe("Text field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(textFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      expect(jsonSchema.properties).toBeDefined();

      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.placeholder).toBeDefined();
      expect(props.description).toBeDefined();
      expect(props.required).toBeDefined();
      expect(props.minLength).toBeDefined();
      expect(props.maxLength).toBeDefined();
      expect(props.defaultValue).toBeDefined();
    });

    it("should include meta labels in JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(textFieldDefinition.propertiesSchema) as JSONSchemaObject;

      expect(jsonSchema.properties?.label?.label).toBe("Label");
      expect(jsonSchema.properties?.minLength?.label).toBe("Min Length");
      expect(jsonSchema.properties?.maxLength?.label).toBe("Max Length");
    });

    it("should validate correct form values", () => {
      const result = textFieldDefinition.propertiesSchema.safeParse({
        label: "My Field",
        placeholder: "Enter text",
        description: "A description",
        required: true,
        minLength: 5,
        maxLength: 100,
        defaultValue: "hello",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid form values", () => {
      const result = textFieldDefinition.propertiesSchema.safeParse({
        label: "", // too short
        minLength: -1, // invalid
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Email field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(emailFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.placeholder).toBeDefined();
      expect(props.defaultValue).toBeDefined();
    });
  });

  describe("Number field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(numberFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.min).toBeDefined();
      expect(props.max).toBeDefined();
      expect(props.defaultValue).toBeDefined();
    });

    it("should validate correct min/max values", () => {
      const result = numberFieldDefinition.propertiesSchema.safeParse({
        label: "Age",
        min: 0,
        max: 120,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Textarea field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(textareaFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.minLength).toBeDefined();
      expect(props.maxLength).toBeDefined();
    });
  });

  describe("Checkbox field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(checkboxFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.description).toBeDefined();
      expect(props.required).toBeDefined();
      expect(props.defaultValue).toBeDefined();
      // Checkbox should NOT have placeholder
      expect(props.placeholder).toBeUndefined();
    });

    it("should have boolean default value", () => {
      const jsonSchema = z.toJSONSchema(checkboxFieldDefinition.propertiesSchema) as JSONSchemaObject;
      expect(jsonSchema.properties?.defaultValue?.type).toBe("boolean");
    });
  });

  describe("Switch field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(switchFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.defaultValue).toBeDefined();
      // Switch should NOT have placeholder
      expect(props.placeholder).toBeUndefined();
    });
  });

  describe("Select field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(selectFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.placeholder).toBeDefined();
      expect(props.options).toBeDefined();
      expect(props.defaultValue).toBeDefined();
    });

    it("should have options field with textarea fieldType", () => {
      const jsonSchema = z.toJSONSchema(selectFieldDefinition.propertiesSchema) as JSONSchemaObject;
      expect(jsonSchema.properties?.options?.fieldType).toBe("textarea");
    });
  });

  describe("Radio field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(radioFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.options).toBeDefined();
      // Radio should NOT have placeholder
      expect(props.placeholder).toBeUndefined();
    });
  });

  describe("Password field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(passwordFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.placeholder).toBeDefined();
      expect(props.minLength).toBeDefined();
      expect(props.maxLength).toBeDefined();
    });
  });

  describe("URL field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(urlFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.placeholder).toBeDefined();
      expect(props.defaultValue).toBeDefined();
    });
  });

  describe("Phone field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(phoneFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.placeholder).toBeDefined();
      expect(props.defaultValue).toBeDefined();
    });
  });

  describe("Date field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(dateFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.description).toBeDefined();
      expect(props.required).toBeDefined();
      // Date should NOT have placeholder
      expect(props.placeholder).toBeUndefined();
    });
  });

  describe("Color field", () => {
    it("should serialize propertiesSchema to JSON Schema", () => {
      const jsonSchema = z.toJSONSchema(colorFieldDefinition.propertiesSchema);

      expect(jsonSchema.type).toBe("object");
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.defaultValue).toBeDefined();
    });

    it("should have string default value for color", () => {
      const jsonSchema = z.toJSONSchema(colorFieldDefinition.propertiesSchema) as JSONSchemaObject;
      expect(jsonSchema.properties?.defaultValue?.type).toBe("string");
    });
  });
});

describe("All default components have valid propertiesSchema", () => {
  it("should have all expected components", () => {
    expect(defaultComponents.length).toBeGreaterThan(0);
    expect(defaultComponents.map((c) => c.type)).toContain("text");
    expect(defaultComponents.map((c) => c.type)).toContain("email");
    expect(defaultComponents.map((c) => c.type)).toContain("number");
    expect(defaultComponents.map((c) => c.type)).toContain("checkbox");
    expect(defaultComponents.map((c) => c.type)).toContain("select");
    expect(defaultComponents.map((c) => c.type)).toContain("date");
  });

  it.each(defaultComponents.map((c) => [c.type, c]))(
    "component '%s' should have serializable propertiesSchema",
    (type, component) => {
      const jsonSchema = z.toJSONSchema(component.propertiesSchema);
      expect(jsonSchema.type).toBe("object");
      expect(jsonSchema.properties).toBeDefined();

      // All components should have label and required
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.label).toBeDefined();
      expect(props.required).toBeDefined();
    }
  );

  it.each(defaultComponents.map((c) => [c.type, c]))(
    "component '%s' should have valid defaultProps",
    (type, component) => {
      // Default props should pass validation
      // For select/radio, options is an array in defaultProps but a string in the schema
      const props: Record<string, unknown> = { ...component.defaultProps };
      if (Array.isArray(props.options)) {
        props.options = (props.options as string[]).join("\n");
      }
      
      const result = component.propertiesSchema.safeParse({
        ...props,
        label: props.label || "Test Label",
      });

      expect(result.success).toBe(true);
    }
  );
});

describe("toJSONSchema and fromJSONSchema functions", () => {
  it.each(defaultComponents.map((c) => [c.type, c]))(
    "component '%s' toJSONSchema should return valid JSON Schema property",
    (type, component) => {
      const props = {
        ...component.defaultProps,
        label: "Test Label",
        placeholder: "Test placeholder",
        description: "Test description",
        required: false,
      };

      const jsonSchemaProperty = component.toJSONSchema(props, false);

      expect(jsonSchemaProperty.type).toBeDefined();
      expect(jsonSchemaProperty.label).toBe("Test Label");
    }
  );

  it("text field toJSONSchema should include minLength/maxLength", () => {
    const props = {
      label: "Name",
      minLength: 3,
      maxLength: 50,
    };

    const jsonSchemaProperty = textFieldDefinition.toJSONSchema(props, false);

    expect(jsonSchemaProperty.type).toBe("string");
    expect(jsonSchemaProperty.minLength).toBe(3);
    expect(jsonSchemaProperty.maxLength).toBe(50);
  });

  it("number field toJSONSchema should include min/max", () => {
    const props = {
      label: "Age",
      min: 0,
      max: 120,
    };

    const jsonSchemaProperty = numberFieldDefinition.toJSONSchema(props, false);

    expect(jsonSchemaProperty.type).toBe("number");
    expect(jsonSchemaProperty.minimum).toBe(0);
    expect(jsonSchemaProperty.maximum).toBe(120);
  });

  it("select field toJSONSchema should include enum options", () => {
    const props = {
      label: "Role",
      options: ["admin", "user", "guest"],
    };

    const jsonSchemaProperty = selectFieldDefinition.toJSONSchema(props, false);

    expect(jsonSchemaProperty.type).toBe("string");
    expect(jsonSchemaProperty.enum).toEqual(["admin", "user", "guest"]);
  });

  it("date field toJSONSchema should have date-time format", () => {
    const props = {
      label: "Birth Date",
    };

    const jsonSchemaProperty = dateFieldDefinition.toJSONSchema(props, false);

    expect(jsonSchemaProperty.type).toBe("string");
    expect(jsonSchemaProperty.format).toBe("date-time");
    expect(jsonSchemaProperty.fieldType).toBe("date");
  });
});
