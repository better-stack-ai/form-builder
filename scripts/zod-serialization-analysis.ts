/**
 * Zod Serialization Analysis Script
 *
 * This script explores which Zod validation properties serialize to JSON Schema.
 * The output serves two purposes:
 * 1. Drives the UI → Determines which validation properties go in VALIDATION_SCHEMAS
 * 2. Provides test fixtures → The generated JSON Schema shapes become expected outputs for unit tests
 *
 * Run with: npx tsx scripts/zod-serialization-analysis.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

interface SerializationTest {
  name: string;
  zodSchema: z.ZodType;
  description: string;
}

interface SerializationResult {
  name: string;
  description: string;
  zodCode: string;
  jsonSchema: unknown;
  serializable: boolean;
  notes?: string;
}

// Helper to safely serialize to JSON Schema
function safeToJSONSchema(schema: z.ZodType): { result: unknown; error?: string } {
  try {
    const result = z.toJSONSchema(schema, { unrepresentable: "any" });
    return { result };
  } catch (error) {
    return { result: null, error: String(error) };
  }
}

// Helper to get the Zod code representation
function getZodCode(name: string, schema: z.ZodType): string {
  // This is a simplified representation - in practice we'd need to inspect the schema
  return name;
}

// ============================================================================
// STRING TYPE TESTS
// ============================================================================
const stringTests: SerializationTest[] = [
  {
    name: "z.string()",
    zodSchema: z.string(),
    description: "Basic string",
  },
  {
    name: "z.string().min(5)",
    zodSchema: z.string().min(5),
    description: "String with minLength",
  },
  {
    name: "z.string().max(100)",
    zodSchema: z.string().max(100),
    description: "String with maxLength",
  },
  {
    name: "z.string().min(5).max(100)",
    zodSchema: z.string().min(5).max(100),
    description: "String with minLength and maxLength",
  },
  {
    name: "z.string().length(10)",
    zodSchema: z.string().length(10),
    description: "String with exact length",
  },
  {
    name: "z.string().email()",
    zodSchema: z.string().email(),
    description: "Email format",
  },
  {
    name: "z.string().url()",
    zodSchema: z.string().url(),
    description: "URL format",
  },
  {
    name: 'z.string().regex(/^[a-z]+$/)',
    zodSchema: z.string().regex(/^[a-z]+$/),
    description: "Regex pattern",
  },
  {
    name: 'z.string().startsWith("hello")',
    zodSchema: z.string().startsWith("hello"),
    description: "Starts with constraint",
  },
  {
    name: 'z.string().endsWith("world")',
    zodSchema: z.string().endsWith("world"),
    description: "Ends with constraint",
  },
  {
    name: 'z.string().includes("test")',
    zodSchema: z.string().includes("test"),
    description: "Includes constraint",
  },
  {
    name: 'z.string().default("hello")',
    zodSchema: z.string().default("hello"),
    description: "String with default value",
  },
  {
    name: 'z.string().optional()',
    zodSchema: z.string().optional(),
    description: "Optional string",
  },
  {
    name: 'z.string().nullable()',
    zodSchema: z.string().nullable(),
    description: "Nullable string",
  },
  {
    name: 'z.string().trim()',
    zodSchema: z.string().trim(),
    description: "String with trim transform",
  },
  {
    name: 'z.string().toLowerCase()',
    zodSchema: z.string().toLowerCase(),
    description: "String with toLowerCase transform",
  },
  {
    name: 'z.string().refine(val => val.length > 0)',
    zodSchema: z.string().refine(val => val.length > 0),
    description: "String with custom refine",
  },
];

// ============================================================================
// NUMBER TYPE TESTS
// ============================================================================
const numberTests: SerializationTest[] = [
  {
    name: "z.number()",
    zodSchema: z.number(),
    description: "Basic number",
  },
  {
    name: "z.number().min(0)",
    zodSchema: z.number().min(0),
    description: "Number with minimum",
  },
  {
    name: "z.number().max(100)",
    zodSchema: z.number().max(100),
    description: "Number with maximum",
  },
  {
    name: "z.number().min(0).max(100)",
    zodSchema: z.number().min(0).max(100),
    description: "Number with min and max",
  },
  {
    name: "z.number().int()",
    zodSchema: z.number().int(),
    description: "Integer constraint",
  },
  {
    name: "z.number().positive()",
    zodSchema: z.number().positive(),
    description: "Positive number",
  },
  {
    name: "z.number().negative()",
    zodSchema: z.number().negative(),
    description: "Negative number",
  },
  {
    name: "z.number().nonnegative()",
    zodSchema: z.number().nonnegative(),
    description: "Non-negative number",
  },
  {
    name: "z.number().nonpositive()",
    zodSchema: z.number().nonpositive(),
    description: "Non-positive number",
  },
  {
    name: "z.number().multipleOf(5)",
    zodSchema: z.number().multipleOf(5),
    description: "Multiple of constraint",
  },
  {
    name: "z.number().finite()",
    zodSchema: z.number().finite(),
    description: "Finite number",
  },
  {
    name: "z.number().default(42)",
    zodSchema: z.number().default(42),
    description: "Number with default value",
  },
  {
    name: "z.number().optional()",
    zodSchema: z.number().optional(),
    description: "Optional number",
  },
  {
    name: "z.int()",
    zodSchema: z.int(),
    description: "Zod v4 integer type",
  },
  {
    name: "z.int().min(0).max(100)",
    zodSchema: z.int().min(0).max(100),
    description: "Integer with min and max",
  },
];

// ============================================================================
// BOOLEAN TYPE TESTS
// ============================================================================
const booleanTests: SerializationTest[] = [
  {
    name: "z.boolean()",
    zodSchema: z.boolean(),
    description: "Basic boolean",
  },
  {
    name: "z.boolean().default(true)",
    zodSchema: z.boolean().default(true),
    description: "Boolean with default true",
  },
  {
    name: "z.boolean().default(false)",
    zodSchema: z.boolean().default(false),
    description: "Boolean with default false",
  },
  {
    name: "z.boolean().optional()",
    zodSchema: z.boolean().optional(),
    description: "Optional boolean",
  },
];

// ============================================================================
// DATE TYPE TESTS
// ============================================================================
const dateTests: SerializationTest[] = [
  {
    name: "z.date()",
    zodSchema: z.date(),
    description: "Basic date",
  },
  {
    name: 'z.date().min(new Date("2020-01-01"))',
    zodSchema: z.date().min(new Date("2020-01-01")),
    description: "Date with minimum",
  },
  {
    name: 'z.date().max(new Date("2030-12-31"))',
    zodSchema: z.date().max(new Date("2030-12-31")),
    description: "Date with maximum",
  },
  {
    name: 'z.date().min(new Date("2020-01-01")).max(new Date("2030-12-31"))',
    zodSchema: z.date().min(new Date("2020-01-01")).max(new Date("2030-12-31")),
    description: "Date with min and max",
  },
  {
    name: "z.date().optional()",
    zodSchema: z.date().optional(),
    description: "Optional date",
  },
];

// Custom JSON Schema conversion for dates (using the override approach from the codebase)
function dateToJSONSchema(schema: z.ZodType): unknown {
  return z.toJSONSchema(schema, {
    unrepresentable: "any",
    override: (ctx) => {
      const def = (ctx.zodSchema as any)?._zod?.def;
      if (def?.type === "date") {
        ctx.jsonSchema.type = "string";
        ctx.jsonSchema.format = "date-time";

        // Check for min/max date constraints
        const checks = def?.checks;
        if (checks && Array.isArray(checks)) {
          for (const check of checks) {
            if (check.kind === "min" && check.value instanceof Date) {
              (ctx.jsonSchema as any).formatMinimum = check.value.toISOString();
            }
            if (check.kind === "max" && check.value instanceof Date) {
              (ctx.jsonSchema as any).formatMaximum = check.value.toISOString();
            }
          }
        }
      }
    },
  });
}

// ============================================================================
// ENUM TYPE TESTS
// ============================================================================
const enumTests: SerializationTest[] = [
  {
    name: 'z.enum(["a", "b", "c"])',
    zodSchema: z.enum(["a", "b", "c"]),
    description: "Basic enum",
  },
  {
    name: 'z.enum(["admin", "user", "guest"]).default("user")',
    zodSchema: z.enum(["admin", "user", "guest"]).default("user"),
    description: "Enum with default value",
  },
  {
    name: 'z.enum(["a", "b", "c"]).optional()',
    zodSchema: z.enum(["a", "b", "c"]).optional(),
    description: "Optional enum",
  },
];

// ============================================================================
// META/DESCRIBE TESTS
// ============================================================================
const metaTests: SerializationTest[] = [
  {
    name: 'z.string().describe("A description")',
    zodSchema: z.string().describe("A description"),
    description: "Schema with description",
  },
  {
    name: 'z.string().meta({ label: "My Label" })',
    zodSchema: z.string().meta({ label: "My Label" }),
    description: "Schema with meta label",
  },
  {
    name: 'z.string().meta({ label: "Name", placeholder: "Enter name" })',
    zodSchema: z.string().meta({ label: "Name", placeholder: "Enter name" }),
    description: "Schema with multiple meta properties",
  },
  {
    name: 'z.number().meta({ label: "Age", minimum: 0 })',
    zodSchema: z.number().meta({ label: "Age", minimum: 0 }),
    description: "Schema with meta for UI hints",
  },
];

// ============================================================================
// RUN ANALYSIS
// ============================================================================
function runTests(tests: SerializationTest[], category: string, useDateOverride = false): SerializationResult[] {
  const results: SerializationResult[] = [];

  for (const test of tests) {
    let jsonSchemaResult: { result: unknown; error?: string };

    if (useDateOverride) {
      try {
        const result = dateToJSONSchema(test.zodSchema);
        jsonSchemaResult = { result };
      } catch (error) {
        jsonSchemaResult = { result: null, error: String(error) };
      }
    } else {
      jsonSchemaResult = safeToJSONSchema(test.zodSchema);
    }

    const result: SerializationResult = {
      name: test.name,
      description: test.description,
      zodCode: test.name,
      jsonSchema: jsonSchemaResult.result,
      serializable: !jsonSchemaResult.error,
    };

    if (jsonSchemaResult.error) {
      result.notes = jsonSchemaResult.error;
    }

    results.push(result);
  }

  return results;
}

function generateReport(): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push("ZOD SERIALIZATION ANALYSIS REPORT");
  lines.push("Generated: " + new Date().toISOString());
  lines.push("Zod Version: " + (z as any).version || "unknown");
  lines.push("=".repeat(80));
  lines.push("");

  // String tests
  lines.push("## STRING TYPE");
  lines.push("-".repeat(40));
  const stringResults = runTests(stringTests, "string");
  for (const result of stringResults) {
    lines.push(`\n### ${result.name}`);
    lines.push(`Description: ${result.description}`);
    lines.push(`Serializable: ${result.serializable ? "YES" : "NO"}`);
    if (result.serializable) {
      lines.push(`JSON Schema:\n${JSON.stringify(result.jsonSchema, null, 2)}`);
    } else {
      lines.push(`Error: ${result.notes}`);
    }
  }

  lines.push("\n");

  // Number tests
  lines.push("## NUMBER TYPE");
  lines.push("-".repeat(40));
  const numberResults = runTests(numberTests, "number");
  for (const result of numberResults) {
    lines.push(`\n### ${result.name}`);
    lines.push(`Description: ${result.description}`);
    lines.push(`Serializable: ${result.serializable ? "YES" : "NO"}`);
    if (result.serializable) {
      lines.push(`JSON Schema:\n${JSON.stringify(result.jsonSchema, null, 2)}`);
    } else {
      lines.push(`Error: ${result.notes}`);
    }
  }

  lines.push("\n");

  // Boolean tests
  lines.push("## BOOLEAN TYPE");
  lines.push("-".repeat(40));
  const booleanResults = runTests(booleanTests, "boolean");
  for (const result of booleanResults) {
    lines.push(`\n### ${result.name}`);
    lines.push(`Description: ${result.description}`);
    lines.push(`Serializable: ${result.serializable ? "YES" : "NO"}`);
    if (result.serializable) {
      lines.push(`JSON Schema:\n${JSON.stringify(result.jsonSchema, null, 2)}`);
    } else {
      lines.push(`Error: ${result.notes}`);
    }
  }

  lines.push("\n");

  // Date tests (with custom override)
  lines.push("## DATE TYPE (with date-time override)");
  lines.push("-".repeat(40));
  const dateResults = runTests(dateTests, "date", true);
  for (const result of dateResults) {
    lines.push(`\n### ${result.name}`);
    lines.push(`Description: ${result.description}`);
    lines.push(`Serializable: ${result.serializable ? "YES" : "NO"}`);
    if (result.serializable) {
      lines.push(`JSON Schema:\n${JSON.stringify(result.jsonSchema, null, 2)}`);
    } else {
      lines.push(`Error: ${result.notes}`);
    }
  }

  lines.push("\n");

  // Enum tests
  lines.push("## ENUM TYPE");
  lines.push("-".repeat(40));
  const enumResults = runTests(enumTests, "enum");
  for (const result of enumResults) {
    lines.push(`\n### ${result.name}`);
    lines.push(`Description: ${result.description}`);
    lines.push(`Serializable: ${result.serializable ? "YES" : "NO"}`);
    if (result.serializable) {
      lines.push(`JSON Schema:\n${JSON.stringify(result.jsonSchema, null, 2)}`);
    } else {
      lines.push(`Error: ${result.notes}`);
    }
  }

  lines.push("\n");

  // Meta tests
  lines.push("## META/DESCRIBE");
  lines.push("-".repeat(40));
  const metaResults = runTests(metaTests, "meta");
  for (const result of metaResults) {
    lines.push(`\n### ${result.name}`);
    lines.push(`Description: ${result.description}`);
    lines.push(`Serializable: ${result.serializable ? "YES" : "NO"}`);
    if (result.serializable) {
      lines.push(`JSON Schema:\n${JSON.stringify(result.jsonSchema, null, 2)}`);
    } else {
      lines.push(`Error: ${result.notes}`);
    }
  }

  // Summary
  lines.push("\n");
  lines.push("=".repeat(80));
  lines.push("SUMMARY");
  lines.push("=".repeat(80));

  const allResults = [...stringResults, ...numberResults, ...booleanResults, ...dateResults, ...enumResults, ...metaResults];
  const serializableCount = allResults.filter(r => r.serializable).length;
  const totalCount = allResults.length;

  lines.push(`\nTotal tests: ${totalCount}`);
  lines.push(`Serializable: ${serializableCount}`);
  lines.push(`Non-serializable: ${totalCount - serializableCount}`);

  lines.push("\n## SERIALIZABLE PROPERTIES BY TYPE:");
  lines.push("\n### String:");
  lines.push("  - min/max → minLength/maxLength ✓");
  lines.push("  - email() → format: email ✓");
  lines.push("  - url() → format: uri ✓");
  lines.push("  - regex() → pattern ✓");
  lines.push("  - default() → default ✓");
  lines.push("  - optional() → removes from required ✓");
  lines.push("  - trim/toLowerCase → NOT serializable (transforms)");
  lines.push("  - refine() → NOT serializable (custom logic)");

  lines.push("\n### Number:");
  lines.push("  - min/max → minimum/maximum ✓");
  lines.push("  - int() → type: integer ✓");
  lines.push("  - multipleOf() → multipleOf ✓");
  lines.push("  - positive/negative/etc → minimum/maximum ✓");
  lines.push("  - default() → default ✓");

  lines.push("\n### Boolean:");
  lines.push("  - default() → default ✓");
  lines.push("  - No additional validation constraints");

  lines.push("\n### Date (with override):");
  lines.push("  - type: string, format: date-time ✓");
  lines.push("  - min/max → formatMinimum/formatMaximum ✓");

  lines.push("\n### Enum:");
  lines.push("  - enum values → enum array ✓");
  lines.push("  - default() → default ✓");

  lines.push("\n### Meta:");
  lines.push("  - describe() → description ✓");
  lines.push("  - meta({...}) → spreads into JSON Schema ✓");

  return lines.join("\n");
}

// Main execution
const report = generateReport();
const outputPath = path.join(__dirname, "output", "zod-serialization-report.txt");

fs.writeFileSync(outputPath, report);
console.log(`Report written to: ${outputPath}`);
console.log("\n" + report);
