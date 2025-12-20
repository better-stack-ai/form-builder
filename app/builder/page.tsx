"use client";

import { useState, useMemo } from "react";
import { FormBuilder, defaultComponents, colorFieldDefinition, type JSONSchema } from "@/components/ui/form-builder";
import { AutoFormColorPicker } from "@/components/ui/color-picker";

export default function BuilderPage() {
  const [schema, setSchema] = useState<JSONSchema>({
    type: "object",
    properties: {},
  });

  // Add color picker as a custom palette item
  const components = useMemo(() => [
    ...defaultComponents,
    colorFieldDefinition,
  ], []);

  // Map custom field types to their rendering components
  const fieldComponents = useMemo(() => ({
    color: AutoFormColorPicker,
  }), []);

  return (
    <div className="min-h-screen lg:h-screen flex flex-col">
      <FormBuilder
        components={components}
        fieldComponents={fieldComponents}
        value={schema}
        onChange={setSchema}
        className="flex-1"
      />
    </div>
  );
}
