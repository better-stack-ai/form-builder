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
const REGISTRY_SRC_DIR = path.join(ROOT_DIR, ".registry-src");

// Path mappings: source path -> registry path
// This removes the /ui/ segment so files are installed directly under components/
const PATH_MAPPINGS: Array<{ from: string; to: string }> = [
  { from: "components/ui/auto-form", to: "components/auto-form" },
  { from: "components/ui/form-builder", to: "components/form-builder" },
  { from: "components/ui/form.tsx", to: "components/form.tsx" },
  { from: "components/ui/shared-form-types.ts", to: "components/shared-form-types.ts" },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all files in a directory recursively
 */
function getFilesRecursively(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Transform a source path to its registry path
 */
function transformPath(sourcePath: string): string {
  for (const mapping of PATH_MAPPINGS) {
    if (sourcePath.startsWith(mapping.from)) {
      return sourcePath.replace(mapping.from, mapping.to);
    }
  }
  return sourcePath;
}

/**
 * Copy a file to the registry source directory with transformed path
 */
function copyToRegistrySrc(sourcePath: string): string {
  const fullSourcePath = path.join(ROOT_DIR, sourcePath);
  const registryPath = transformPath(sourcePath);
  const fullDestPath = path.join(REGISTRY_SRC_DIR, registryPath);
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(fullDestPath), { recursive: true });
  
  // Copy file
  fs.copyFileSync(fullSourcePath, fullDestPath);
  
  return registryPath;
}

/**
 * Determine the registry file type based on file path
 */
function getFileType(filePath: string): RegistryFile["type"] {
  // Files in lib/ folder should be placed in lib/
  if (filePath.startsWith("lib/")) {
    return "registry:lib";
  }

  // All files in components/ should stay in components/
  return "registry:component";
}

/**
 * Create a RegistryFile from a registry path
 */
function createRegistryFile(registryPath: string): RegistryFile {
  return {
    path: registryPath,
    type: getFileType(registryPath),
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
  const autoFormFiles = getFilesRecursively(autoFormDir)
    .map((f) => path.relative(ROOT_DIR, f));

  // Filter out stepped-auto-form.tsx as it's a separate item
  const filteredFiles = autoFormFiles.filter(
    (f) => !f.endsWith("stepped-auto-form.tsx")
  );

  // Add shared component files
  // Note: We don't include lib/utils.ts because it's a standard shadcn utility
  // that users already have from installing any shadcn component.
  const sharedFiles = [
    "components/ui/form.tsx",
    "components/ui/shared-form-types.ts",
  ];

  const allSourceFiles = [...filteredFiles, ...sharedFiles];
  
  // Copy files to registry source and get transformed paths
  const registryPaths = allSourceFiles.map(copyToRegistrySrc);

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
    files: registryPaths.map(createRegistryFile),
  };
}

/**
 * Build the stepped-auto-form registry item
 */
function buildSteppedAutoFormItem(): RegistryItem {
  const sourceFile = "components/ui/auto-form/stepped-auto-form.tsx";
  const registryPath = copyToRegistrySrc(sourceFile);
  
  return {
    name: "stepped-auto-form",
    type: "registry:block",
    title: "Stepped Auto Form",
    description:
      "Multi-step form wizard built on auto-form with step navigation and validation.",
    registryDependencies: [
      "https://raw.githubusercontent.com/better-stack-ai/form-builder/refs/heads/main/registry/auto-form.json",
      "button",
      "separator",
    ],
    dependencies: [],
    files: [createRegistryFile(registryPath)],
  };
}

/**
 * Build the form-builder registry item
 */
function buildFormBuilderItem(): RegistryItem {
  const formBuilderDir = path.join(ROOT_DIR, "components/ui/form-builder");
  const formBuilderFiles = getFilesRecursively(formBuilderDir)
    .map((f) => path.relative(ROOT_DIR, f));

  // Copy files to registry source and get transformed paths
  const registryPaths = formBuilderFiles.map(copyToRegistrySrc);

  return {
    name: "form-builder",
    type: "registry:block",
    title: "Form Builder",
    description:
      "Visual drag-and-drop form builder with JSON Schema output and live preview.",
    registryDependencies: [
      "https://raw.githubusercontent.com/better-stack-ai/form-builder/refs/heads/main/registry/auto-form.json",
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
    files: registryPaths.map(createRegistryFile),
  };
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("🔨 Building shadcn registry...\n");

  // Clean up previous registry source
  if (fs.existsSync(REGISTRY_SRC_DIR)) {
    fs.rmSync(REGISTRY_SRC_DIR, { recursive: true });
  }
  fs.mkdirSync(REGISTRY_SRC_DIR, { recursive: true });

  // Build registry items (this also copies files to registry source)
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

  // Write registry.json to the registry source directory
  const registryPath = path.join(REGISTRY_SRC_DIR, "registry.json");
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

  // Run shadcn build from the registry source directory
  console.log("\n🏗️  Running shadcn build...\n");
  try {
    execSync(`pnpm dlx shadcn@latest build -o ${REGISTRY_OUTPUT_DIR}`, {
      cwd: REGISTRY_SRC_DIR,
      stdio: "inherit",
    });
    
    // Also copy registry.json to output for reference
    fs.copyFileSync(registryPath, path.join(REGISTRY_OUTPUT_DIR, "registry.json"));
    
    // Clean up registry source
    fs.rmSync(REGISTRY_SRC_DIR, { recursive: true });
    
    console.log("\n✅ Registry built successfully!");
    console.log(`   Output: ${REGISTRY_OUTPUT_DIR}/`);
    console.log("\n📡 To serve the registry locally:");
    console.log("   pnpm host-registry");
    console.log("\n🔗 To install components:");
    console.log(
      "   pnpm dlx shadcn@latest add http://localhost:8080/auto-form.json"
    );
  } catch (error) {
    console.error("\n❌ Failed to build registry:", error);
    process.exit(1);
  }
}

main();
