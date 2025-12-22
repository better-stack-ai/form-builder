"use client";

import { useState, useMemo } from "react";
import { FormBuilder, defaultComponents, type JSONSchema } from "@/components/ui/form-builder";
import { colorFieldDefinition, fileFieldDefinition, imageFieldDefinition } from "@/lib/custom-fields";
import { AutoFormColorPicker } from "@/components/ui/color-picker";
import { AutoFormFileUploader } from "@/components/ui/file-uploader";
import { AutoFormImageUploader } from "@/components/ui/image-uploader";

export default function BuilderPage() {
  const [schema, setSchema] = useState<JSONSchema>({
    type: "object",
    properties: {},
  });

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
