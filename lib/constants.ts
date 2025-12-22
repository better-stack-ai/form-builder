import type { JSONSchema } from "@/components/ui/form-builder";

/**
 * Comprehensive example JSON Schema demonstrating all available field types
 * including custom components (color picker, file upload, image upload)
 */
export const exampleJsonSchema: JSONSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "username": {
      "label": "User Name",
      "description": "Your unique username for the platform",
      "inputProps": {
        "placeholder": "johndoe"
      },
      "type": "string",
      "minLength": 2
    },
    "email": {
      "description": "We'll never share your email",
      "inputProps": {
        "placeholder": "john@example.com",
        "type": "email"
      },
      "type": "string",
      "format": "email"
    },
    "password": {
      "label": "Password",
      "description": "At least 8 characters",
      "inputProps": {
        "placeholder": "••••••••",
        "type": "password"
      },
      "type": "string",
      "minLength": 8
    },
    "bio": {
      "label": "Bio",
      "description": "Tell us about yourself",
      "fieldType": "textarea",
      "inputProps": {
        "placeholder": "I'm a software developer who loves..."
      },
      "type": "string"
    },
    "age": {
      "label": "Age",
      "description": "Your current age",
      "inputProps": {
        "placeholder": "25"
      },
      "type": "number",
      "minimum": 0,
      "maximum": 120
    },
    "acceptTerms": {
      "label": "Accept Terms & Conditions",
      "description": "You must accept to continue",
      "type": "boolean"
    },
    "emailNotifications": {
      "label": "Email Notifications",
      "description": "Receive updates via email",
      "fieldType": "switch",
      "default": true,
      "type": "boolean"
    },
    "birthDate": {
      "label": "Birth Date",
      "description": "Your date of birth",
      "fieldType": "date",
      "type": "string",
      "format": "date-time"
    },
    "role": {
      "label": "Role",
      "description": "Select your account role",
      "inputProps": {
        "placeholder": "Select a role"
      },
      "type": "string",
      "enum": [
        "admin",
        "user",
        "moderator",
        "guest"
      ]
    },
    "gender": {
      "label": "Gender",
      "description": "Select your gender",
      "fieldType": "radio",
      "type": "string",
      "enum": [
        "male",
        "female",
        "other",
        "prefer-not-to-say"
      ]
    },
    "country": {
      "label": "Country",
      "description": "Where are you located?",
      "inputProps": {
        "placeholder": "Select a country"
      },
      "type": "string",
      "enum": [
        "usa",
        "uk",
        "canada",
        "australia",
        "germany",
        "france",
        "japan"
      ]
    },
    // Custom field types
    "favoriteColor": {
      "label": "Favorite Color",
      "description": "Pick your favorite color",
      "fieldType": "color",
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$"
    },
    "resume": {
      "label": "Resume",
      "description": "Upload your resume (PDF, DOC, etc.)",
      "fieldType": "file",
      "type": "string"
    },
    "avatar": {
      "label": "Profile Picture",
      "description": "Upload your profile photo",
      "fieldType": "image",
      "type": "string"
    },
    "address": {
      "label": "Address",
      "type": "object",
      "properties": {
        "street": {
          "label": "Street Address",
          "inputProps": {
            "placeholder": "123 Main St"
          },
          "type": "string"
        },
        "city": {
          "label": "City",
          "inputProps": {
            "placeholder": "New York"
          },
          "type": "string"
        },
        "zipCode": {
          "label": "ZIP Code",
          "inputProps": {
            "placeholder": "10001"
          },
          "type": "string"
        },
        "state": {
          "label": "State",
          "inputProps": {
            "placeholder": "NY"
          },
          "type": "string"
        }
      },
      "additionalProperties": false
    },
    "workExperience": {
      "label": "Work Experience",
      "description": "Add your previous work experience",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "company": {
            "type": "string"
          },
          "position": {
            "type": "string"
          },
          "startYear": {
            "type": "number",
            "minimum": 1900,
            "maximum": 2030
          },
          "current": {
            "default": false,
            "type": "boolean"
          }
        },
        "required": [
          "company",
          "position",
          "startYear",
          "current"
        ],
        "additionalProperties": false
      }
    },
    "preferredLanguage": {
      "label": "Preferred Language",
      "description": "Your primary language",
      "default": "english",
      "type": "string",
      "enum": [
        "english",
        "spanish",
        "french",
        "german",
        "japanese",
        "mandarin"
      ]
    },
    "website": {
      "label": "Website",
      "description": "Your personal or portfolio website",
      "inputProps": {
        "placeholder": "https://example.com"
      },
      "type": "string",
      "format": "uri"
    },
    "phone": {
      "label": "Phone Number",
      "description": "Your contact number",
      "inputProps": {
        "placeholder": "+1 (555) 123-4567",
        "type": "tel"
      },
      "type": "string"
    }
  },
  "required": [
    "username",
    "email",
    "password",
    "acceptTerms",
    "emailNotifications",
    "role",
    "preferredLanguage"
  ],
  "additionalProperties": false
};

/**
 * Pre-filled values simulating an edit state with all valid values
 * including custom field types (color, file, image)
 */
export const filledFormValues = {
  username: "janedoe",
  email: "jane.doe@example.com",
  password: "SecurePass123!",
  bio: "Full-stack developer with 8 years of experience in building web applications. Passionate about clean code and user experience.",
  age: 32,
  acceptTerms: true,
  emailNotifications: true,
  birthDate: "1992-06-15T00:00:00.000Z",
  role: "admin",
  gender: "female",
  country: "canada",
  // Custom field values
  favoriteColor: "#00ff00",
  resume: "https://storage.example.com/uploads/jane-doe-resume.pdf",
  avatar: "https://placehold.co/600x400",
  address: {
    street: "456 Oak Avenue",
    city: "Toronto",
    zipCode: "M5V 2H1",
    state: "ON"
  },
  workExperience: [
    {
      company: "Tech Corp",
      position: "Senior Developer",
      startYear: 2020,
      current: true
    },
    {
      company: "StartupXYZ",
      position: "Full Stack Developer",
      startYear: 2017,
      current: false
    }
  ],
  preferredLanguage: "english",
  website: "https://janedoe.dev",
  phone: "+1 (416) 555-7890"
};