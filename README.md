# shadcn/ui Form Components

A collection of powerful form components for React built on top of [shadcn/ui](https://ui.shadcn.com/), [Zod](https://zod.dev/), and [React Hook Form](https://react-hook-form.com/).

## Components

| Component | Description |
|-----------|-------------|
| [auto-form](#auto-form) | Automatically generate forms from Zod schemas |
| [stepped-auto-form](#stepped-auto-form) | Multi-step form wizard with step navigation |
| [form-builder](#form-builder) | Visual drag-and-drop form builder with JSON Schema output |

## Installation

Install components using the shadcn CLI:

```bash
# Install auto-form
npx shadcn@latest add "https://raw.githubusercontent.com/better-stack-ai/form-builder/refs/heads/main/registry/auto-form.json"

# Install stepped-auto-form (requires auto-form)
npx shadcn@latest add "https://raw.githubusercontent.com/better-stack-ai/form-builder/refs/heads/main/registry/stepped-auto-form.json"

# Install form-builder (requires auto-form)
npx shadcn@latest add "https://raw.githubusercontent.com/better-stack-ai/form-builder/refs/heads/main/registry/form-builder.json"
```

---

## auto-form

Automatically generate fully-featured forms from Zod schemas with zero boilerplate. The component infers field types, validation, labels, and more directly from your schema.

### Basic Usage

```tsx
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { z } from "zod";

const userSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  age: z.number().min(18).optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
});

function MyForm() {
  return (
    <AutoForm
      formSchema={userSchema}
      onSubmit={(values) => {
        console.log("Form submitted:", values);
      }}
    >
      <AutoFormSubmit>Submit</AutoFormSubmit>
    </AutoForm>
  );
}
```

### Field Type Inference

AutoForm automatically maps Zod types to appropriate form fields:

| Zod Type | Form Field |
|----------|------------|
| `z.string()` | Text input |
| `z.string().email()` | Email input |
| `z.number()` | Number input |
| `z.boolean()` | Checkbox |
| `z.date()` | Date picker |
| `z.enum([...])` | Select dropdown |
| `z.object({...})` | Nested fieldset |
| `z.array(z.object({...}))` | Dynamic array of fields |

### Customizing Fields with Meta

Use `.meta()` to customize field appearance and behavior:

```tsx
const schema = z.object({
  bio: z.string().optional().meta({
    label: "Biography",
    description: "Tell us about yourself",
    fieldType: "textarea",
    inputProps: {
      placeholder: "I'm a software developer...",
    },
  }),
  
  notifications: z.boolean().default(true).meta({
    label: "Email Notifications",
    fieldType: "switch",
  }),
  
  role: z.enum(["admin", "user", "moderator"]).meta({
    label: "Role",
    fieldType: "radio", // Use radio buttons instead of select
  }),
});
```

### Field Config Override

Alternatively, use the `fieldConfig` prop to customize fields without modifying the schema:

```tsx
<AutoForm
  formSchema={schema}
  fieldConfig={{
    bio: {
      label: "Biography",
      description: "Tell us about yourself",
      fieldType: "textarea",
      inputProps: { placeholder: "I'm a software developer..." },
    },
    notifications: {
      label: "Email Notifications",
      fieldType: "switch",
    },
  }}
/>
```

### Custom Field Components

Register custom field components for specialized inputs:

```tsx
import { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";

// Custom color picker component
function ColorPickerField({ field, label }: AutoFormInputComponentProps) {
  return (
    <div>
      <label>{label}</label>
      <input
        type="color"
        value={field.value || "#000000"}
        onChange={(e) => field.onChange(e.target.value)}
      />
    </div>
  );
}

// Use in schema
const schema = z.object({
  favoriteColor: z.string().meta({
    fieldType: ColorPickerField,
  }),
});

// Or via fieldConfig
<AutoForm
  formSchema={schema}
  fieldConfig={{
    favoriteColor: {
      fieldType: ColorPickerField,
    },
  }}
/>
```

### Available Field Types

Built-in field types: `checkbox`, `date`, `select`, `radio`, `switch`, `textarea`, `number`, `fallback` (text input)

### Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `formSchema` | `ZodSchema` | The Zod schema defining form structure |
| `values` | `Partial<T>` | Controlled form values |
| `onValuesChange` | `(values, form) => void` | Called on any value change |
| `onParsedValuesChange` | `(values, form) => void` | Called when values pass validation |
| `onSubmit` | `(values, form) => void` | Called on valid form submission |
| `fieldConfig` | `FieldConfig<T>` | Per-field customization |
| `dependencies` | `Dependency[]` | Field dependency rules |
| `className` | `string` | Additional CSS classes |
| `children` | `ReactNode \| (formState) => ReactNode` | Submit button or render function |

---

## stepped-auto-form

A multi-step form wizard built on top of auto-form. Perfect for long forms that benefit from being broken into logical sections.

### Basic Usage

```tsx
import SteppedAutoForm from "@/components/ui/auto-form/stepped-auto-form";
import { z } from "zod";

// Define steps in schema meta
const registrationSchema = z.object({
  // Step 1: Account Info
  email: z.string().email().meta({ stepGroup: 0 }),
  password: z.string().min(8).meta({ stepGroup: 0 }),
  
  // Step 2: Personal Info
  firstName: z.string().meta({ stepGroup: 1 }),
  lastName: z.string().meta({ stepGroup: 1 }),
  
  // Step 3: Preferences
  newsletter: z.boolean().default(false).meta({ stepGroup: 2 }),
  theme: z.enum(["light", "dark"]).meta({ stepGroup: 2 }),
}).meta({
  steps: [
    { id: "account", title: "Account" },
    { id: "personal", title: "Personal Info" },
    { id: "preferences", title: "Preferences" },
  ],
});

function RegistrationForm() {
  return (
    <SteppedAutoForm
      formSchema={registrationSchema}
      onSubmit={(values) => {
        console.log("Registration complete:", values);
      }}
    />
  );
}
```

### Customizing Navigation

```tsx
<SteppedAutoForm
  formSchema={schema}
  onSubmit={handleSubmit}
  nextButtonText="Continue"
  backButtonText="Previous"
  submitButtonText="Complete Registration"
/>
```

### Custom Stepper Component

Provide a custom stepper UI:

```tsx
import { StepperComponentProps } from "@/components/ui/auto-form/stepped-auto-form";

function CustomStepper({ steps, currentStepIndex, onStepClick }: StepperComponentProps) {
  return (
    <div className="flex gap-2">
      {steps.map((step, index) => (
        <button
          key={step.id}
          onClick={() => onStepClick?.(step.id)}
          className={index === currentStepIndex ? "font-bold" : ""}
        >
          {step.label}
        </button>
      ))}
    </div>
  );
}

<SteppedAutoForm
  formSchema={schema}
  StepperComponent={CustomStepper}
/>
```

### Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `formSchema` | `ZodSchema` | Schema with step metadata |
| `values` | `Partial<T>` | Initial form values |
| `onSubmit` | `(values) => void` | Called on final step submission |
| `fieldConfig` | `FieldConfig<T>` | Per-field customization |
| `nextButtonText` | `string` | Text for next button (default: "Next") |
| `backButtonText` | `string` | Text for back button (default: "Back") |
| `submitButtonText` | `string` | Text for submit button (default: "Submit") |
| `StepperComponent` | `React.ComponentType` | Custom stepper component |
| `className` | `string` | Additional CSS classes |

---

## form-builder

A visual drag-and-drop form builder that outputs JSON Schema. Users can design forms visually, and developers can render them using auto-form.

### Basic Usage

```tsx
import { FormBuilder, type JSONSchema } from "@/components/ui/form-builder";
import { useState } from "react";

function FormDesigner() {
  const [schema, setSchema] = useState<JSONSchema>({
    type: "object",
    properties: {},
  });

  return (
    <FormBuilder
      value={schema}
      onChange={setSchema}
    />
  );
}
```

### With Initial Schema

```tsx
const initialSchema: JSONSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      label: "Full Name",
      placeholder: "John Doe",
    },
    email: {
      type: "string",
      format: "email",
      label: "Email Address",
    },
  },
  required: ["name", "email"],
};

<FormBuilder value={initialSchema} onChange={setSchema} />
```

### Custom Field Types

Add custom field types to the builder palette:

```tsx
import { FormBuilder, defaultComponents, defineComponent } from "@/components/ui/form-builder";
import { baseMetaSchema } from "@/components/ui/form-builder";
import { z } from "zod";

// Define a custom rating field
const ratingFieldDefinition = defineComponent({
  type: "rating",
  backingType: "number",
  label: "Rating",
  icon: StarIcon,
  defaultProps: {
    label: "Rating",
    min: 1,
    max: 5,
  },
  propertiesSchema: baseMetaSchema.extend({
    min: z.number().default(1),
    max: z.number().default(5),
  }),
  toJSONSchema: (props, isRequired) => ({
    type: "number",
    label: props.label,
    minimum: props.min,
    maximum: props.max,
    fieldType: "rating",
  }),
  fromJSONSchema: (prop, key, isRequired) => {
    if (prop.fieldType !== "rating") return null;
    return {
      id: key,
      type: "rating",
      props: {
        label: prop.label || key,
        min: prop.minimum || 1,
        max: prop.maximum || 5,
        required: isRequired,
      },
    };
  },
});

// Add to palette
const components = [...defaultComponents, ratingFieldDefinition];

// Provide matching render component
const fieldComponents = {
  rating: RatingComponent,
};

<FormBuilder
  components={components}
  fieldComponents={fieldComponents}
  value={schema}
  onChange={setSchema}
/>
```

### Multi-Step Forms

The form builder supports creating multi-step forms. Click "Add Step" to create a stepped form, then assign fields to steps.

### Default Values

Pre-populate the form preview with values:

```tsx
<FormBuilder
  value={schema}
  onChange={setSchema}
  defaultValues={{
    name: "John Doe",
    email: "john@example.com",
  }}
/>
```

### Rendering the Built Form

Use auto-form to render forms created with the builder:

```tsx
import AutoForm from "@/components/ui/auto-form";
import { fromJSONSchemaWithDates, buildFieldConfigFromJsonSchema } from "@/components/ui/auto-form/utils";

function RenderForm({ schema }: { schema: JSONSchema }) {
  const zodSchema = fromJSONSchemaWithDates(schema);
  const fieldConfig = buildFieldConfigFromJsonSchema(schema);

  return (
    <AutoForm
      formSchema={zodSchema}
      fieldConfig={fieldConfig}
      onSubmit={(values) => console.log(values)}
    />
  );
}
```

### Built-in Field Types

The form builder includes these field types by default:

- **Text** - Single-line text input
- **Email** - Email input with validation
- **Password** - Password input
- **URL** - URL input with validation
- **Phone** - Phone number input
- **Textarea** - Multi-line text input
- **Number** - Numeric input
- **Checkbox** - Boolean checkbox
- **Switch** - Toggle switch
- **Select** - Dropdown select
- **Radio** - Radio button group
- **Date** - Date picker
- **Object** - Nested field group
- **Array** - Repeatable field group

### Props Reference

| Prop | Type | Description |
|------|------|-------------|
| `value` | `JSONSchema` | Current form schema |
| `onChange` | `(schema: JSONSchema) => void` | Called when schema changes |
| `components` | `FormBuilderComponentDefinition[]` | Available field types |
| `fieldComponents` | `Record<string, Component>` | Custom render components |
| `defaultValues` | `Record<string, unknown>` | Default values for preview |
| `className` | `string` | Additional CSS classes |

---

## JSON Schema Format

The form builder uses an extended JSON Schema format that includes form-specific metadata:

```json
{
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "label": "Username",
      "description": "Your unique username",
      "placeholder": "johndoe",
      "minLength": 2,
      "maxLength": 50
    },
    "role": {
      "type": "string",
      "enum": ["admin", "user", "guest"],
      "label": "Role",
      "fieldType": "radio"
    },
    "birthDate": {
      "type": "string",
      "format": "date-time",
      "label": "Birth Date"
    }
  },
  "required": ["username", "role"],
  "steps": [
    { "id": "step-1", "title": "Account Info" },
    { "id": "step-2", "title": "Personal Details" }
  ]
}
```

### Extended Properties

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Display label for the field |
| `description` | `string` | Helper text below the field |
| `placeholder` | `string` | Placeholder text |
| `fieldType` | `string` | Override field type (e.g., "radio", "switch", "textarea") |
| `stepGroup` | `number` | Step index for multi-step forms |
| `inputProps` | `object` | Additional input props |

---

## License

MIT
