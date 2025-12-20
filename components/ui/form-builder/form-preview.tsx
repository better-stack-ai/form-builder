"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { buildFieldConfigFromJsonSchema } from "@/components/ui/auto-form/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JSONSchema } from "./types";
import { AutoFormColorPicker } from "@/components/ui/color-picker";
import type { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";

/**
 * Custom field components for the form preview.
 * 
 * This demonstrates how to integrate custom components (like the ColorPicker)
 * with the auto-form system. The key ("color") matches the fieldType in the
 * JSON Schema, and the value is the React component that renders the field.
 */
const customFieldComponents: Record<string, React.ComponentType<AutoFormInputComponentProps>> = {
  color: AutoFormColorPicker,
};

interface FormPreviewProps {
  schema: JSONSchema;
  className?: string;
}

export function FormPreview({ schema, className }: FormPreviewProps) {
  const [submittedValues, setSubmittedValues] = useState<Record<string, unknown> | null>(null);

  // Create Zod schema from JSON Schema
  const zodSchema = useMemo(() => {
    try {
      if (!schema.properties || Object.keys(schema.properties).length === 0) {
        return null;
      }
      return z.fromJSONSchema(schema as unknown as z.core.JSONSchema.JSONSchema);
    } catch (error) {
      console.error("Failed to parse JSON Schema:", error);
      return null;
    }
  }, [schema]);

  // Build field config from JSON Schema with custom components
  const fieldConfig = useMemo(() => {
    try {
      return buildFieldConfigFromJsonSchema(
        schema as unknown as Record<string, unknown>,
        undefined, // storedFieldConfig
        undefined, // uploadImage
        customFieldComponents
      );
    } catch (error) {
      console.error("Failed to build field config:", error);
      return {};
    }
  }, [schema]);

  const handleSubmit = (values: unknown) => {
    setSubmittedValues(values as Record<string, unknown>);
  };

  const handleReset = () => {
    setSubmittedValues(null);
  };

  if (!zodSchema) {
    return (
      <div className={cn("p-8 text-center text-muted-foreground", className)}>
        <p className="text-lg font-medium mb-2">No fields to preview</p>
        <p className="text-sm">Add some fields to your form to see a preview</p>
      </div>
    );
  }

  return (
    <div className={cn("p-4 md:p-6", className)}>
      <div className="max-w-2xl mx-auto">
        {submittedValues ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Submitted Values</h3>
              <Button variant="outline" onClick={handleReset}>
                Try Again
              </Button>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <pre className="text-sm overflow-auto whitespace-pre-wrap">
                {JSON.stringify(submittedValues, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Form Preview</h3>
              <p className="text-sm text-muted-foreground">
                Test your form and see the submitted values
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <AutoForm
                formSchema={zodSchema}
                onSubmit={handleSubmit}
                fieldConfig={fieldConfig}
              >
                <AutoFormSubmit className="w-full mt-4">
                  Submit
                </AutoFormSubmit>
              </AutoForm>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
