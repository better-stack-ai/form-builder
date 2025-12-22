#!/usr/bin/env npx tsx
/**
 * Build script for shadcn registry
 *
 * Generates a registry.json file and invokes `shadcn build` to create
 * the final registry output that can be consumed via:
 *   npx shadcn@latest add <registry-url>/auto-form
 *
 * Usage: npx tsx scripts/registry/build.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ============================================================================
// TYPES
// ============================================================================

interface RegistryFile {
  path: string;
  type:
    | "registry:component"
    | "registry:lib"
    | "registry:hook"
    | "registry:ui"
    | "registry:block";
}

interface RegistryItem {
  name: string;
  type: "registry:block";
  title: string;
  description: string;
  registryDependencies: string[];
  dependencies: string[];
  files: RegistryFile[];
}

interface Registry {
  $schema: string;
  name: string;
  homepage: string;
  items: RegistryItem[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const ROOT_DIR = path.resolve(__dirname, "../..");
const REGISTRY_OUTPUT_DIR = path.join(ROOT_DIR, "registry");

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all files in a directory recursively
 */
function getFilesRecursively(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath, baseDir));
    } else if (entry.isFile()) {
      // Return path relative to ROOT_DIR
      files.push(path.relative(ROOT_DIR, fullPath));
    }
  }

  return files;
}

/**
 * Determine the registry file type based on file path
 */
function getFileType(filePath: string): RegistryFile["type"] {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);

  // TSX files are components
  if (ext === ".tsx") {
    return "registry:component";
  }

  // TS files are lib/utils
  if (ext === ".ts") {
    return "registry:lib";
  }

  // Default to lib for other files
  return "registry:lib";
}

/**
 * Create a RegistryFile from a file path
 */
function createRegistryFile(filePath: string): RegistryFile {
  return {
    path: filePath,
    type: getFileType(filePath),
  };
}

// ============================================================================
// REGISTRY ITEMS
// ============================================================================

/**
 * Build the auto-form registry item
 */
function buildAutoFormItem(): RegistryItem {
  const autoFormDir = path.join(ROOT_DIR, "components/ui/auto-form");
  const autoFormFiles = getFilesRecursively(autoFormDir);

  // Filter out stepped-auto-form.tsx as it's a separate item
  const filteredFiles = autoFormFiles.filter(
    (f) => !f.endsWith("stepped-auto-form.tsx")
  );

  // Add shared dependencies
  const sharedFiles = [
    "components/ui/form.tsx",
    "components/ui/shared-form-types.ts",
    "lib/utils.ts",
  ];

  const allFiles = [...filteredFiles, ...sharedFiles];

  return {
    name: "auto-form",
    type: "registry:block",
    title: "Auto Form",
    description:
      "Automatically generate forms from Zod schemas with full TypeScript support.",
    registryDependencies: [
      "button",
      "form",
      "input",
      "checkbox",
      "label",
      "select",
      "radio-group",
      "switch",
      "textarea",
      "calendar",
      "popover",
    ],
    dependencies: ["zod", "react-hook-form", "@hookform/resolvers"],
    files: allFiles.map(createRegistryFile),
  };
}

/**
 * Build the stepped-auto-form registry item
 */
function buildSteppedAutoFormItem(): RegistryItem {
  return {
    name: "stepped-auto-form",
    type: "registry:block",
    title: "Stepped Auto Form",
    description:
      "Multi-step form wizard built on auto-form with step navigation and validation.",
    registryDependencies: ["auto-form", "button", "separator"],
    dependencies: [],
    files: [
      createRegistryFile("components/ui/auto-form/stepped-auto-form.tsx"),
    ],
  };
}

/**
 * Build the form-builder registry item
 */
function buildFormBuilderItem(): RegistryItem {
  const formBuilderDir = path.join(ROOT_DIR, "components/ui/form-builder");
  const formBuilderFiles = getFilesRecursively(formBuilderDir);

  return {
    name: "form-builder",
    type: "registry:block",
    title: "Form Builder",
    description:
      "Visual drag-and-drop form builder with JSON Schema output and live preview.",
    registryDependencies: [
      "auto-form",
      "tabs",
      "dialog",
      "accordion",
      "separator",
    ],
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/modifiers",
      "@dnd-kit/utilities",
    ],
    files: formBuilderFiles.map(createRegistryFile),
  };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("🔨 Building shadcn registry...\n");

  // Build registry items
  const autoFormItem = buildAutoFormItem();
  const steppedAutoFormItem = buildSteppedAutoFormItem();
  const formBuilderItem = buildFormBuilderItem();

  // Construct registry
  const registry: Registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "form-builder",
    homepage: "https://github.com/your-org/form-builder",
    items: [autoFormItem, steppedAutoFormItem, formBuilderItem],
  };

  // Write registry.json
  const registryPath = path.join(ROOT_DIR, "registry.json");
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`✅ Generated registry.json with ${registry.items.length} items`);

  // Log item details
  for (const item of registry.items) {
    console.log(`   - ${item.name}: ${item.files.length} files`);
  }

  // Create output directory
  if (!fs.existsSync(REGISTRY_OUTPUT_DIR)) {
    fs.mkdirSync(REGISTRY_OUTPUT_DIR, { recursive: true });
  }

  // Run shadcn build
  console.log("\n🏗️  Running shadcn build...\n");
  try {
    execSync(`pnpm dlx shadcn@latest build -o ${REGISTRY_OUTPUT_DIR}`, {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });
    console.log("\n✅ Registry built successfully!");
    console.log(`   Output: ${REGISTRY_OUTPUT_DIR}/`);
    console.log("\n📡 To serve the registry locally:");
    console.log("   pnpm host-registry");
    console.log("\n🔗 To install components:");
    console.log(
      "   npx shadcn@latest add http://localhost:8080/auto-form.json"
    );
  } catch (error) {
    console.error("\n❌ Failed to build registry:", error);
    process.exit(1);
  }
}

main();
