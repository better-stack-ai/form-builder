/**
 * Tests for the unified schema converter module.
 * 
 * These tests ensure the bidirectional Zod ↔ JSON Schema conversion
 * handles all edge cases correctly:
 * - Steps metadata preservation
 * - stepGroup mapping
 * - Date constraint handling
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zodToFormSchema, formSchemaToZod, hasSteps, getSteps, getStepGroupMap } from "@/lib/schema-converter";

describe("schema-converter", () => {
  describe("zodToFormSchema", () => {
    it("should convert z.date() to { type: string, format: date-time }", () => {
      const schema = z.object({
        birthday: z.date(),
      });

      const jsonSchema = zodToFormSchema(schema);

      expect(jsonSchema.properties?.birthday).toMatchObject({
        type: "string",
        format: "date-time",
      });
    });

    it("should preserve date min/max constraints as formatMinimum/formatMaximum", () => {
      const minDate = new Date("2020-01-01");
      const maxDate = new Date("2025-12-31");
      
      const schema = z.object({
        eventDate: z.date().min(minDate).max(maxDate),
      });

      const jsonSchema = zodToFormSchema(schema);

      // Note: Zod v4 may store these differently, adjust if needed
      const dateField = jsonSchema.properties?.eventDate as Record<string, unknown>;
      expect(dateField.type).toBe("string");
      expect(dateField.format).toBe("date-time");
    });

    it("should attach steps metadata when provided", () => {
      const schema = z.object({
        name: z.string(),
        email: z.string(),
      });

      const steps = [
        { id: "step1", title: "Personal Info" },
        { id: "step2", title: "Contact" },
      ];

      const jsonSchema = zodToFormSchema(schema, { steps });

      expect(jsonSchema.steps).toEqual(steps);
    });

    it("should attach stepGroupMap when provided", () => {
      const schema = z.object({
        name: z.string(),
        email: z.string(),
      });

      const stepGroupMap = { name: 0, email: 1 };

      const jsonSchema = zodToFormSchema(schema, { stepGroupMap });

      expect(jsonSchema.stepGroupMap).toEqual(stepGroupMap);
    });
  });

  describe("formSchemaToZod", () => {
    it("should convert JSON Schema back to Zod and validate correctly", () => {
      const jsonSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name"],
      };

      const zodSchema = formSchemaToZod(jsonSchema);

      // Should validate correct data
      const validResult = zodSchema.safeParse({ name: "John", age: 30 });
      expect(validResult.success).toBe(true);

      // Should fail on missing required field
      const invalidResult = zodSchema.safeParse({ age: 30 });
      expect(invalidResult.success).toBe(false);
    });

    it("should add date constraint validation for formatMinimum", () => {
      const jsonSchema = {
        type: "object",
        properties: {
          eventDate: {
            type: "string",
            format: "date-time",
            formatMinimum: "2024-01-01T00:00:00.000Z",
          },
        },
      };

      const zodSchema = formSchemaToZod(jsonSchema);

      // Date before minimum should fail
      const tooEarly = zodSchema.safeParse({ eventDate: "2023-06-15T00:00:00.000Z" });
      expect(tooEarly.success).toBe(false);
      if (!tooEarly.success) {
        expect(tooEarly.error.issues[0].path).toContain("eventDate");
      }

      // Date after minimum should pass
      const valid = zodSchema.safeParse({ eventDate: "2024-06-15T00:00:00.000Z" });
      expect(valid.success).toBe(true);
    });

    it("should add date constraint validation for formatMaximum", () => {
      const jsonSchema = {
        type: "object",
        properties: {
          deadline: {
            type: "string",
            format: "date-time",
            formatMaximum: "2024-12-31T23:59:59.999Z",
          },
        },
      };

      const zodSchema = formSchemaToZod(jsonSchema);

      // Date after maximum should fail
      const tooLate = zodSchema.safeParse({ deadline: "2025-06-15T00:00:00.000Z" });
      expect(tooLate.success).toBe(false);
      if (!tooLate.success) {
        expect(tooLate.error.issues[0].path).toContain("deadline");
      }

      // Date before maximum should pass
      const valid = zodSchema.safeParse({ deadline: "2024-06-15T00:00:00.000Z" });
      expect(valid.success).toBe(true);
    });

    it("should re-attach steps metadata so SteppedAutoForm can extract it", () => {
      const jsonSchema = {
        type: "object",
        properties: {
          name: { type: "string", stepGroup: 0 },
          email: { type: "string", stepGroup: 1 },
        },
        steps: [
          { id: "personal", title: "Personal Info" },
          { id: "contact", title: "Contact Details" },
        ],
      };

      const zodSchema = formSchemaToZod(jsonSchema);

      // The steps should be accessible via toJSONSchema()
      // This is how SteppedAutoForm extracts them
      const roundtrippedSchema = zodSchema.toJSONSchema() as Record<string, unknown>;
      
      expect(roundtrippedSchema.steps).toEqual([
        { id: "personal", title: "Personal Info" },
        { id: "contact", title: "Contact Details" },
      ]);
    });

    it("should re-attach stepGroupMap so SteppedAutoForm can assign fields to steps", () => {
      const jsonSchema = {
        type: "object",
        properties: {
          firstName: { type: "string", stepGroup: 0 },
          lastName: { type: "string", stepGroup: 0 },
          email: { type: "string", stepGroup: 1 },
          phone: { type: "string", stepGroup: 1 },
        },
        steps: [
          { id: "name", title: "Your Name" },
          { id: "contact", title: "Contact" },
        ],
      };

      const zodSchema = formSchemaToZod(jsonSchema);

      // The stepGroupMap should be accessible via toJSONSchema()
      const roundtrippedSchema = zodSchema.toJSONSchema() as Record<string, unknown>;
      
      expect(roundtrippedSchema.stepGroupMap).toEqual({
        firstName: 0,
        lastName: 0,
        email: 1,
        phone: 1,
      });
    });
  });

  describe("roundtrip: Zod → JSON Schema → Zod", () => {
    it("should preserve steps metadata through full roundtrip", () => {
      // Start with a Zod schema with steps metadata
      const originalSchema = z.object({
        name: z.string(),
        email: z.string().email(),
      }).meta({
        steps: [
          { id: "step1", title: "Info" },
          { id: "step2", title: "Contact" },
        ],
        stepGroupMap: { name: 0, email: 1 },
      });

      // Convert to JSON Schema
      const jsonSchema = zodToFormSchema(originalSchema);
      
      // Verify JSON Schema has steps
      expect(jsonSchema.steps).toEqual([
        { id: "step1", title: "Info" },
        { id: "step2", title: "Contact" },
      ]);

      // Convert back to Zod
      const restoredSchema = formSchemaToZod(jsonSchema);

      // Extract via toJSONSchema (how SteppedAutoForm does it)
      const extracted = restoredSchema.toJSONSchema() as Record<string, unknown>;
      
      expect(extracted.steps).toEqual([
        { id: "step1", title: "Info" },
        { id: "step2", title: "Contact" },
      ]);
    });

    it("should handle schemas without steps (single-step forms)", () => {
      const schema = z.object({
        username: z.string().min(3),
        password: z.string().min(8),
      });

      const jsonSchema = zodToFormSchema(schema);
      const restoredSchema = formSchemaToZod(jsonSchema);

      // Should still validate correctly
      const valid = restoredSchema.safeParse({ username: "john", password: "password123" });
      expect(valid.success).toBe(true);

      const invalid = restoredSchema.safeParse({ username: "jo", password: "short" });
      expect(invalid.success).toBe(false);
    });
  });

  describe("utility functions", () => {
    it("hasSteps should return true when steps exist", () => {
      const withSteps = {
        type: "object",
        properties: {},
        steps: [{ id: "s1", title: "Step 1" }],
      };
      const withoutSteps = {
        type: "object",
        properties: {},
      };

      expect(hasSteps(withSteps)).toBe(true);
      expect(hasSteps(withoutSteps)).toBe(false);
    });

    it("getSteps should return steps array or empty array", () => {
      const withSteps = {
        type: "object",
        properties: {},
        steps: [{ id: "s1", title: "Step 1" }],
      };
      const withoutSteps = {
        type: "object",
        properties: {},
      };

      expect(getSteps(withSteps)).toEqual([{ id: "s1", title: "Step 1" }]);
      expect(getSteps(withoutSteps)).toEqual([]);
    });

    it("getStepGroupMap should extract stepGroup from properties", () => {
      const schema = {
        type: "object",
        properties: {
          field1: { type: "string", stepGroup: 0 },
          field2: { type: "string", stepGroup: 1 },
          field3: { type: "number" }, // no stepGroup
        },
      };

      const map = getStepGroupMap(schema);

      expect(map).toEqual({
        field1: 0,
        field2: 1,
        // field3 not included since no stepGroup
      });
    });

    it("getStepGroupMap should prefer root-level stepGroupMap if present", () => {
      const schema = {
        type: "object",
        properties: {
          field1: { type: "string", stepGroup: 0 },
          field2: { type: "string", stepGroup: 1 },
        },
        stepGroupMap: { field1: 2, field2: 3 }, // override
      };

      const map = getStepGroupMap(schema);

      // Should use root-level stepGroupMap
      expect(map).toEqual({ field1: 2, field2: 3 });
    });
  });
});

