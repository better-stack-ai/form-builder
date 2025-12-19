"use client";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { z } from "zod";

// Comprehensive schema demonstrating all available field types
const allFieldsSchema = z.object({
  // Basic text input (default fallback)
  username: z.string().min(2, "Username must be at least 2 characters"),
  
  // Email input
  email: z.string().email("Please enter a valid email"),
  
  // Password input (configured via inputProps)
  password: z.string().min(8, "Password must be at least 8 characters"),
  
  // Textarea
  bio: z.string().optional(),
  
  // Number input
  age: z.number().min(0).max(120).optional(),
  
  // Checkbox (boolean)
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  
  // Switch (boolean with different field type)
  emailNotifications: z.boolean().default(true),
  
  // Date picker
  birthDate: z.date().optional(),
  
  // Select dropdown (enum)
  role: z.enum(["admin", "user", "moderator", "guest"]),
  
  // Radio group (enum with different field type)
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  
  // Select with optional
  country: z.enum(["usa", "uk", "canada", "australia", "germany", "france", "japan"]).optional(),
  
  // File upload
  avatar: z.instanceof(File).optional(),
  
  // Nested object
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  
  // Array of objects
  workExperience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      startYear: z.number().min(1900).max(2030),
      current: z.boolean().default(false),
    })
  ).optional(),
  
  // Additional optional fields with defaults
  preferredLanguage: z.enum(["english", "spanish", "french", "german", "japanese", "mandarin"]).default("english"),
  
  // URL input
  website: z.string().url("Please enter a valid URL").optional(),
  
  // Phone number
  phone: z.string().optional(),
});

type FormData = z.infer<typeof allFieldsSchema>;

export default function Home() {
  const handleSubmit = (values: FormData) => {
    console.log("Form submitted:", values);
    alert("Form submitted! Check console for values.");
  };

  return (
    <div className="min-h-screen ">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      
      <main className="relative mx-auto max-w-2xl px-6 py-16">
        <header className="mb-12 text-center">
          <h1 className="mb-3 font-serif text-4xl font-bold tracking-tight text-white md:text-5xl">
            AutoForm Demo
          </h1>
          <p className="text-lg ">
            All available field types in one comprehensive form
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <AutoForm
            formSchema={allFieldsSchema}
            onSubmit={handleSubmit}
            fieldConfig={{
              username: {
                label: "Username",
                description: "Your unique username for the platform",
                inputProps: {
                  placeholder: "johndoe",
                },
              },
              email: {
                label: "Email Address",
                description: "We'll never share your email",
                inputProps: {
                  placeholder: "john@example.com",
                  type: "email",
                },
              },
              password: {
                label: "Password",
                description: "At least 8 characters",
                inputProps: {
                  placeholder: "••••••••",
                  type: "password",
                },
              },
              bio: {
                label: "Bio",
                description: "Tell us about yourself",
                fieldType: "textarea",
                inputProps: {
                  placeholder: "I'm a software developer who loves...",
                },
              },
              age: {
                label: "Age",
                description: "Your current age",
                inputProps: {
                  placeholder: "25",
                },
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
              },
              role: {
                label: "Role",
                description: "Select your account role",
                inputProps: {
                  placeholder: "Select a role",
                },
              },
              gender: {
                label: "Gender",
                description: "Select your gender",
                fieldType: "radio",
              },
              country: {
                label: "Country",
                description: "Where are you located?",
                inputProps: {
                  placeholder: "Select a country",
                },
              },
              avatar: {
                label: "Profile Picture",
                description: "Upload your avatar (image files only)",
                fieldType: "file",
              },
              address: {
                label: "Address",
                street: {
                  label: "Street Address",
                  inputProps: {
                    placeholder: "123 Main St",
                  },
                },
                city: {
                  label: "City",
                  inputProps: {
                    placeholder: "New York",
                  },
                },
                zipCode: {
                  label: "ZIP Code",
                  inputProps: {
                    placeholder: "10001",
                  },
                },
                state: {
                  label: "State",
                  inputProps: {
                    placeholder: "NY",
                  },
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
                inputProps: {
                  placeholder: "https://example.com",
                },
              },
              phone: {
                label: "Phone Number",
                description: "Your contact number",
                inputProps: {
                  placeholder: "+1 (555) 123-4567",
                  type: "tel",
                },
              },
            }}
          >
            <AutoFormSubmit className="mt-6 w-full">
              Submit Form
            </AutoFormSubmit>
          </AutoForm>
        </div>

        <footer className="mt-8 text-center text-sm ">
          <p>
            This form demonstrates all available AutoForm field types: text input, email, password, 
            textarea, number, checkbox, switch, date picker, select, radio group, file upload, 
            nested objects, and arrays.
          </p>
        </footer>
      </main>
    </div>
  );
}
