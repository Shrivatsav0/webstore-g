"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CInputProps {
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  name?: string;
}

export function CInput({
  label,
  value,
  onChange,
  placeholder = " ",
  type = "text",
  required,
  textarea = false,
  name,
}: CInputProps) {
  const id = useId();

  return (
    <div className="group relative w-full">
      <label
        htmlFor={id}
        className="origin-start text-muted-foreground/70 absolute top-1/2 left-2 -translate-y-1/2 cursor-text px-1 text-sm transition-all
        group-focus-within:top-0 group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground
        has-[input:not(:placeholder-shown)]:top-0 has-[input:not(:placeholder-shown)]:text-xs has-[input:not(:placeholder-shown)]:font-medium
        has-[textarea:not(:placeholder-shown)]:top-0 has-[textarea:not(:placeholder-shown)]:text-xs has-[textarea:not(:placeholder-shown)]:font-medium"
      >
        {/* <span className="bg-card inline-flex px-2 rounded-sm">{label}</span> */}
      </label>
      {textarea ? (
        <Textarea
          id={id}
          className="input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          name={name}
        />
      ) : (
        <Input
          id={id}
          className="input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={type}
          name={name}
        />
      )}
    </div>
  );
}
