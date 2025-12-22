/**
 * Multi-Step Form Tests
 *
 * Tests for step management functionality in the form builder.
 */

import { describe, it, expect } from "vitest";
import {
  fieldsToJSONSchema,
  jsonSchemaToFieldsAndSteps,
  createStep,
  generateStepId,
} from "../components/ui/form-builder/schema-utils";
import { defaultComponents } from "../components/ui/form-builder/components";
import type { FormBuilderField, FormStep, JSONSchema } from "../components/ui/form-builder/types";

describe("Step utilities", () => {
  describe("generateStepId", () => {
    it("should generate unique step IDs", () => {
      const id1 = generateStepId();
      const id2 = generateStepId();
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^step_\d+_\w+$/);
    });
  });

  describe("createStep", () => {
    it("should create step with default title", () => {
      const step = createStep(0);
      
      expect(step.id).toBeTruthy();
      expect(step.title).toBe("Step 1");
    });

    it("should create step with correct index-based title", () => {
      const step1 = createStep(0);
      const step2 = createStep(1);
      const step3 = createStep(2);
      
      expect(step1.title).toBe("Step 1");
      expect(step2.title).toBe("Step 2");
      expect(step3.title).toBe("Step 3");
    });
  });
});

describe("Schema serialization with steps", () => {
  const createTextField = (id: string, label: string, stepGroup?: number): FormBuilderField => ({
    id,
    type: "text",
    props: { label },
    ...(stepGroup !== undefined ? { stepGroup } : {}),
  });

  describe("fieldsToJSONSchema with steps", () => {
    it("should not include steps in schema when steps array is empty", () => {
      const fields: FormBuilderField[] = [
        createTextField("name", "Name"),
      ];
      
      const schema = fieldsToJSONSchema(fields, defaultComponents, []);
      
      expect(schema.steps).toBeUndefined();
      expect(schema.properties.name).toBeDefined();
    });

    it("should not include steps when only one step exists", () => {
      const steps: FormStep[] = [{ id: "step-1", title: "Step 1" }];
      const fields: FormBuilderField[] = [
        createTextField("name", "Name"),
      ];
      
      const schema = fieldsToJSONSchema(fields, defaultComponents, steps);
      
      expect(schema.steps).toBeUndefined();
    });

    it("should include steps in schema when multiple steps exist", () => {
      const steps: FormStep[] = [
        { id: "step-1", title: "Personal Info" },
        { id: "step-2", title: "Contact Details" },
      ];
      const fields: FormBuilderField[] = [
        createTextField("name", "Name", 0),
        createTextField("email", "Email", 1),
      ];
      
      const schema = fieldsToJSONSchema(fields, defaultComponents, steps);
      
      expect(schema.steps).toBeDefined();
      expect(schema.steps).toHaveLength(2);
      expect(schema.steps![0].title).toBe("Personal Info");
      expect(schema.steps![1].title).toBe("Contact Details");
    });

    it("should include stepGroup in field properties when multiple steps exist", () => {
      const steps: FormStep[] = [
        { id: "step-1", title: "Step 1" },
        { id: "step-2", title: "Step 2" },
      ];
      const fields: FormBuilderField[] = [
        createTextField("name", "Name", 0),
        createTextField("email", "Email", 1),
      ];
      
      const schema = fieldsToJSONSchema(fields, defaultComponents, steps);
      
      expect(schema.properties.name.stepGroup).toBe(0);
      expect(schema.properties.email.stepGroup).toBe(1);
    });

    it("should not include stepGroup in nested object fields", () => {
      const steps: FormStep[] = [
        { id: "step-1", title: "Step 1" },
        { id: "step-2", title: "Step 2" },
      ];
      const fields: FormBuilderField[] = [
        {
          id: "address",
          type: "object",
          props: { label: "Address" },
          stepGroup: 0,
          children: [
            createTextField("street", "Street"),
            createTextField("city", "City"),
          ],
        },
      ];
      
      const schema = fieldsToJSONSchema(fields, defaultComponents, steps);
      
      expect(schema.properties.address.stepGroup).toBe(0);
      // Nested fields should not have stepGroup
      expect(schema.properties.address.properties?.street.stepGroup).toBeUndefined();
      expect(schema.properties.address.properties?.city.stepGroup).toBeUndefined();
    });
  });

  describe("jsonSchemaToFieldsAndSteps", () => {
    it("should return empty arrays for null schema", () => {
      const result = jsonSchemaToFieldsAndSteps(null, defaultComponents);
      
      expect(result.fields).toEqual([]);
      expect(result.steps).toEqual([]);
    });

    it("should return empty steps array for schema without steps", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          name: { type: "string", label: "Name" },
        },
      };
      
      const result = jsonSchemaToFieldsAndSteps(schema, defaultComponents);
      
      expect(result.fields).toHaveLength(1);
      expect(result.steps).toEqual([]);
    });

    it("should extract steps from schema", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          name: { type: "string", label: "Name", stepGroup: 0 },
          email: { type: "string", label: "Email", format: "email", stepGroup: 1 },
        },
        steps: [
          { id: "step-1", title: "Personal Info" },
          { id: "step-2", title: "Contact Details" },
        ],
      };
      
      const result = jsonSchemaToFieldsAndSteps(schema, defaultComponents);
      
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].title).toBe("Personal Info");
      expect(result.steps[1].title).toBe("Contact Details");
    });

    it("should extract stepGroup from field properties", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          name: { type: "string", label: "Name", stepGroup: 0 },
          email: { type: "string", label: "Email", format: "email", stepGroup: 1 },
        },
        steps: [
          { id: "step-1", title: "Step 1" },
          { id: "step-2", title: "Step 2" },
        ],
      };
      
      const result = jsonSchemaToFieldsAndSteps(schema, defaultComponents);
      
      const nameField = result.fields.find(f => f.id === "name");
      const emailField = result.fields.find(f => f.id === "email");
      
      expect(nameField?.stepGroup).toBe(0);
      expect(emailField?.stepGroup).toBe(1);
    });

    it("should default stepGroup to undefined for fields without stepGroup", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          name: { type: "string", label: "Name" },
        },
      };
      
      const result = jsonSchemaToFieldsAndSteps(schema, defaultComponents);
      
      expect(result.fields[0].stepGroup).toBeUndefined();
    });
  });

  describe("roundtrip with steps", () => {
    it("should preserve steps through serialize/deserialize cycle", () => {
      const originalSteps: FormStep[] = [
        { id: "step-1", title: "Personal Information" },
        { id: "step-2", title: "Account Details" },
        { id: "step-3", title: "Preferences" },
      ];
      const originalFields: FormBuilderField[] = [
        createTextField("firstName", "First Name", 0),
        createTextField("lastName", "Last Name", 0),
        createTextField("email", "Email", 1),
        createTextField("password", "Password", 1),
        createTextField("theme", "Theme", 2),
      ];
      
      // Serialize
      const schema = fieldsToJSONSchema(originalFields, defaultComponents, originalSteps);
      
      // Deserialize
      const result = jsonSchemaToFieldsAndSteps(schema, defaultComponents);
      
      // Verify steps
      expect(result.steps).toHaveLength(3);
      expect(result.steps[0].title).toBe("Personal Information");
      expect(result.steps[1].title).toBe("Account Details");
      expect(result.steps[2].title).toBe("Preferences");
      
      // Verify fields and their stepGroups
      expect(result.fields).toHaveLength(5);
      
      const findField = (id: string) => result.fields.find(f => f.id === id);
      
      expect(findField("firstName")?.stepGroup).toBe(0);
      expect(findField("lastName")?.stepGroup).toBe(0);
      expect(findField("email")?.stepGroup).toBe(1);
      expect(findField("password")?.stepGroup).toBe(1);
      expect(findField("theme")?.stepGroup).toBe(2);
    });

    it("should handle schema without steps (backward compatibility)", () => {
      const originalFields: FormBuilderField[] = [
        createTextField("name", "Name"),
        createTextField("email", "Email"),
      ];
      
      // Serialize without steps
      const schema = fieldsToJSONSchema(originalFields, defaultComponents);
      
      // Deserialize
      const result = jsonSchemaToFieldsAndSteps(schema, defaultComponents);
      
      // Should work like before
      expect(result.steps).toEqual([]);
      expect(result.fields).toHaveLength(2);
      expect(result.fields[0].stepGroup).toBeUndefined();
      expect(result.fields[1].stepGroup).toBeUndefined();
    });
  });
});

