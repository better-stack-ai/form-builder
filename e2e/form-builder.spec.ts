import { test, expect, type Page } from "@playwright/test";

test.describe("Form Builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("should display the form builder UI", async ({ page }) => {
    // Check Components section in the palette
    await expect(page.getByRole("heading", { name: "Components" })).toBeVisible();
    
    // Check palette items
    await expect(page.getByRole("button", { name: "Text Input" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Email", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Number", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Checkbox", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Date Picker" })).toBeVisible();
    
    // Check empty canvas message
    await expect(page.getByText("Drop components here")).toBeVisible();
    
    // Check right panel tabs
    await expect(page.getByRole("tab", { name: "Preview" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "JSON Schema" })).toBeVisible();
  });

  test("should drag component from palette to canvas", async ({ page }) => {
    // Drag Text Input to canvas
    const textInputBtn = page.getByRole("button", { name: "Text Input" });
    const canvas = page.getByText("Drop components here");
    
    await textInputBtn.dragTo(canvas);
    
    // Verify field was added - use first() to avoid strict mode issues
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
  });

  test("should edit field properties via dialog", async ({ page }) => {
    // Add a text field first
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    
    // Wait for field to be added
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Click edit button on the field
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await fieldRow.hover();
    
    // Click the edit button (first button with pencil icon)
    await fieldRow.locator('button').first().click();
    
    // Dialog should open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Edit Text Input/ })).toBeVisible();
    
    // Edit label
    const labelInput = page.getByLabel("Label *");
    await labelInput.fill("Full Name");
    
    // Edit placeholder
    const placeholderInput = page.getByLabel("Placeholder");
    await placeholderInput.fill("Enter your full name");
    
    // Save changes
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Verify dialog closed
    await expect(page.getByRole("dialog")).not.toBeVisible();
    
    // Verify the label updated in the canvas
    await expect(page.getByText("Full Name", { exact: true }).first()).toBeVisible();
  });

  test("should edit field name via dialog", async ({ page }) => {
    // Add a text field first
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    
    // Wait for field to be added
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Click edit button on the field
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    
    // Dialog should open
    await expect(page.getByRole("dialog")).toBeVisible();
    
    // Edit field name
    const fieldNameInput = page.getByLabel("Field Name");
    await fieldNameInput.fill("customFieldName");
    
    // Save changes
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Verify dialog closed
    await expect(page.getByRole("dialog")).not.toBeVisible();
    
    // Check JSON Schema tab to verify field name changed
    await page.getByRole("tab", { name: "JSON Schema" }).click();
    const jsonOutput = page.locator("pre").first();
    await expect(jsonOutput).toContainText('"customFieldName"');
  });

  test("should add multiple fields and reorder them", async ({ page }) => {
    // Add Text Input
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    
    // Wait for first field to be added
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Add Email - it should be added below the first field
    const emailBtn = page.getByRole("button", { name: "Email" });
    const canvasArea = page.locator('[class*="border-dashed"]');
    await emailBtn.dragTo(canvasArea);
    
    // Verify both fields are visible
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Email", { exact: true }).first()).toBeVisible();
  });

  test("should delete a field", async ({ page }) => {
    // Add a field
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    
    // Wait for field to be added
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Find and click the delete button (Trash icon)
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await fieldRow.hover();
    
    // Click the delete button (second button in the actions)
    await fieldRow.locator('button').nth(1).click();
    
    // Verify field was removed
    await expect(page.getByText("Drop components here")).toBeVisible();
  });

  test("should show form preview in the Preview tab", async ({ page }) => {
    // Add a field
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Preview tab should already be visible (default tab)
    await page.getByRole("tab", { name: "Preview" }).click();
    
    // Check preview UI in the right panel
    await expect(page.getByRole("heading", { name: "Form Preview" })).toBeVisible();
    await expect(page.getByLabel("Text Field")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  });

  test("should submit form in preview tab and display values", async ({ page }) => {
    // Add a text field
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Edit the label via dialog
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    await page.getByLabel("Label *").fill("Name");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Go to Preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    
    // Fill and submit the form
    await page.getByLabel("Name").fill("John Doe");
    await page.getByRole("button", { name: "Submit" }).click();
    
    // Verify submitted values are displayed
    await expect(page.getByRole("heading", { name: "Submitted Values" })).toBeVisible();
    await expect(page.getByText("John Doe")).toBeVisible();
    
    // Test "Try Again" button
    await page.getByRole("button", { name: "Try Again" }).click();
    await expect(page.getByRole("heading", { name: "Form Preview" })).toBeVisible();
  });

  test("should output valid JSON Schema in JSON Schema tab", async ({ page }) => {
    // Add a text field
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Edit label via dialog
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    await page.getByLabel("Label *").fill("Username");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Click JSON Schema tab
    await page.getByRole("tab", { name: "JSON Schema" }).click();
    
    // Check that the JSON Schema contains expected properties
    const jsonOutput = page.locator("pre").first();
    await expect(jsonOutput).toContainText('"type": "object"');
    await expect(jsonOutput).toContainText('"type": "string"');
    await expect(jsonOutput).toContainText('"label": "Username"');
  });

  test("should add select field with options", async ({ page }) => {
    // Add a select field
    await page.getByRole("button", { name: "Select" }).dragTo(page.getByText("Drop components here"));
    
    // Verify select field was added
    await expect(page.getByText("Select Field", { exact: true }).first()).toBeVisible();
    
    // Edit the select field
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Select" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    
    // The options textarea should have default options
    const optionsTextarea = page.getByLabel(/Options/);
    await expect(optionsTextarea).toBeVisible();
    
    // Edit options
    await optionsTextarea.fill("Red\nGreen\nBlue");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Switch to preview tab and verify the select works
    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(page.getByRole("heading", { name: "Form Preview" })).toBeVisible();
  });

  test("should add checkbox field", async ({ page }) => {
    // Add a checkbox field
    await page.getByRole("button", { name: "Checkbox" }).dragTo(page.getByText("Drop components here"));
    
    // Verify checkbox field was added
    await expect(page.getByText("Checkbox", { exact: true }).first()).toBeVisible();
    
    // Edit label via dialog
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Checkbox" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    await page.getByLabel("Label *").fill("Accept Terms");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Switch to preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    
    // Verify checkbox is in the form
    await expect(page.getByRole("checkbox")).toBeVisible();
  });

  test("should select fields by clicking", async ({ page }) => {
    // Add two fields
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Add Email field
    const canvasArea = page.locator('[class*="border-dashed"]');
    await page.getByRole("button", { name: "Email" }).dragTo(canvasArea);
    await expect(page.getByText("Email", { exact: true }).first()).toBeVisible();
    
    // Click on the Text Field to select it (should have ring highlight)
    const textFieldItem = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Input" }).first();
    await textFieldItem.click();
    
    // Verify the field is selected (has ring-2 class)
    await expect(textFieldItem).toHaveClass(/ring-2/);
    
    // Click on Email field to switch selection
    const emailFieldItem = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: /^Email/ }).first();
    await emailFieldItem.click();
    
    // Verify Email field is now selected
    await expect(emailFieldItem).toHaveClass(/ring-2/);
  });

  test("should set min/max on number field as proper numbers", async ({ page }) => {
    // Add a number field
    await page.getByRole("button", { name: "Number", exact: true }).dragTo(page.getByText("Drop components here"));
    
    // Wait for field to be added
    await expect(page.getByText("Number", { exact: true }).first()).toBeVisible();
    
    // Edit the field via dialog
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Number" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    
    // Set minimum and maximum values
    await page.getByLabel("Minimum").fill("10");
    await page.getByLabel("Maximum").fill("100");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Click JSON Schema tab
    await page.getByRole("tab", { name: "JSON Schema" }).click();
    
    // Verify the JSON has proper number values (not strings)
    const jsonOutput = page.locator("pre").first();
    await expect(jsonOutput).toContainText('"minimum": 10');
    await expect(jsonOutput).toContainText('"maximum": 100');
    
    // Make sure they're not strings (no quotes around numbers)
    const jsonText = await jsonOutput.textContent();
    expect(jsonText).not.toContain('"minimum": "10"');
    expect(jsonText).not.toContain('"maximum": "100"');
  });

  test("should validate min/max in preview tab", async ({ page }) => {
    // Add a number field
    await page.getByRole("button", { name: "Number", exact: true }).dragTo(page.getByText("Drop components here"));
    
    // Wait for field to be added
    await expect(page.getByText("Number", { exact: true }).first()).toBeVisible();
    
    // Edit the field via dialog
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Number" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    
    // Set label and min/max values
    await page.getByLabel("Label *").fill("Age");
    await page.getByLabel("Minimum").fill("18");
    await page.getByLabel("Maximum").fill("120");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Go to Preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(page.getByRole("heading", { name: "Form Preview" })).toBeVisible();
    
    // Enter a value below minimum
    await page.getByLabel("Age").fill("10");
    await page.getByRole("button", { name: "Submit" }).click();
    
    // Should show validation error
    await expect(page.getByText(/Too small|>=18/)).toBeVisible();
    
    // Enter a valid value
    await page.getByLabel("Age").fill("25");
    await page.getByRole("button", { name: "Submit" }).click();
    
    // Should show submitted values
    await expect(page.getByRole("heading", { name: "Submitted Values" })).toBeVisible();
  });

  test("should set minLength/maxLength on text field", async ({ page }) => {
    // Add a text field
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    
    // Wait for field to be added
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Edit the field via dialog
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Text Field" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    
    // Set min and max length
    await page.getByLabel("Min Length").fill("5");
    await page.getByLabel("Max Length").fill("50");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Click JSON Schema tab
    await page.getByRole("tab", { name: "JSON Schema" }).click();
    
    // Verify the JSON has proper number values
    const jsonOutput = page.locator("pre").first();
    await expect(jsonOutput).toContainText('"minLength": 5');
    await expect(jsonOutput).toContainText('"maxLength": 50');
  });

  test("should add date picker field with correct JSON Schema format", async ({ page }) => {
    // Add a date field
    await page.getByRole("button", { name: "Date Picker" }).dragTo(page.getByText("Drop components here"));
    
    // Verify date field was added
    await expect(page.getByText("Date Picker", { exact: true }).first()).toBeVisible();
    
    // Edit label via dialog
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Date" }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    await page.getByLabel("Label *").fill("Birth Date");
    await page.getByLabel("Description").fill("Your date of birth");
    await page.getByRole("button", { name: "Save Changes" }).click();
    
    // Click JSON Schema tab
    await page.getByRole("tab", { name: "JSON Schema" }).click();
    
    // Verify the JSON Schema has correct date-time format
    const jsonOutput = page.locator("pre").first();
    await expect(jsonOutput).toContainText('"type": "string"');
    await expect(jsonOutput).toContainText('"format": "date-time"');
    await expect(jsonOutput).toContainText('"fieldType": "date"');
    await expect(jsonOutput).toContainText('"label": "Birth Date"');
    await expect(jsonOutput).toContainText('"description": "Your date of birth"');
  });

  test("should use date picker in preview tab", async ({ page }) => {
    // Add a date field
    await page.getByRole("button", { name: "Date Picker" }).dragTo(page.getByText("Drop components here"));
    
    // Verify date field was added
    await expect(page.getByText("Date Picker", { exact: true }).first()).toBeVisible();
    
    // Switch to preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(page.getByRole("heading", { name: "Form Preview" })).toBeVisible();
    
    // Verify date picker button is visible
    const datePickerButton = page.getByRole("button", { name: "Pick a date" });
    await expect(datePickerButton).toBeVisible();
    
    // Click to open the calendar
    await datePickerButton.click();
    
    // Verify calendar dialog opens
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("grid")).toBeVisible();
    
    // Select a date (today)
    const todayButton = page.getByRole("button", { name: /Today/ });
    if (await todayButton.isVisible()) {
      await todayButton.click();
    } else {
      // Click the first available date button in the calendar
      await page.locator('[role="gridcell"] button').first().click();
    }
    
    // Verify the date picker button text changed (no longer "Pick a date")
    await expect(page.getByRole("button", { name: "Pick a date" })).not.toBeVisible();
  });
});

