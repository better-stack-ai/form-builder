import { test, expect } from "@playwright/test";

test.describe("Form Builder - Multi-Step Forms", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("should show 'Add Step' button initially", async ({ page }) => {
    // Should see the Add Step button
    await expect(page.getByRole("button", { name: "Add Step" })).toBeVisible();
    
    // Should see the helper text
    await expect(page.getByText("Add a step to create a multi-step form")).toBeVisible();
  });

  test("should add a second step via step tabs", async ({ page }) => {
    // Click "Add Step" button
    await page.getByRole("button", { name: "Add Step" }).click();
    
    // Should now see two step tabs (Step 1 and Step 2)
    await expect(page.getByRole("button", { name: "Step 1" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Step 2" })).toBeVisible();
    
    // Add Step button should still be visible
    await expect(page.getByRole("button", { name: "Add Step" })).toBeVisible();
  });

  test("should rename a step", async ({ page }) => {
    // Add steps first
    await page.getByRole("button", { name: "Add Step" }).click();
    await expect(page.getByRole("button", { name: "Step 1" })).toBeVisible();
    
    // Find the Step 1 tab container (has the step button and edit/delete buttons)
    const stepTabContainer = page.locator('[class*="rounded-md"][class*="border"]').filter({ hasText: "Step 1" }).first();
    
    // Hover to reveal edit button, then click it
    await stepTabContainer.hover();
    await stepTabContainer.locator('button[title="Rename step"]').click();
    
    // Should see input field - it's now visible anywhere on the page in the step tabs area
    const input = page.locator('input').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    
    // Enter new name
    await input.fill("Personal Info");
    
    // Confirm by pressing Enter
    await input.press("Enter");
    
    // Verify step tab shows new name
    await expect(page.getByRole("button", { name: "Personal Info" })).toBeVisible();
  });

  test("should delete a step and return to single-step mode", async ({ page }) => {
    // Add steps first
    await page.getByRole("button", { name: "Add Step" }).click();
    await expect(page.getByRole("button", { name: "Step 1" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Step 2" })).toBeVisible();
    
    // Find Step 2 tab and hover to reveal delete button
    const step2Tab = page.locator('[class*="rounded-md"]').filter({ hasText: "Step 2" }).first();
    await step2Tab.hover();
    
    // Click delete button (Trash icon)
    await step2Tab.locator('button[title="Delete step"]').click();
    
    // Should return to single-step mode - no step tabs visible, just Add Step button
    await expect(page.getByRole("button", { name: "Step 1" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Step 2" })).not.toBeVisible();
    await expect(page.getByText("Add a step to create a multi-step form")).toBeVisible();
  });

  test("should assign new field to active step", async ({ page }) => {
    // Add steps first
    await page.getByRole("button", { name: "Add Step" }).click();
    await expect(page.getByRole("button", { name: "Step 1" })).toBeVisible();
    
    // Ensure Step 1 is active
    await page.getByRole("button", { name: "Step 1" }).click();
    
    // Add a text field to Step 1
    const canvas = page.getByText("Drag components from the palette");
    await page.getByRole("button", { name: "Text Input" }).dragTo(canvas);
    
    // Verify field was added
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Switch to Step 2
    await page.getByRole("button", { name: "Step 2" }).click();
    
    // Step 2 should be empty (no fields)
    await expect(page.getByText("Drop components here")).toBeVisible();
    
    // Step 1 field should not be visible
    const canvasArea = page.locator('[class*="border-dashed"]');
    await expect(canvasArea.getByText("Text Field", { exact: true })).not.toBeVisible();
  });

  test("should filter canvas fields by active step tab", async ({ page }) => {
    // Add steps
    await page.getByRole("button", { name: "Add Step" }).click();
    
    // Add field to Step 1
    await page.getByRole("button", { name: "Step 1" }).click();
    let canvas = page.getByText("Drag components from the palette");
    await page.getByRole("button", { name: "Text Input" }).dragTo(canvas);
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Edit label for Step 1 field
    const canvasArea = page.locator('[class*="border-dashed"]');
    const step1Field = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await step1Field.hover();
    await step1Field.locator('button').first().click();
    await page.getByLabel("Label *").fill("Step 1 Field");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Switch to Step 2 and add a field
    await page.getByRole("button", { name: "Step 2" }).click();
    canvas = page.getByText("Drop components here");
    await page.getByRole("button", { name: "Email" }).dragTo(canvas);
    await expect(page.getByText("Email", { exact: true }).first()).toBeVisible();
    
    // Verify Step 2 only shows Email field, not Step 1 Field
    await expect(canvasArea.getByText("Step 1 Field")).not.toBeVisible();
    await expect(canvasArea.getByText("Email", { exact: true }).first()).toBeVisible();
    
    // Switch back to Step 1
    await page.getByRole("button", { name: "Step 1" }).click();
    
    // Verify Step 1 only shows Step 1 Field, not Email
    await expect(canvasArea.getByText("Step 1 Field")).toBeVisible();
    await expect(canvasArea.getByText("Email", { exact: true })).not.toBeVisible();
  });

  test("should persist step metadata in JSON Schema output", async ({ page }) => {
    // Add steps and rename
    await page.getByRole("button", { name: "Add Step" }).click();
    
    // Rename Step 1
    const step1Tab = page.locator('[class*="rounded-md"][class*="border"]').filter({ hasText: "Step 1" }).first();
    await step1Tab.hover();
    await step1Tab.locator('button[title="Rename step"]').click();
    // Find the visible input (for step renaming)
    const renameInput = page.locator('input').first();
    await renameInput.fill("Personal");
    await renameInput.press("Enter");
    
    // Add a field to each step
    await page.getByRole("button", { name: "Personal" }).click();
    let canvas = page.getByText("Drag components from the palette");
    await page.getByRole("button", { name: "Text Input" }).dragTo(canvas);
    
    await page.getByRole("button", { name: "Step 2" }).click();
    canvas = page.getByText("Drop components here");
    await page.getByRole("button", { name: "Email" }).dragTo(canvas);
    
    // Check JSON Schema tab
    await page.getByRole("tab", { name: "JSON Schema" }).click();
    const jsonOutput = page.locator("pre").first();
    
    // Verify steps array is present
    await expect(jsonOutput).toContainText('"steps"');
    await expect(jsonOutput).toContainText('"title": "Personal"');
    await expect(jsonOutput).toContainText('"title": "Step 2"');
    
    // Verify stepGroup in field properties
    await expect(jsonOutput).toContainText('"stepGroup": 0');
    await expect(jsonOutput).toContainText('"stepGroup": 1');
  });

  test("should assign field to different step via edit dialog", async ({ page }) => {
    // Add steps
    await page.getByRole("button", { name: "Add Step" }).click();
    
    // Add a field to Step 1
    await page.getByRole("button", { name: "Step 1" }).click();
    const canvas = page.getByText("Drag components from the palette");
    await page.getByRole("button", { name: "Text Input" }).dragTo(canvas);
    
    // Open edit dialog
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    
    // Should see Step dropdown (combobox)
    await expect(page.getByRole("combobox", { name: "Step" })).toBeVisible();
    
    // Change to Step 2
    await page.getByRole("combobox", { name: "Step" }).click();
    await page.getByRole("option", { name: "Step 2" }).click();
    
    // Save changes
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Field should no longer be visible in Step 1
    await expect(canvasArea.getByText("Text Field", { exact: true })).not.toBeVisible();
    await expect(page.getByText("Drop components here")).toBeVisible();
    
    // Switch to Step 2 - field should be there
    await page.getByRole("button", { name: "Step 2" }).click();
    await expect(canvasArea.getByText("Text Field", { exact: true })).toBeVisible();
  });

  test("should render multi-step form in preview with stepper UI", async ({ page }) => {
    // Create 2-step form with fields
    await page.getByRole("button", { name: "Add Step" }).click();
    
    // Add field to Step 1
    await page.getByRole("button", { name: "Step 1" }).click();
    let canvas = page.getByText("Drag components from the palette");
    await page.getByRole("button", { name: "Text Input" }).dragTo(canvas);
    
    // Add field to Step 2
    await page.getByRole("button", { name: "Step 2" }).click();
    canvas = page.getByText("Drop components here");
    await page.getByRole("button", { name: "Email" }).dragTo(canvas);
    
    // Go to Preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    
    // Get the form preview card area
    const formCard = page.locator('[class*="rounded-lg"][class*="border"][class*="bg-card"]');
    
    // Should see stepper UI with step indicators
    await expect(formCard.getByText("Step 1 of 2")).toBeVisible();
    
    // Should see step indicator buttons (1 and 2) - using exact match
    await expect(formCard.getByRole("button", { name: "1", exact: true })).toBeVisible();
    await expect(formCard.getByRole("button", { name: "2", exact: true })).toBeVisible();
    
    // Should see "Next" button (not "Submit")
    await expect(formCard.getByRole("button", { name: "Next" })).toBeVisible();
    
    // Should see "Back" button (disabled on first step)
    const backButton = formCard.getByRole("button", { name: "Back" });
    await expect(backButton).toBeVisible();
    await expect(backButton).toBeDisabled();
  });

  test("should navigate between steps in preview", async ({ page }) => {
    // Create 2-step form with fields
    await page.getByRole("button", { name: "Add Step" }).click();
    
    // Add field to Step 1 and edit label
    await page.getByRole("button", { name: "Step 1" }).click();
    let canvas = page.getByText("Drag components from the palette");
    await page.getByRole("button", { name: "Text Input" }).dragTo(canvas);
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    await page.getByLabel("Label *").fill("Name");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Add field to Step 2 and edit label
    await page.getByRole("button", { name: "Step 2" }).click();
    canvas = page.getByText("Drop components here");
    await page.getByRole("button", { name: "Email" }).dragTo(canvas);
    const emailField = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Email" }).first();
    await emailField.hover();
    await emailField.locator('button').first().click();
    await page.getByLabel("Label *").fill("Email Address");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Go to Preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    
    // Get the form preview card area
    const formCard = page.locator('[class*="rounded-lg"][class*="border"][class*="bg-card"]');
    
    // Should be on Step 1 with Name field
    await expect(formCard.getByText("Step 1 of 2")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    
    // Fill in Step 1 and click Next
    await page.getByLabel("Name").fill("John Doe");
    await formCard.getByRole("button", { name: "Next" }).click();
    
    // Should now be on Step 2
    await expect(formCard.getByText("Step 2 of 2")).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    
    // Back button should now be enabled
    const backButton = formCard.getByRole("button", { name: "Back" });
    await expect(backButton).toBeEnabled();
    
    // Should see Submit button on last step
    await expect(formCard.getByRole("button", { name: "Submit" })).toBeVisible();
  });

  test("should accumulate values across steps on final submit", async ({ page }) => {
    // Create 2-step form with different fields
    await page.getByRole("button", { name: "Add Step" }).click();
    
    // Add text field to Step 1
    await page.getByRole("button", { name: "Step 1" }).click();
    let canvas = page.getByText("Drag components from the palette");
    await page.getByRole("button", { name: "Text Input" }).dragTo(canvas);
    
    // Edit Step 1 field label
    const canvasArea = page.locator('[class*="border-dashed"]');
    let fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    await page.getByLabel("Label *").fill("Username");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Add number field to Step 2
    await page.getByRole("button", { name: "Step 2" }).click();
    canvas = page.getByText("Drop components here");
    await page.getByRole("button", { name: "Number", exact: true }).dragTo(canvas);
    
    // Edit Step 2 field label
    fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Number" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    await page.getByLabel("Label *").fill("Age");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Go to Preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    
    // Get the form preview card area
    const formCard = page.locator('[class*="rounded-lg"][class*="border"][class*="bg-card"]');
    
    // Fill Step 1 and go to Step 2
    await page.getByLabel("Username").fill("johndoe");
    await formCard.getByRole("button", { name: "Next" }).click();
    
    // Fill Step 2 and submit
    await page.getByLabel("Age").fill("30");
    await formCard.getByRole("button", { name: "Submit" }).click();
    
    // Should see submitted values with BOTH fields
    await expect(page.getByRole("heading", { name: "Submitted Values" })).toBeVisible();
    await expect(page.getByText("johndoe")).toBeVisible();
    await expect(page.getByText("30")).toBeVisible();
  });

  test("existing single-step form works without step UI", async ({ page }) => {
    // Add fields WITHOUT adding steps
    const canvas = page.getByText("Drop components here");
    await page.getByRole("button", { name: "Text Input" }).dragTo(canvas);
    
    // Go to Preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    
    // Should NOT see stepper UI
    await expect(page.getByText("Step 1 of")).not.toBeVisible();
    
    // Should see Submit button directly (not Next step button)
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
    // Should NOT see the stepper's Next button (but Next.js dev tools has a "Next" button so we check the form area)
    const formCard = page.locator('[class*="bg-card"]');
    await expect(formCard.getByRole("button", { name: "Next" })).not.toBeVisible();
    
    // Form should work normally
    await page.getByLabel("Text Field").fill("Test Value");
    await page.getByRole("button", { name: "Submit" }).click();
    
    // Should see submitted values
    await expect(page.getByRole("heading", { name: "Submitted Values" })).toBeVisible();
    await expect(page.getByText("Test Value")).toBeVisible();
  });

  test("should allow clicking step indicators to navigate only to completed steps", async ({ page }) => {
    // Create 3-step form
    await page.getByRole("button", { name: "Add Step" }).click();
    await page.getByRole("button", { name: "Add Step" }).click();
    
    // Add fields to each step
    await page.getByRole("button", { name: "Step 1" }).click();
    let canvas = page.getByText("Drag components from the palette");
    await page.getByRole("button", { name: "Text Input" }).dragTo(canvas);
    
    await page.getByRole("button", { name: "Step 2" }).click();
    canvas = page.getByText("Drop components here");
    await page.getByRole("button", { name: "Email" }).dragTo(canvas);
    
    await page.getByRole("button", { name: "Step 3" }).click();
    canvas = page.getByText("Drop components here");
    await page.getByRole("button", { name: "Number", exact: true }).dragTo(canvas);
    
    // Go to Preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    
    // Get the form preview card area
    const formCard = page.locator('[class*="rounded-lg"][class*="border"][class*="bg-card"]');
    
    // Should be on Step 1
    await expect(formCard.getByText("Step 1 of 3")).toBeVisible();
    
    // Try to click step 3 indicator - should NOT navigate (step not completed)
    await formCard.getByRole("button", { name: "3", exact: true }).click();
    
    // Should still be on Step 1 (cannot skip ahead)
    await expect(formCard.getByText("Step 1 of 3")).toBeVisible();
    
    // Fill step 1 and proceed to step 2
    await formCard.getByLabel("Text").fill("Test Value");
    await formCard.getByRole("button", { name: "Next" }).click();
    
    // Should be on Step 2
    await expect(formCard.getByText("Step 2 of 3")).toBeVisible();
    
    // Now step 1 is completed, clicking step 1 indicator should work
    await formCard.getByRole("button", { name: "1", exact: true }).click();
    
    // Should be back on Step 1
    await expect(formCard.getByText("Step 1 of 3")).toBeVisible();
    
    // Click step 2 indicator to go forward again (step 1 is completed, step 2 was visited)
    await formCard.getByRole("button", { name: "2", exact: true }).click();
    
    // Should be on Step 2
    await expect(formCard.getByText("Step 2 of 3")).toBeVisible();
  });
});

