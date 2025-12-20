"use client";

import { useState } from "react";
import { FormBuilder, defaultComponents, type JSONSchema } from "@/components/ui/form-builder";

export default function BuilderPage() {
  const [schema, setSchema] = useState<JSONSchema>({
    type: "object",
    properties: {},
  });

  return (
    <div className="min-h-screen lg:h-screen flex flex-col">
      <FormBuilder
        components={defaultComponents}
        value={schema}
        onChange={setSchema}
        className="flex-1"
      />
    </div>
  );
}
