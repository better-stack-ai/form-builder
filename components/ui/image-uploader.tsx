"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, X, Loader2 } from "lucide-react";
import type { AutoFormInputComponentProps } from "@/components/ui/auto-form/types";
import AutoFormLabel from "@/components/ui/auto-form/common/label";
import AutoFormTooltip from "@/components/ui/auto-form/common/tooltip";
import {
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface ImageUploaderProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * ImageUploader - An image upload component that simulates cloud upload
 * 
 * This is an example component demonstrating how image uploads could work.
 * In a real app, you would replace the simulated upload with actual cloud storage logic.
 * The value stored is the URL returned from the upload.
 */
export function ImageUploader({
  value,
  onChange,
  className,
  disabled = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadingName, setUploadingName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadingName(file.name);

    // Simulate upload delay (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // In a real app, you would upload to cloud storage here and get the URL back
    // For demo purposes, we return a placeholder image URL
    const fakeUrl = "https://placehold.co/600x400";
    
    setIsUploading(false);
    setUploadingName(null);
    onChange?.(fakeUrl);
  };

  const handleRemove = () => {
    onChange?.("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Show image preview if we have a value
  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative rounded-md border border-input overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-auto max-h-48 object-contain"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
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
        accept="image/*"
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="w-full h-32 flex-col gap-2 border-dashed"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Uploading {uploadingName}...
            </span>
          </>
        ) : (
          <>
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload image
            </span>
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * AutoFormImageUploader - Wrapper for use with AutoForm
 * 
 * This component wraps the ImageUploader to work with AutoForm's field system.
 */
export function AutoFormImageUploader({
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
        <ImageUploader
          value={field.value || ""}
          onChange={field.onChange}
        />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}

export default ImageUploader;
