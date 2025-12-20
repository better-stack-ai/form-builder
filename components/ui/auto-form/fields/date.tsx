import { DatePicker } from "@/components/ui/date-picker";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import AutoFormLabel from "../common/label";
import AutoFormTooltip from "../common/tooltip";
import type { AutoFormInputComponentProps } from "../types";

/**
 * Convert a value to a Date object if needed.
 * Handles both Date objects (from z.date()) and ISO strings (from z.fromJSONSchema with format: date-time)
 */
function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

export default function AutoFormDate({
  label,
  isRequired,
  field,
  fieldConfigItem,
  fieldProps,
}: AutoFormInputComponentProps) {
  // Determine if the underlying schema expects a string (ISO format) or Date
  // This is detected by checking if the current value is a string
  const expectsString = typeof field.value === "string" || field.value === undefined;
  
  const handleChange = (date: Date | undefined) => {
    if (!date) {
      field.onChange(undefined);
      return;
    }
    // If the form expects a string (from JSON Schema), convert to ISO string
    // Otherwise, keep as Date object (from native z.date())
    if (expectsString) {
      field.onChange(date.toISOString());
    } else {
      field.onChange(date);
    }
  };

  return (
    <FormItem>
      <AutoFormLabel
        label={fieldConfigItem?.label || label}
        isRequired={isRequired}
      />
      <FormControl>
        <DatePicker
          date={toDate(field.value)}
          setDate={handleChange}
          {...fieldProps}
        />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />

      <FormMessage />
    </FormItem>
  );
}
