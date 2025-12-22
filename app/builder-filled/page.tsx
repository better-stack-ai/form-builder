"use client";

import { useState, useMemo } from "react";
import { FormBuilder, defaultComponents, type JSONSchema } from "@/components/ui/form-builder";
import { colorFieldDefinition, fileFieldDefinition, imageFieldDefinition } from "@/lib/custom-fields";
import { AutoFormColorPicker } from "@/components/ui/color-picker";
import { AutoFormFileUploader } from "@/components/ui/file-uploader";
import { AutoFormImageUploader } from "@/components/ui/image-uploader";
import { exampleJsonSchema, filledFormValues } from "@/lib/constants";

export default function BuilderFilledPage() {
  const [schemaEmpty, setSchemaEmpty] = useState<JSONSchema>(exampleJsonSchema);
  const [schemaFilled, setSchemaFilled] = useState<JSONSchema>(exampleJsonSchema);

  // Add custom field types to the palette
  const components = useMemo(() => [
    ...defaultComponents,
    colorFieldDefinition,
    fileFieldDefinition,
    imageFieldDefinition,
  ], []);

  // Map custom field types to their rendering components
  const fieldComponents = useMemo(() => ({
    color: AutoFormColorPicker,
    file: AutoFormFileUploader,
    image: AutoFormImageUploader,
  }), []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4 flex-1">
        {/* Empty Form */}
        <div className="flex flex-col border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 border-b">
            <h2 className="text-lg font-semibold">Empty Form (New)</h2>
            <p className="text-sm text-muted-foreground">Form with no pre-filled values</p>
          </div>
          <FormBuilder
            components={components}
            fieldComponents={fieldComponents}
            value={schemaEmpty}
            onChange={setSchemaEmpty}
            className="flex-1"
          />
        </div>

        {/* Filled Form - Edit State */}
        <div className="flex flex-col border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 border-b">
            <h2 className="text-lg font-semibold">Filled Form (Edit)</h2>
            <p className="text-sm text-muted-foreground">Form pre-filled with valid values</p>
          </div>
          <FormBuilder
            components={components}
            fieldComponents={fieldComponents}
            value={schemaFilled}
            onChange={setSchemaFilled}
            defaultValues={filledFormValues}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
