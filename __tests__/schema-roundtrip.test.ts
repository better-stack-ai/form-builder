/**
 * Schema Roundtrip Tests
 *
 * Tests that Zod schemas serialize to JSON Schema correctly and can be
 * reconstructed back. Uses fixtures from the serialization analysis script.
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// Type for JSON Schema property used in tests
type JSONSchemaProperty = {
  type?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  format?: string;
  [key: string]: unknown;
};

describe("Zod to JSON Schema serialization", () => {
  describe("String type", () => {
    it("should serialize basic string", () => {
      const schema = z.string();
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
    });

    it("should serialize string with minLength", () => {
      const schema = z.string().min(5);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.minLength).toBe(5);
    });

    it("should serialize string with maxLength", () => {
      const schema = z.string().max(100);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.maxLength).toBe(100);
    });

    it("should serialize string with minLength and maxLength", () => {
      const schema = z.string().min(5).max(100);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.minLength).toBe(5);
      expect(jsonSchema.maxLength).toBe(100);
    });

    it("should serialize email format", () => {
      const schema = z.string().email();
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.format).toBe("email");
    });

    it("should serialize url format", () => {
      const schema = z.string().url();
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.format).toBe("uri");
    });

    it("should serialize regex as pattern", () => {
      const schema = z.string().regex(/^[a-z]+$/);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.pattern).toBe("^[a-z]+$");
    });

    it("should serialize string with default value", () => {
      const schema = z.string().default("hello");
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.default).toBe("hello");
    });

    it("should serialize string with meta (label)", () => {
      const schema = z.string().meta({ label: "My Label" });
      const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.label).toBe("My Label");
    });

    it("should serialize string with description", () => {
      const schema = z.string().describe("A description");
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.description).toBe("A description");
    });
  });

  describe("Number type", () => {
    it("should serialize basic number", () => {
      const schema = z.number();
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("number");
    });

    it("should serialize number with minimum", () => {
      const schema = z.number().min(0);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("number");
      expect(jsonSchema.minimum).toBe(0);
    });

    it("should serialize number with maximum", () => {
      const schema = z.number().max(100);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("number");
      expect(jsonSchema.maximum).toBe(100);
    });

    it("should serialize number with min and max", () => {
      const schema = z.number().min(0).max(100);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("number");
      expect(jsonSchema.minimum).toBe(0);
      expect(jsonSchema.maximum).toBe(100);
    });

    it("should serialize integer", () => {
      const schema = z.number().int();
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("integer");
    });

    it("should serialize positive number", () => {
      const schema = z.number().positive();
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("number");
      expect(jsonSchema.exclusiveMinimum).toBe(0);
    });

    it("should serialize multipleOf", () => {
      const schema = z.number().multipleOf(5);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("number");
      expect(jsonSchema.multipleOf).toBe(5);
    });

    it("should serialize number with default value", () => {
      const schema = z.number().default(42);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("number");
      expect(jsonSchema.default).toBe(42);
    });
  });

  describe("Boolean type", () => {
    it("should serialize basic boolean", () => {
      const schema = z.boolean();
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("boolean");
    });

    it("should serialize boolean with default true", () => {
      const schema = z.boolean().default(true);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("boolean");
      expect(jsonSchema.default).toBe(true);
    });

    it("should serialize boolean with default false", () => {
      const schema = z.boolean().default(false);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("boolean");
      expect(jsonSchema.default).toBe(false);
    });
  });

  describe("Enum type", () => {
    it("should serialize basic enum", () => {
      const schema = z.enum(["a", "b", "c"]);
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.enum).toEqual(["a", "b", "c"]);
    });

    it("should serialize enum with default value", () => {
      const schema = z.enum(["admin", "user", "guest"]).default("user");
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.enum).toEqual(["admin", "user", "guest"]);
      expect(jsonSchema.default).toBe("user");
    });
  });

  describe("Date type (with override)", () => {
    // Helper to convert dates with our override
    function dateToJSONSchema(schema: z.ZodType): Record<string, unknown> {
      return z.toJSONSchema(schema, {
        unrepresentable: "any",
        override: (ctx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- accessing Zod internal structure
          const def = (ctx.zodSchema as any)?._zod?.def;
          if (def?.type === "date") {
            ctx.jsonSchema.type = "string";
            ctx.jsonSchema.format = "date-time";
          }
        },
      }) as Record<string, unknown>;
    }

    it("should serialize date as string with date-time format", () => {
      const schema = z.date();
      const jsonSchema = dateToJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.format).toBe("date-time");
    });

    it("should serialize optional date", () => {
      const schema = z.date().optional();
      const jsonSchema = dateToJSONSchema(schema);

      expect(jsonSchema.type).toBe("string");
      expect(jsonSchema.format).toBe("date-time");
    });
  });

  describe("Object schema", () => {
    it("should serialize object with multiple fields", () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0).max(120),
        email: z.string().email(),
      });
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.type).toBe("object");
      expect(jsonSchema.properties).toBeDefined();
      const props = jsonSchema.properties as Record<string, JSONSchemaProperty>;
      expect(props.name.type).toBe("string");
      expect(props.name.minLength).toBe(1);
      expect(props.age.type).toBe("number");
      expect(props.age.minimum).toBe(0);
      expect(props.age.maximum).toBe(120);
      expect(props.email.format).toBe("email");
    });

    it("should serialize required fields", () => {
      const schema = z.object({
        name: z.string(),
        nickname: z.string().optional(),
      });
      const jsonSchema = z.toJSONSchema(schema);

      expect(jsonSchema.required).toContain("name");
      expect(jsonSchema.required).not.toContain("nickname");
    });

    it("should preserve meta properties in object fields", () => {
      const schema = z.object({
        name: z.string().meta({ label: "Full Name", placeholder: "John Doe" }),
        age: z.number().meta({ label: "Age", minimum: 0 }),
      });
      const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;
      const properties = jsonSchema.properties as Record<string, JSONSchemaProperty>;

      expect(properties.name.label).toBe("Full Name");
      expect(properties.name.placeholder).toBe("John Doe");
      expect(properties.age.label).toBe("Age");
    });
  });
});

describe("JSON Schema to Zod (fromJSONSchema)", () => {
  it("should parse basic string schema", () => {
    const jsonSchema = {
      type: "object" as const,
      properties: {
        name: { type: "string" as const },
      },
    };
    const schema = z.fromJSONSchema(jsonSchema);
    
    // Test that it parses correctly
    const result = schema.safeParse({ name: "John" });
    expect(result.success).toBe(true);
  });

  it("should parse string with minLength", () => {
    const jsonSchema = {
      type: "object" as const,
      properties: {
        name: { type: "string" as const, minLength: 3 },
      },
    };
    const schema = z.fromJSONSchema(jsonSchema);
    
    const valid = schema.safeParse({ name: "John" });
    expect(valid.success).toBe(true);

    const invalid = schema.safeParse({ name: "Jo" });
    expect(invalid.success).toBe(false);
  });

  it("should parse number with min/max", () => {
    const jsonSchema = {
      type: "object" as const,
      properties: {
        age: { type: "number" as const, minimum: 0, maximum: 120 },
      },
    };
    const schema = z.fromJSONSchema(jsonSchema);
    
    const valid = schema.safeParse({ age: 25 });
    expect(valid.success).toBe(true);

    const tooLow = schema.safeParse({ age: -1 });
    expect(tooLow.success).toBe(false);

    const tooHigh = schema.safeParse({ age: 150 });
    expect(tooHigh.success).toBe(false);
  });

  it("should parse enum", () => {
    const jsonSchema = {
      type: "object" as const,
      properties: {
        role: { type: "string" as const, enum: ["admin", "user", "guest"] },
      },
    };
    const schema = z.fromJSONSchema(jsonSchema);
    
    const valid = schema.safeParse({ role: "admin" });
    expect(valid.success).toBe(true);

    const invalid = schema.safeParse({ role: "superuser" });
    expect(invalid.success).toBe(false);
  });

  it("should parse required fields", () => {
    const jsonSchema = {
      type: "object" as const,
      properties: {
        name: { type: "string" as const },
        nickname: { type: "string" as const },
      },
      required: ["name"],
    };
    const schema = z.fromJSONSchema(jsonSchema);
    
    const withBoth = schema.safeParse({ name: "John", nickname: "Johnny" });
    expect(withBoth.success).toBe(true);

    const withoutNickname = schema.safeParse({ name: "John" });
    expect(withoutNickname.success).toBe(true);

    const withoutName = schema.safeParse({ nickname: "Johnny" });
    expect(withoutName.success).toBe(false);
  });
});

describe("Roundtrip: Zod -> JSON Schema -> Zod", () => {
  it("should roundtrip a simple object schema", () => {
    const originalSchema = z.object({
      name: z.string().min(1),
      age: z.number().min(0),
    });

    // Convert to JSON Schema
    const jsonSchema = z.toJSONSchema(originalSchema);

    // Convert back to Zod
    const rebuiltSchema = z.fromJSONSchema(jsonSchema);

    // Test that validation still works
    const valid = rebuiltSchema.safeParse({ name: "John", age: 25 });
    expect(valid.success).toBe(true);

    const invalidName = rebuiltSchema.safeParse({ name: "", age: 25 });
    expect(invalidName.success).toBe(false);

    const invalidAge = rebuiltSchema.safeParse({ name: "John", age: -1 });
    expect(invalidAge.success).toBe(false);
  });

  it("should roundtrip an enum schema", () => {
    const originalSchema = z.object({
      role: z.enum(["admin", "user", "guest"]),
    });

    const jsonSchema = z.toJSONSchema(originalSchema);
    const rebuiltSchema = z.fromJSONSchema(jsonSchema);

    const valid = rebuiltSchema.safeParse({ role: "admin" });
    expect(valid.success).toBe(true);

    const invalid = rebuiltSchema.safeParse({ role: "superuser" });
    expect(invalid.success).toBe(false);
  });

  it("should roundtrip a complex form schema", () => {
    const originalSchema = z.object({
      username: z.string().min(3).max(20),
      email: z.string().email(),
      age: z.number().min(18).max(120).optional(),
      role: z.enum(["user", "admin"]).default("user"),
      acceptTerms: z.boolean(),
    });

    const jsonSchema = z.toJSONSchema(originalSchema);
    const rebuiltSchema = z.fromJSONSchema(jsonSchema);

    const valid = rebuiltSchema.safeParse({
      username: "johndoe",
      email: "john@example.com",
      age: 25,
      role: "user",
      acceptTerms: true,
    });
    expect(valid.success).toBe(true);

    const invalidEmail = rebuiltSchema.safeParse({
      username: "johndoe",
      email: "not-an-email",
      acceptTerms: true,
    });
    expect(invalidEmail.success).toBe(false);
  });
});
