"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { File, X, Loader2 } from "lucide-react";
import type { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";
import AutoFormLabel from "@/components/ui/auto-form/common/label";
import AutoFormTooltip from "@/components/ui/auto-form/common/tooltip";
import {
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface FileUploaderProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  accept?: string;
}

/**
 * FileUploader - A file upload component that simulates cloud upload
 * 
 * This is an example component demonstrating how file uploads could work.
 * In a real app, you would replace the simulated upload with actual cloud storage logic.
 * The value stored is the URL returned from the upload.
 */
export function FileUploader({
  value,
  onChange,
  className,
  disabled = false,
  accept,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Extract filename from URL when value changes (for edit mode)
  React.useEffect(() => {
    if (value && !fileName) {
      // Try to extract filename from URL or use a default
      const urlParts = value.split("/");
      const lastPart = urlParts[urlParts.length - 1];
      // Remove query params if any
      const name = lastPart.split("?")[0];
      setFileName(name || "Uploaded file");
    }
  }, [value, fileName]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    // Simulate upload delay (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // In a real app, you would upload to cloud storage here and get the URL back
    // For demo purposes, we return a hardcoded URL with the filename
    const fakeUrl = `https://storage.example.com/uploads/${encodeURIComponent(file.name)}`;
    
    setIsUploading(false);
    onChange?.(fakeUrl);
  };

  const handleRemove = () => {
    setFileName(null);
    onChange?.("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Show file preview if we have a value
  if (value) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2",
          className
        )}
      >
        <File className="h-5 w-5 text-muted-foreground shrink-0" />
        <span className="flex-1 truncate text-sm">{fileName || "Uploaded file"}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Show upload button/loading state
  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        accept={accept}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="w-full justify-start"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading {fileName}...
          </>
        ) : (
          <>
            <File className="mr-2 h-4 w-4" />
            Choose file...
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * AutoFormFileUploader - Wrapper for use with AutoForm
 * 
 * This component wraps the FileUploader to work with AutoForm's field system.
 */
export function AutoFormFileUploader({
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
        <FileUploader
          value={field.value || ""}
          onChange={field.onChange}
        />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}

export default FileUploader;
