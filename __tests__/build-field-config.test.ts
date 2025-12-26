/**
 * Tests for buildFieldConfigFromJsonSchema
 * 
 * These tests verify that field configs are correctly built from JSON Schema,
 * including edge cases around nested objects with reserved property names.
 */

import { describe, it, expect } from "vitest";
import { buildFieldConfigFromJsonSchema } from "../components/ui/auto-form/utils";

describe("buildFieldConfigFromJsonSchema", () => {
  describe("basic field extraction", () => {
    it("should extract label from meta", () => {
      const schema = {
        properties: {
          name: { type: "string", label: "Full Name" },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      expect(config.name).toBeDefined();
      expect(config.name?.label).toBe("Full Name");
    });

    it("should extract label from JSON Schema title", () => {
      const schema = {
        properties: {
          name: { type: "string", title: "Full Name" },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      expect(config.name?.label).toBe("Full Name");
    });

    it("should extract description", () => {
      const schema = {
        properties: {
          email: { type: "string", description: "Your email address" },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      expect(config.email?.description).toBe("Your email address");
    });

    it("should extract order", () => {
      const schema = {
        properties: {
          first: { type: "string", order: 1 },
          second: { type: "string", order: 2 },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      expect(config.first?.order).toBe(1);
      expect(config.second?.order).toBe(2);
    });

    it("should extract inputProps including placeholder", () => {
      const schema = {
        properties: {
          name: { 
            type: "string", 
            placeholder: "Enter your name",
            inputProps: { maxLength: 100 },
          },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      expect(config.name?.inputProps?.placeholder).toBe("Enter your name");
      expect(config.name?.inputProps?.maxLength).toBe(100);
    });
  });

  describe("nested object handling", () => {
    it("should process nested object properties", () => {
      const schema = {
        properties: {
          address: {
            type: "object",
            label: "Address",
            description: "Your mailing address",
            properties: {
              street: { type: "string", label: "Street" },
              city: { type: "string", label: "City" },
            },
          },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      expect(config.address).toBeDefined();
      expect(config.address?.label).toBe("Address");
      expect(config.address?.description).toBe("Your mailing address");
      // Nested configs should be accessible
      expect((config.address as Record<string, unknown>).street).toBeDefined();
      expect((config.address as Record<string, unknown>).city).toBeDefined();
    });

    it("should NOT overwrite parent description when nested field is named 'description'", () => {
      // This is the bug that was fixed: a nested field named "description"
      // was overwriting the parent's description property
      const schema = {
        properties: {
          metadata: {
            type: "object",
            label: "Metadata",
            description: "Enter metadata information",  // This is help text for the parent
            properties: {
              // This is a nested field named "description" - a common field name
              description: { type: "string", label: "Description Field" },
              title: { type: "string", label: "Title" },
            },
          },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      // The parent's description should be preserved as the help text string
      expect(config.metadata?.description).toBe("Enter metadata information");
      // The nested "description" field's config should NOT be at this level
      // (it would be a type error if it was - description would be an object, not a string)
      expect(typeof config.metadata?.description).toBe("string");
      // Other nested fields should still be accessible
      expect((config.metadata as Record<string, unknown>).title).toBeDefined();
    });

    it("should NOT overwrite parent label when nested field is named 'label'", () => {
      const schema = {
        properties: {
          product: {
            type: "object",
            label: "Product Info",
            properties: {
              label: { type: "string", label: "Product Label" },
              price: { type: "number", label: "Price" },
            },
          },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      // The parent's label should be preserved
      expect(config.product?.label).toBe("Product Info");
      expect(typeof config.product?.label).toBe("string");
    });

    it("should NOT overwrite parent order when nested field is named 'order'", () => {
      const schema = {
        properties: {
          shipping: {
            type: "object",
            label: "Shipping",
            order: 5,
            properties: {
              order: { type: "string", label: "Order Number" },
              tracking: { type: "string", label: "Tracking" },
            },
          },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      // The parent's order should be preserved as a number
      expect(config.shipping?.order).toBe(5);
      expect(typeof config.shipping?.order).toBe("number");
    });

    it("should NOT overwrite parent inputProps when nested field is named 'inputProps'", () => {
      const schema = {
        properties: {
          form: {
            type: "object",
            label: "Form",
            inputProps: { className: "custom-class" },
            properties: {
              inputProps: { type: "string", label: "Input Props Field" },
              name: { type: "string", label: "Name" },
            },
          },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      // The parent's inputProps should be preserved as an object with className
      expect(config.form?.inputProps?.className).toBe("custom-class");
    });

    it("should NOT overwrite parent fieldType when nested field is named 'fieldType'", () => {
      const schema = {
        properties: {
          config: {
            type: "object",
            label: "Config",
            fieldType: "textarea",
            properties: {
              fieldType: { type: "string", label: "Field Type" },
              value: { type: "string", label: "Value" },
            },
          },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      // The parent's fieldType should be preserved
      expect(config.config?.fieldType).toBe("textarea");
      expect(typeof config.config?.fieldType).toBe("string");
    });

    it("should handle deeply nested objects", () => {
      const schema = {
        properties: {
          level1: {
            type: "object",
            description: "Level 1 description",
            properties: {
              level2: {
                type: "object",
                description: "Level 2 description",
                properties: {
                  description: { type: "string", label: "Nested Description" },
                  value: { type: "string" },
                },
              },
            },
          },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      // Level 1's description should be preserved
      expect(config.level1?.description).toBe("Level 1 description");
      // Level 2's description should also be preserved
      const level1 = config.level1 as Record<string, unknown>;
      const level2 = level1.level2 as Record<string, unknown>;
      expect(level2.description).toBe("Level 2 description");
    });
  });

  describe("date field detection", () => {
    it("should auto-detect date fields from JSON Schema format", () => {
      const schema = {
        properties: {
          createdAt: { type: "string", format: "date-time" },
        },
      };

      const config = buildFieldConfigFromJsonSchema(schema);

      expect(config.createdAt?.fieldType).toBe("date");
    });
  });
});

