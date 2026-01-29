"use client";

import React, { useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button>;

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function ColorPicker({
  value,
  onChange,
  onBlur,
  className,
  size,
  ...props
}: Omit<ButtonProps, "value" | "onChange" | "onBlur"> & ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const parsedValue = useMemo(() => {
    if (!value) return "#6366f1";
    return value.startsWith("#") ? value : `#${value}`;
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onBlur={onBlur}>
        <Button
          {...props}
          size={size}
          className={cn("h-8 w-8 rounded-xl border", className)}
          style={{ backgroundColor: parsedValue }}
          type="button"
          onClick={() => setOpen(true)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-3" align="start">
        <HexColorPicker color={parsedValue} onChange={onChange} />
        <Input
          value={parsedValue}
          onChange={(event) => onChange(event.currentTarget.value)}
          maxLength={7}
          className="h-9 text-xs"
        />
      </PopoverContent>
    </Popover>
  );
}
