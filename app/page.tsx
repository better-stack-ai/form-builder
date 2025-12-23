"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { FieldInputProps } from "@/components/ui/auto-form/types";
import { buildFieldConfigFromJsonSchema } from "@/components/ui/auto-form/utils";
import { zodToFormSchema, formSchemaToZod } from "@/lib/schema-converter";
import { AutoFormColorPicker } from "@/components/ui/color-picker";
import { AutoFormFileUploader } from "@/components/ui/file-uploader";
import { AutoFormImageUploader } from "@/components/ui/image-uploader";
import { z } from "zod";

import { filledFormValues } from "@/lib/constants";

// Custom field components for AutoForm
const customFieldComponents = {
  color: AutoFormColorPicker,
  file: AutoFormFileUploader,
  image: AutoFormImageUploader,
};

// Comprehensive schema demonstrating all available field types
// Using FieldConfigItem shape in .meta() for consistency
const allFieldsSchema = z.object({
  // Basic text input (default fallback)
  username: z.string().min(2, "Username must be at least 2 characters").meta({
    label: "User Name",
    description: "Your unique username for the platform",
    inputProps: {
      placeholder: "johndoe",
    } satisfies FieldInputProps,
  }),
  
  // Email input
  email: z.string().email("Please enter a valid email").meta({
    description: "We'll never share your email",
    inputProps: {
      placeholder: "john@example.com",
      type: "email",
    },
  }),
  
  // Password input
  password: z.string().min(8, "Password must be at least 8 characters").meta({
    label: "Password",
    description: "At least 8 characters",
    inputProps: {
      placeholder: "••••••••",
      type: "password",
    },
  }),
  
  // Textarea
  bio: z.string().optional().meta({
    label: "Bio",
    description: "Tell us about yourself",
    fieldType: "textarea",
    inputProps: {
      placeholder: "I'm a software developer who loves...",
    },
  }),
  
  // Number input
  age: z.number().min(0).max(120).optional().meta({
    label: "Age",
    description: "Your current age",
    inputProps: {
      placeholder: "25",
    },
  }),
  
  // Checkbox (boolean)
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }).meta({
    label: "Accept Terms & Conditions",
    description: "You must accept to continue",
  }),
  
  // Switch (boolean with different field type)
  emailNotifications: z.boolean().default(true).meta({
    label: "Email Notifications",
    description: "Receive updates via email",
    fieldType: "switch",
  }),
  
  // Date picker
  birthDate: z.date().min(new Date("1900-01-01")).max(new Date("2025-12-31")).optional().meta({
    label: "Birth Date",
    description: "Your date of birth",
    fieldType: "date",
  }),
  
  // Select dropdown (enum)
  role: z.enum(["admin", "user", "moderator", "guest"]).meta({
    label: "Role",
    description: "Select your account role",
    inputProps: {
      placeholder: "Select a role",
    },
  }),
  
  // Radio group (enum with different field type)
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional().meta({
    label: "Gender",
    description: "Select your gender",
    fieldType: "radio",
  }),
  
  // Select with optional
  country: z.enum(["usa", "uk", "canada", "australia", "germany", "france", "japan"]).optional().meta({
    label: "Country",
    description: "Where are you located?",
    inputProps: {
      placeholder: "Select a country",
    },
  }),

  // Custom field types
  favoriteColor: z.string().optional().meta({
    label: "Favorite Color",
    description: "Pick your favorite color",
    fieldType: "color",
  }),

  resume: z.string().optional().meta({
    label: "Resume",
    description: "Upload your resume (PDF, DOC, etc.)",
    fieldType: "file",
  }),

  avatar: z.string().optional().meta({
    label: "Profile Picture",
    description: "Upload your profile photo",
    fieldType: "image",
  }),
  
  // Nested object
  address: z.object({
    street: z.string().optional().meta({
      label: "Street Address",
      inputProps: { placeholder: "123 Main St" },
    }),
    city: z.string().optional().meta({
      label: "City",
      inputProps: { placeholder: "New York" },
    }),
    zipCode: z.string().optional().meta({
      label: "ZIP Code",
      inputProps: { placeholder: "10001" },
    }),
    state: z.string().optional().meta({
      label: "State",
      inputProps: { placeholder: "NY" },
    }),
  }).optional().meta({
    label: "Address",
  }),
  
  // Array of objects
  workExperience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      startYear: z.number().min(1900).max(2030),
      current: z.boolean().default(false),
    })
  ).optional().meta({
    label: "Work Experience",
    description: "Add your previous work experience",
  }),
  
  // Additional optional fields with defaults
  preferredLanguage: z.enum(["english", "spanish", "french", "german", "japanese", "mandarin"]).default("english").meta({
    label: "Preferred Language",
    description: "Your primary language",
  }),
  
  // URL input
  website: z.string().url("Please enter a valid URL").optional().meta({
    label: "Website",
    description: "Your personal or portfolio website",
    inputProps: {
      placeholder: "https://example.com",
    },
  }),
  
  // Phone number
  phone: z.string().optional().meta({
    label: "Phone Number",
    description: "Your contact number",
    inputProps: {
      placeholder: "+1 (555) 123-4567",
      type: "tel",
    },
  }),
});

