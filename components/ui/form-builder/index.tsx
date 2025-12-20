"use client";

import { useCallback, useId, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Palette, PaletteDragOverlay } from "./palette";
import { Canvas } from "./canvas";
import { EditFieldDialog } from "./edit-field-dialog";
import { FormPreview } from "./form-preview";
import { FieldDragOverlay } from "./sortable-field";
import { defaultComponents, getComponentByType } from "./components";
import { fieldsToJSONSchema, jsonSchemaToFields, generateFieldId } from "./schema-utils";
import type {
  FormBuilderComponentDefinition,
  FormBuilderField,
  FormBuilderFieldProps,
  JSONSchema,
  DragData,
  PaletteDragData,
} from "./types";
import type { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";

// Re-export types and components for external use
export { defaultComponents, colorFieldDefinition } from "./components";
export type {
  FormBuilderComponentDefinition,
  FormBuilderField,
  FormBuilderFieldProps,
  JSONSchema,
} from "./types";

interface FormBuilderProps {
  /** Available components to use in the form builder */
  components?: FormBuilderComponentDefinition[];
  /** Current form schema (JSON Schema format) */
  value?: JSONSchema;
  /** Callback when form schema changes */
  onChange?: (schema: JSONSchema) => void;
  /** Additional CSS classes */
  className?: string;
  /** 
   * Custom field components for the form preview.
   * Maps fieldType names to React components that render the field.
   * These are merged with the default custom components (like color picker).
   * 
   * @example
   * ```tsx
   * <FormBuilder
   *   fieldComponents={{
   *     rating: RatingComponent,
   *     signature: SignatureComponent,
   *   }}
   * />
   * ```
   */
  fieldComponents?: Record<string, React.ComponentType<AutoFormInputComponentProps>>;
  /**
   * Default values to pre-populate the form preview with.
   * Useful for edit scenarios where the form should start with existing data.
   * 
   * @example
   * ```tsx
   * <FormBuilder
   *   defaultValues={{
   *     username: "johndoe",
   *     email: "john@example.com",
   *   }}
   * />
   * ```
   */
  defaultValues?: Record<string, unknown>;
}

export function FormBuilder({
  components = defaultComponents,
  value,
  onChange,
  className,
  fieldComponents,
  defaultValues,
}: FormBuilderProps) {
  // Stable ID for DndContext to prevent hydration mismatch
  const dndContextId = useId();
  
  // Internal state - initialized from value prop if provided
  // Note: To reset fields from parent, use a key prop on FormBuilder
  const [fields, setFields] = useState<FormBuilderField[]>(() =>
    value ? jsonSchemaToFields(value, components) : []
  );
  const [editDialogFieldId, setEditDialogFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Notify onChange when fields change
  const notifyChange = useCallback(
    (newFields: FormBuilderField[]) => {
      if (onChange) {
        const schema = fieldsToJSONSchema(newFields, components);
        onChange(schema);
      }
    },
    [onChange, components]
  );

  // Get current JSON Schema for preview
  const currentSchema = useMemo(
    () => fieldsToJSONSchema(fields, components),
    [fields, components]
  );

  // Sensors for dnd-kit with touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        // Use distance instead of delay for better compatibility with
        // automated testing tools and faster touch interactions
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Determine what's being dragged
  const activeDragData = useMemo(() => {
    if (!activeId) return null;

    const idStr = String(activeId);

    // Check if it's a palette item
    if (idStr.startsWith("palette-")) {
      const componentType = idStr.replace("palette-", "");
      return {
        type: "palette",
        componentType,
        component: getComponentByType(componentType, components),
      };
    }

    // Otherwise it's a field
    const field = fields.find((f) => f.id === idStr);
    if (field) {
      return {
        type: "field",
        field,
        component: getComponentByType(field.type, components),
      };
    }

    return null;
  }, [activeId, fields, components]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current as DragData | undefined;

    // Handle palette item drop
    if (activeData?.type === "palette") {
      const { componentType } = activeData as PaletteDragData;
      const component = getComponentByType(componentType, components);

      if (component) {
        const newField: FormBuilderField = {
          id: generateFieldId(componentType),
          type: componentType,
          props: {
            label: component.defaultProps.label || component.label,
            ...component.defaultProps,
          },
        };

        // Determine insertion index based on where item was dropped
        let insertIndex = fields.length;
        const overId = String(over.id);
        
        if (overId === "drop-zone-start") {
          // Dropped at the beginning
          insertIndex = 0;
        } else if (overId.startsWith("drop-zone-")) {
          // Dropped after a specific field
          const fieldId = overId.replace("drop-zone-", "");
          const overIndex = fields.findIndex((f) => f.id === fieldId);
          if (overIndex !== -1) {
            insertIndex = overIndex + 1;
          }
        } else if (overId !== "canvas") {
          // Dropped directly on a field
          const overIndex = fields.findIndex((f) => f.id === overId);
          if (overIndex !== -1) {
            insertIndex = overIndex + 1;
          }
        }

        const newFields = [...fields];
        newFields.splice(insertIndex, 0, newField);
        setFields(newFields);
        notifyChange(newFields);
      }
      return;
    }

    // Handle field reorder
    if (activeData?.type === "field" && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(fields, oldIndex, newIndex);
        setFields(newFields);
        notifyChange(newFields);
      }
    }
  };

  // Update field props (with optional ID change)
  const handleUpdateField = useCallback(
    (id: string, props: Partial<FormBuilderFieldProps>, newId?: string) => {
      const newFields = fields.map((f) =>
        f.id === id
          ? { ...f, id: newId || f.id, props: { ...f.props, ...props } }
          : f
      );
      setFields(newFields);
      notifyChange(newFields);
    },
    [fields, notifyChange]
  );

  // Open edit dialog for a field
  const handleEditField = useCallback((id: string) => {
    setEditDialogFieldId(id);
  }, []);

  // Delete field
  const handleDeleteField = useCallback(
    (id: string) => {
      const newFields = fields.filter((f) => f.id !== id);
      setFields(newFields);
      notifyChange(newFields);
    },
    [fields, notifyChange]
  );

  // Get edit dialog field and its component
  const editDialogField = fields.find((f) => f.id === editDialogFieldId) || null;
  const editDialogComponent = editDialogField
    ? getComponentByType(editDialogField.type, components) || null
    : null;

  return (
    <div className={cn("flex flex-col lg:h-full", className)}>
      <DndContext
        id={dndContextId}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Mobile: stack vertically and allow page scroll. Desktop: horizontal layout with overflow */}
        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
          {/* Palette */}
          <div className="w-full lg:w-64 p-4 border-b lg:border-b-0 lg:border-r lg:overflow-auto shrink-0">
            <Palette components={components} />
          </div>

          {/* Canvas */}
          <div className="flex-1 p-4 lg:overflow-auto min-h-[300px]">
            <Canvas
              fields={fields}
              components={components}
              onEditField={handleEditField}
              onDeleteField={handleDeleteField}
              isDraggingFromPalette={activeDragData?.type === "palette"}
            />
          </div>

          {/* Right Panel with Tabs */}
          <div className="w-full flex-1 lg:w-96 border-t lg:border-t-0 lg:border-l lg:overflow-auto min-h-[300px]">
            <Tabs defaultValue="preview" className="h-full flex flex-col">
              <div className="p-4 border-b">
                <TabsList className="w-full">
                  <TabsTrigger value="preview" className="flex-1">
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="schema" className="flex-1">
                    JSON Schema
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="preview" className="flex-1 m-0 lg:overflow-auto">
                <FormPreview schema={currentSchema} fieldComponents={fieldComponents} defaultValues={defaultValues} />
              </TabsContent>
              <TabsContent value="schema" className="flex-1 m-0 p-4 lg:overflow-auto">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(currentSchema, null, 2)}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeDragData?.type === "palette" && activeDragData.component && (
            <PaletteDragOverlay component={activeDragData.component} />
          )}
          {activeDragData?.type === "field" && activeDragData.field && (
            <FieldDragOverlay
              field={activeDragData.field}
              component={activeDragData.component}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Edit Field Dialog */}
      <EditFieldDialog
        open={editDialogFieldId !== null}
        onOpenChange={(open) => !open && setEditDialogFieldId(null)}
        field={editDialogField}
        component={editDialogComponent}
        onUpdate={handleUpdateField}
      />
    </div>
  );
}

export default FormBuilder;