test.describe("Form Builder - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should work on mobile viewport", async ({ page }) => {
    await page.goto("/builder");
    
    // Check UI is visible
    await expect(page.getByRole("button", { name: "Text Input" })).toBeVisible();
    
    // Add a field
    await page.getByRole("button", { name: "Text Input" }).dragTo(page.getByText("Drop components here"));
    
    // Verify field was added
    await expect(page.getByText("Text Field", { exact: true }).first()).toBeVisible();
    
    // Switch to preview tab
    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(page.getByRole("heading", { name: "Form Preview" })).toBeVisible();
  });
});

test.describe("Form Builder - Complete Form Creation", () => {
  // Helper to edit a field via dialog
  async function editField(page: Page, fieldText: string, config: Record<string, string>) {
    const canvasArea = page.locator('[class*="border-dashed"]');
    const fieldRow = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: fieldText }).first();
    await fieldRow.hover();
    await fieldRow.locator('button').first().click();
    
    // Wait for dialog
    await expect(page.getByRole("dialog")).toBeVisible();
    
    // Configure properties
    for (const [label, value] of Object.entries(config)) {
      const input = page.getByLabel(label);
      if (label === "Required" || label === "Default Value") {
        // Toggle checkboxes/switches
        await input.click();
      } else {
        await input.fill(value);
      }
    }
    
    // Save
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }

  test("should create a complete registration form matching target schema", async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for this large test
    await page.goto("/builder");
    
    const canvas = page.getByText("Drop components here");
    const canvasArea = page.locator('[class*="border-dashed"]');
    
    // Helper to add a field
    async function addField(buttonName: string) {
      const paletteButton = page.getByRole("button", { name: buttonName, exact: true });
      if (await canvas.isVisible()) {
        await paletteButton.dragTo(canvas);
      } else {
        await paletteButton.dragTo(canvasArea);
      }
      // Wait a moment for the field to be added
      await page.waitForTimeout(200);
    }
    
    // 1. Username field (Text Input with minLength)
    await addField("Text Input");
    await editField(page, "Text Field", {
      "Label *": "User Name",
      "Description": "Your unique username for the platform",
      "Placeholder": "johndoe",
      "Min Length": "2",
      "Required": "true"
    });
    
    // 2. Email field
    await addField("Email");
    await editField(page, "Email", {
      "Label *": "Email",
      "Description": "We'll never share your email",
      "Placeholder": "john@example.com",
      "Required": "true"
    });
    
    // 3. Password field
    await addField("Password");
    await editField(page, "Password", {
      "Label *": "Password",
      "Description": "At least 8 characters",
      "Placeholder": "••••••••",
      "Min Length": "8",
      "Required": "true"
    });
    
    // 4. Bio field (Textarea)
    await addField("Text Area");
    await editField(page, "Text Area", {
      "Label *": "Bio",
      "Description": "Tell us about yourself",
      "Placeholder": "I'm a software developer who loves..."
    });
    
    // 5. Age field (Number with min/max)
    await addField("Number");
    await editField(page, "Number", {
      "Label *": "Age",
      "Description": "Your current age",
      "Placeholder": "25",
      "Minimum": "0",
      "Maximum": "120"
    });
    
    // 6. Accept Terms (Checkbox)
    await addField("Checkbox");
    await editField(page, "Checkbox", {
      "Label *": "Accept Terms & Conditions",
      "Description": "You must accept to continue",
      "Required": "true"
    });
    
    // 7. Email Notifications (Switch with default true)
    await addField("Switch");
    await editField(page, "Switch", {
      "Label *": "Email Notifications",
      "Description": "Receive updates via email",
      "Required": "true",
      "Default Value": "true"
    });
    
    // 8. Birth Date (Date Picker)
    await addField("Date Picker");
    await editField(page, "Date Picker", {
      "Label *": "Birth Date",
      "Description": "Your date of birth"
    });
    
    // 9. Role (Select with options)
    await addField("Select");
    // Wait for the new field to appear with the default label
    await expect(canvasArea.getByText("Select Field", { exact: true }).last()).toBeVisible();
    // Find the new Select field by its default label (not yet edited)
    const roleSelectField = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Select Field" }).last();
    await roleSelectField.hover();
    await roleSelectField.locator('button').first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Label *").fill("Role");
    await page.getByLabel("Description").fill("Select your account role");
    await page.getByLabel("Placeholder").fill("Select a role");
    await page.getByLabel(/Options/).fill("admin\nuser\nmoderator\nguest");
    await page.getByLabel("Required").click();
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    
    // 10. Gender (Radio Group)
    await addField("Radio Group");
    await editField(page, "Radio Group", {
      "Label *": "Gender",
      "Description": "Select your gender",
      "Options (one per line)": "male\nfemale\nother\nprefer-not-to-say"
    });
    
    // 11. Country (Select with options) - use editField with specific text
    await addField("Select");
    // Wait for the new field to appear with the default label
    await expect(canvasArea.getByText("Select Field", { exact: true }).last()).toBeVisible();
    // Find the new Select field by its default label (not yet edited)
    const countrySelectField = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Select Field" }).last();
    await countrySelectField.hover();
    await countrySelectField.locator('button').first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Label *").fill("Country");
    await page.getByLabel("Description").fill("Where are you located?");
    await page.getByLabel("Placeholder").fill("Select a country");
    await page.getByLabel(/Options/).fill("usa\nuk\ncanada\naustralia\ngermany\nfrance\njapan");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    
    // 12. Preferred Language (Select with default value)
    await addField("Select");
    // Wait for the new field to appear with the default label
    await expect(canvasArea.getByText("Select Field", { exact: true }).last()).toBeVisible();
    // Find the new Select field by its default label (not yet edited)
    const langSelectField = canvasArea.locator('[class*="rounded-lg"]').filter({ hasText: "Select Field" }).last();
    await langSelectField.hover();
    await langSelectField.locator('button').first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Label *").fill("Preferred Language");
    await page.getByLabel("Description").fill("Your primary language");
    await page.getByLabel("Default Value").fill("english");
    await page.getByLabel(/Options/).fill("english\nspanish\nfrench\ngerman\njapanese\nmandarin");
    await page.getByLabel("Required").click();
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    
    // 13. Website (URL field)
    await addField("Website URL");
    await editField(page, "Website URL", {
      "Label *": "Website",
      "Description": "Your personal or portfolio website",
      "Placeholder": "https://example.com"
    });
    
    // 14. Phone (Phone field)
    await addField("Phone Number");
    await editField(page, "Phone Number", {
      "Label *": "Phone Number",
      "Description": "Your contact number",
      "Placeholder": "+1 (555) 123-4567"
    });
    
    // Verify JSON Schema output
    await page.getByRole("tab", { name: "JSON Schema" }).click();
    const jsonOutput = page.locator("pre").first();
    
    // Check key schema properties
    await expect(jsonOutput).toContainText('"type": "object"');
    
    // Check field types
    await expect(jsonOutput).toContainText('"label": "User Name"');
    await expect(jsonOutput).toContainText('"minLength": 2');
    await expect(jsonOutput).toContainText('"format": "email"');
    await expect(jsonOutput).toContainText('"label": "Password"');
    await expect(jsonOutput).toContainText('"minLength": 8');
    await expect(jsonOutput).toContainText('"fieldType": "textarea"');
    await expect(jsonOutput).toContainText('"label": "Age"');
    await expect(jsonOutput).toContainText('"minimum": 0');
    await expect(jsonOutput).toContainText('"maximum": 120');
    await expect(jsonOutput).toContainText('"label": "Accept Terms & Conditions"');
    await expect(jsonOutput).toContainText('"fieldType": "switch"');
    await expect(jsonOutput).toContainText('"label": "Birth Date"');
    await expect(jsonOutput).toContainText('"format": "date-time"');
    await expect(jsonOutput).toContainText('"fieldType": "date"');
    await expect(jsonOutput).toContainText('"fieldType": "radio"');
    await expect(jsonOutput).toContainText('"format": "uri"');
    await expect(jsonOutput).toContainText('"label": "Phone Number"');
    
    // Check enum values are present
    await expect(jsonOutput).toContainText('"admin"');
    await expect(jsonOutput).toContainText('"user"');
    await expect(jsonOutput).toContainText('"english"');
    
    // Check inputProps structure
    await expect(jsonOutput).toContainText('"inputProps"');
    await expect(jsonOutput).toContainText('"placeholder"');
    
    // Switch to preview tab and verify form renders
    await page.getByRole("tab", { name: "Preview" }).click();
    await expect(page.getByRole("heading", { name: "Form Preview" })).toBeVisible();
    
    // Verify some key form fields are rendered
    await expect(page.getByRole("textbox", { name: /User Name/ })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Email/ }).first()).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Password/ })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Bio/ })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: /Age/ })).toBeVisible();
    
    // Verify date picker is rendered
    await expect(page.getByRole("button", { name: "Pick a date" })).toBeVisible();
    
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  });
});