type FormData = z.infer<typeof allFieldsSchema>;

// Use our custom helper that handles z.date() -> { type: "string", format: "date-time" }
const allFieldsJsonSchema = zodToFormSchema(allFieldsSchema);

console.log(allFieldsJsonSchema)

export default function Home() {
  const handleSubmit = (values: FormData) => {
    console.log("Form submitted:", values);
  };

  return (
    <div className="min-h-screen ">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      
      <main className="relative mx-auto px-6 py-16">
        <header className="mb-12 text-center">
          <h1 className="mb-3 font-serif text-4xl font-bold tracking-tight text-white md:text-5xl">
            AutoForm Demo
          </h1>
          <p className="text-lg ">
            All available field types including custom components (color, file, image)
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl grid grid-cols-3 gap-2">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">Zod Schema (Empty)</h2>
            <AutoForm
              formSchema={allFieldsSchema}
              onSubmit={handleSubmit}
              fieldConfig={{
                username: {
                  label: "User Name",
                  description: "Your unique username for the platform",
                  inputProps: { placeholder: "johndoe" },
                },
                email: {
                  description: "We'll never share your email",
                  inputProps: { placeholder: "john@example.com", type: "email" },
                },
                password: {
                  label: "Password",
                  description: "At least 8 characters",
                  inputProps: { placeholder: "••••••••", type: "password" },
                },
                bio: {
                  label: "Bio",
                  description: "Tell us about yourself",
                  fieldType: "textarea",
                  inputProps: { placeholder: "I'm a software developer who loves..." },
                },
                age: {
                  label: "Age",
                  description: "Your current age",
                  inputProps: { placeholder: "25" },
                },
                acceptTerms: {
                  label: "Accept Terms & Conditions",
                  description: "You must accept to continue",
                },
                emailNotifications: {
                  label: "Email Notifications",
                  description: "Receive updates via email",
                  fieldType: "switch",
                },
                birthDate: {
                  label: "Birth Date",
                  description: "Your date of birth",
                  fieldType: "date",
                },
                role: {
                  label: "Role",
                  description: "Select your account role",
                  inputProps: { placeholder: "Select a role" },
                },
                gender: {
                  label: "Gender",
                  description: "Select your gender",
                  fieldType: "radio",
                },
                country: {
                  label: "Country",
                  description: "Where are you located?",
                  inputProps: { placeholder: "Select a country" },
                },
                favoriteColor: {
                  label: "Favorite Color",
                  description: "Pick your favorite color",
                  fieldType: AutoFormColorPicker,
                },
                resume: {
                  label: "Resume",
                  description: "Upload your resume (PDF, DOC, etc.)",
                  fieldType: AutoFormFileUploader,
                },
                avatar: {
                  label: "Profile Picture",
                  description: "Upload your profile photo",
                  fieldType: AutoFormImageUploader,
                },
                address: {
                  label: "Address",
                  street: {
                    label: "Street Address",
                    inputProps: { placeholder: "123 Main St" },
                  },
                  city: {
                    label: "City",
                    inputProps: { placeholder: "New York" },
                  },
                  zipCode: {
                    label: "ZIP Code",
                    inputProps: { placeholder: "10001" },
                  },
                  state: {
                    label: "State",
                    inputProps: { placeholder: "NY" },
                  },
                },
                workExperience: {
                  label: "Work Experience",
                  description: "Add your previous work experience",
                },
                preferredLanguage: {
                  label: "Preferred Language",
                  description: "Your primary language",
                },
                website: {
                  label: "Website",
                  description: "Your personal or portfolio website",
                  inputProps: { placeholder: "https://example.com" },
                },
                phone: {
                  label: "Phone Number",
                  description: "Your contact number",
                  inputProps: { placeholder: "+1 (555) 123-4567", type: "tel" },
                },
              }}
            >
              <AutoFormSubmit className="mt-6 w-full">
                Submit Form
              </AutoFormSubmit>
            </AutoForm>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">JSON Schema (Empty)</h2>
            <AutoForm
              formSchema={formSchemaToZod(allFieldsJsonSchema)}
              onSubmit={(values) => handleSubmit(values as FormData)}
              fieldConfig={buildFieldConfigFromJsonSchema(allFieldsJsonSchema, customFieldComponents)}
            >
              <AutoFormSubmit className="mt-6 w-full">
                Submit Form
              </AutoFormSubmit>
            </AutoForm>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">JSON Schema (Filled)</h2>
            <AutoForm
              formSchema={formSchemaToZod(allFieldsJsonSchema)}
              onSubmit={(values) => handleSubmit(values as FormData)}
              fieldConfig={buildFieldConfigFromJsonSchema(allFieldsJsonSchema, customFieldComponents)}
              values={filledFormValues}
            >
              <AutoFormSubmit className="mt-6 w-full">
                Submit Form
              </AutoFormSubmit>
            </AutoForm>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm ">
          <p>
            This form demonstrates all available AutoForm field types: text input, email, password, 
            textarea, number, checkbox, switch, date picker, select, radio group, color picker,
            file upload, image upload, nested objects, and arrays.
          </p>
        </footer>
      </main>
    </div>
  );
}
