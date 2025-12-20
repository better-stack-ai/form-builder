"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";
import AutoFormLabel from "@/components/ui/auto-form/common/label";
import AutoFormTooltip from "@/components/ui/auto-form/common/tooltip";
import {
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

// Preset color swatches
const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
  "#000000", // black
  "#ffffff", // white
] as const;

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * ColorPicker - A color picker component with preset swatches and hex input
 */
export function ColorPicker({
  value = "#3b82f6",
  onChange,
  className,
  disabled = false,
}: ColorPickerProps) {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleColorChange = (newColor: string) => {
    setLocalValue(newColor);
    onChange?.(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    // Only call onChange if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange?.(newValue);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div
            className="mr-2 h-4 w-4 rounded border border-border"
            style={{ backgroundColor: localValue }}
          />
          <span className="flex-1 truncate">{localValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Color Picker
            </Label>
            <Input
              type="color"
              value={localValue}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-10 w-full cursor-pointer p-1"
              disabled={disabled}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Preset Colors
            </Label>
            <div className="grid grid-cols-6 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "h-6 w-6 rounded border border-border transition-transform hover:scale-110",
                    localValue === color && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  disabled={disabled}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Hex Value</Label>
            <Input
              type="text"
              value={localValue}
              onChange={handleInputChange}
              placeholder="#000000"
              className="font-mono"
              disabled={disabled}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * AutoFormColorPicker - Wrapper for use with AutoForm
 * 
 * This component wraps the ColorPicker to work with AutoForm's field system.
 * It demonstrates how to create custom form components that integrate with
 * the auto-form and form-builder systems.
 */
export function AutoFormColorPicker({
  field,
  fieldConfigItem,
  label,
  isRequired,
}: AutoFormInputComponentProps) {
  return (
    <FormItem>
      <AutoFormLabel 
        label={fieldConfigItem?.label || label} 
        isRequired={isRequired} 
      />
      <FormControl>
        <ColorPicker
          value={field.value || "#3b82f6"}
          onChange={field.onChange}
        />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}

export default ColorPicker;
