"use client";

import { useState } from "react";
import { FormBuilder, defaultComponents, type JSONSchema } from "@/components/ui/form-builder";
import { z } from "zod";

const jsonSchema = {
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
          "format": "email",
          "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
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
} satisfies z.core.JSONSchema.JSONSchema;

export default function BuilderPage() {
  const [schema, setSchema] = useState<JSONSchema>(jsonSchema);

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
