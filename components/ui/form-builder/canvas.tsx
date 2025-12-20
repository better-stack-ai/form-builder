"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { SortableField } from "./sortable-field";
import type { FormBuilderField, FormBuilderComponentDefinition } from "./types";

interface DropZoneProps {
  id: string;
  isDraggingFromPalette: boolean;
}

function DropZone({ id, isDraggingFromPalette }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  if (!isDraggingFromPalette) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-2 rounded-full transition-all duration-200",
        isOver
          ? "h-3 bg-primary animate-pulse"
          : "bg-muted-foreground/20"
      )}
    />
  );
}

interface CanvasProps {
  fields: FormBuilderField[];
  components: FormBuilderComponentDefinition[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onEditField: (id: string) => void;
  onDeleteField: (id: string) => void;
  isDraggingFromPalette: boolean;
  className?: string;
}

export function Canvas({
  fields,
  components,
  selectedFieldId,
  onSelectField,
  onEditField,
  onDeleteField,
  isDraggingFromPalette,
  className,
}: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  const getComponent = (type: string) =>
    components.find((c) => c.type === type);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 p-4 rounded-lg border-2 border-dashed min-h-[400px] transition-colors",
        isOver && isDraggingFromPalette
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20",
        className
      )}
      onClick={() => onSelectField(null)}
    >
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p className="text-lg font-medium">Drop components here</p>
          <p className="text-sm">
            Drag components from the palette to build your form
          </p>
        </div>
      ) : (
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {/* Drop zone at the beginning */}
            <DropZone id="drop-zone-start" isDraggingFromPalette={isDraggingFromPalette} />
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-2">
                <SortableField
                  field={field}
                  index={index}
                  component={getComponent(field.type)}
                  isSelected={field.id === selectedFieldId}
                  onSelect={() => onSelectField(field.id)}
                  onEdit={() => onEditField(field.id)}
                  onDelete={() => onDeleteField(field.id)}
                />
                {/* Drop zone after each field */}
                <DropZone id={`drop-zone-${field.id}`} isDraggingFromPalette={isDraggingFromPalette} />
              </div>
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
