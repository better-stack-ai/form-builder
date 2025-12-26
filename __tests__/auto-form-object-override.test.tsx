/**
 * Tests for AutoFormObject custom fieldType override functionality
 *
 * These tests verify that custom fieldType components can override the default
 * rendering behavior for ZodObject and ZodArray fields. This is essential for
 * relation fields (belongsTo, hasMany) where we want to render a select/multi-select
 * instead of the default nested form UI.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import AutoFormObject from "../components/ui/auto-form/fields/object";
import type {
  AutoFormInputComponentProps,
  FieldConfig,
} from "../components/ui/auto-form/types";

// Helper to wrap components with FormProvider
function FormWrapper({
  children,
  defaultValues = {},
}: {
  children: (form: ReturnType<typeof useForm>) => React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const form = useForm({ defaultValues });
  return <FormProvider {...form}>{children(form)}</FormProvider>;
}

// Custom component for testing - renders a simple div with test data
function CustomFieldComponent({
  label,
  isRequired,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  return (
    <div data-testid="custom-field">
      <span data-testid="custom-label">{label}</span>
      <span data-testid="custom-required">{isRequired ? "yes" : "no"}</span>
      <span data-testid="custom-disabled">
        {fieldProps?.disabled ? "yes" : "no"}
      </span>
      {fieldConfigItem.description && (
        <span data-testid="custom-description">
          {String(fieldConfigItem.description)}
        </span>
      )}
    </div>
  );
}

describe("AutoFormObject custom fieldType override", () => {
  describe("ZodObject fields", () => {
    it("should render custom fieldType component for object field instead of default accordion", () => {
      const schema = z.object({
        author: z.object({
          id: z.string(),
          name: z.string(),
        }),
      });

      const fieldConfig: FieldConfig<z.infer<typeof schema>> = {
        author: {
          fieldType: CustomFieldComponent,
          label: "Select Author",
          description: "Choose an author",
        },
      };

      render(
        <FormWrapper>
          {(form) => (
            <AutoFormObject
              schema={schema}
              form={form}
              fieldConfig={fieldConfig}
            />
          )}
        </FormWrapper>
      );

      // Custom component should be rendered
      expect(screen.getByTestId("custom-field")).toBeDefined();
      expect(screen.getByTestId("custom-label").textContent).toBe(
        "Select Author"
      );
      expect(screen.getByTestId("custom-description").textContent).toBe(
        "Choose an author"
      );

      // Default accordion should NOT be rendered (no accordion trigger button)
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("should render default accordion UI when no custom fieldType is provided", () => {
      const schema = z.object({
        author: z.object({
          id: z.string(),
          name: z.string(),
        }),
      });

      render(
        <FormWrapper>
          {(form) => <AutoFormObject schema={schema} form={form} />}
        </FormWrapper>
      );

      // Should have an accordion trigger for the object field
      expect(screen.getByRole("button")).toBeDefined();
      expect(screen.getByText("Author")).toBeDefined();

      // Custom component should NOT be rendered
      expect(screen.queryByTestId("custom-field")).toBeNull();
    });

    it("should pass isRequired correctly based on fieldConfig override", () => {
      const schema = z.object({
        author: z.object({
          id: z.string(),
        }),
      });

      const fieldConfig: FieldConfig<z.infer<typeof schema>> = {
        author: {
          fieldType: CustomFieldComponent,
          inputProps: { required: true },
        },
      };

      render(
        <FormWrapper>
          {(form) => (
            <AutoFormObject
              schema={schema}
              form={form}
              fieldConfig={fieldConfig}
            />
          )}
        </FormWrapper>
      );

      expect(screen.getByTestId("custom-required").textContent).toBe("yes");
    });

    it("should pass disabled state from fieldConfig.inputProps", () => {
      const schema = z.object({
        author: z.object({
          id: z.string(),
        }),
      });

      const fieldConfig: FieldConfig<z.infer<typeof schema>> = {
        author: {
          fieldType: CustomFieldComponent,
          inputProps: { disabled: true },
        },
      };

      render(
        <FormWrapper>
          {(form) => (
            <AutoFormObject
              schema={schema}
              form={form}
              fieldConfig={fieldConfig}
            />
          )}
        </FormWrapper>
      );

      expect(screen.getByTestId("custom-disabled").textContent).toBe("yes");
    });
  });

  describe("ZodArray fields", () => {
    it("should render custom fieldType component for array field instead of default add/remove UI", () => {
      const schema = z.object({
        tags: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
          })
        ),
      });

      const fieldConfig: FieldConfig<z.infer<typeof schema>> = {
        tags: {
          fieldType: CustomFieldComponent,
          label: "Select Tags",
          description: "Choose multiple tags",
        },
      };

      render(
        <FormWrapper defaultValues={{ tags: [] }}>
          {(form) => (
            <AutoFormObject
              schema={schema}
              form={form}
              fieldConfig={fieldConfig}
            />
          )}
        </FormWrapper>
      );

      // Custom component should be rendered
      expect(screen.getByTestId("custom-field")).toBeDefined();
      expect(screen.getByTestId("custom-label").textContent).toBe(
        "Select Tags"
      );
      expect(screen.getByTestId("custom-description").textContent).toBe(
        "Choose multiple tags"
      );

      // Default array accordion should NOT be rendered
      expect(screen.queryByRole("button")).toBeNull();
    });

    it("should render default array UI when no custom fieldType is provided", () => {
      const schema = z.object({
        tags: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
          })
        ),
      });

      render(
        <FormWrapper defaultValues={{ tags: [] }}>
          {(form) => <AutoFormObject schema={schema} form={form} />}
        </FormWrapper>
      );

      // Should have the default array accordion UI (collapsed by default)
      // The accordion trigger shows "Tags"
      expect(screen.getByText("Tags")).toBeDefined();
      expect(screen.getByRole("button")).toBeDefined();

      // Custom component should NOT be rendered
      expect(screen.queryByTestId("custom-field")).toBeNull();
    });

    it("should pass isRequired correctly based on fieldConfig override for arrays", () => {
      const schema = z.object({
        tags: z.array(z.object({ id: z.string() })),
      });

      const fieldConfig: FieldConfig<z.infer<typeof schema>> = {
        tags: {
          fieldType: CustomFieldComponent,
          inputProps: { required: true },
        },
      };

      render(
        <FormWrapper defaultValues={{ tags: [] }}>
          {(form) => (
            <AutoFormObject
              schema={schema}
              form={form}
              fieldConfig={fieldConfig}
            />
          )}
        </FormWrapper>
      );

      expect(screen.getByTestId("custom-required").textContent).toBe("yes");
    });

    it("should pass disabled state from fieldConfig.inputProps for arrays", () => {
      const schema = z.object({
        tags: z.array(z.object({ id: z.string() })),
      });

      const fieldConfig: FieldConfig<z.infer<typeof schema>> = {
        tags: {
          fieldType: CustomFieldComponent,
          inputProps: { disabled: true },
        },
      };

      render(
        <FormWrapper defaultValues={{ tags: [] }}>
          {(form) => (
            <AutoFormObject
              schema={schema}
              form={form}
              fieldConfig={fieldConfig}
            />
          )}
        </FormWrapper>
      );

      expect(screen.getByTestId("custom-disabled").textContent).toBe("yes");
    });
  });

  describe("renderParent support", () => {
    it("should wrap custom object fieldType with renderParent", () => {
      const schema = z.object({
        author: z.object({ id: z.string() }),
      });

      const fieldConfig: FieldConfig<z.infer<typeof schema>> = {
        author: {
          fieldType: CustomFieldComponent,
          renderParent: ({ children }) => (
            <div data-testid="parent-wrapper">{children}</div>
          ),
        },
      };

      render(
        <FormWrapper>
          {(form) => (
            <AutoFormObject
              schema={schema}
              form={form}
              fieldConfig={fieldConfig}
            />
          )}
        </FormWrapper>
      );

      expect(screen.getByTestId("parent-wrapper")).toBeDefined();
      expect(screen.getByTestId("custom-field")).toBeDefined();
    });

    it("should wrap custom array fieldType with renderParent", () => {
      const schema = z.object({
        tags: z.array(z.object({ id: z.string() })),
      });

      const fieldConfig: FieldConfig<z.infer<typeof schema>> = {
        tags: {
          fieldType: CustomFieldComponent,
          renderParent: ({ children }) => (
            <div data-testid="parent-wrapper">{children}</div>
          ),
        },
      };

      render(
        <FormWrapper defaultValues={{ tags: [] }}>
          {(form) => (
            <AutoFormObject
              schema={schema}
              form={form}
              fieldConfig={fieldConfig}
            />
          )}
        </FormWrapper>
      );

      expect(screen.getByTestId("parent-wrapper")).toBeDefined();
      expect(screen.getByTestId("custom-field")).toBeDefined();
    });
  });

  describe("mixed fields", () => {
    it("should handle schema with mix of custom and default object/array fields", () => {
      const schema = z.object({
        // Custom object field
        author: z.object({
          id: z.string(),
          name: z.string(),
        }),
        // Default object field (rendered as accordion)
        metadata: z.object({
          createdAt: z.string(),
        }),
        // Custom array field
        tags: z.array(z.object({ id: z.string() })),
      });

      // Custom component that includes the field name
      const NamedCustomComponent = (props: AutoFormInputComponentProps) => (
        <div
          data-testid={`custom-${props.label.toLowerCase().replace(" ", "-")}`}
        >
          {props.label}
        </div>
      );

      const fieldConfig: FieldConfig<z.infer<typeof schema>> = {
        author: {
          fieldType: NamedCustomComponent,
          label: "Author",
        },
        tags: {
          fieldType: NamedCustomComponent,
          label: "Tags",
        },
        // metadata has no fieldType, should render as default accordion
      };

      render(
        <FormWrapper defaultValues={{ tags: [] }}>
          {(form) => (
            <AutoFormObject
              schema={schema}
              form={form}
              fieldConfig={fieldConfig}
            />
          )}
        </FormWrapper>
      );

      // Custom components should be rendered
      expect(screen.getByTestId("custom-author")).toBeDefined();
      expect(screen.getByTestId("custom-tags")).toBeDefined();

      // Default accordion for metadata should be rendered
      expect(screen.getByText("Metadata")).toBeDefined();
    });
  });
});
