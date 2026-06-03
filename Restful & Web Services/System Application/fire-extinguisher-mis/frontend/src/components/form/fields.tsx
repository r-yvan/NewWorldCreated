import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { Option } from "@/constants/enums";

function FieldError({ name }: { name: string }) {
  const [, meta] = useField(name);
  if (!meta.touched || !meta.error) return null;
  return <p className="text-xs font-medium text-destructive">{meta.error}</p>;
}

function FieldWrapper({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      <FieldError name={name} />
    </div>
  );
}

export function TextField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const [field, meta] = useField(name);
  return (
    <FieldWrapper label={label} name={name} required={required}>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        invalid={meta.touched && !!meta.error}
        {...field}
        value={field.value ?? ""}
      />
    </FieldWrapper>
  );
}

export function TextareaField({
  label,
  name,
  placeholder,
  required,
  rows = 3,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  const [field, meta] = useField(name);
  return (
    <FieldWrapper label={label} name={name} required={required}>
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        invalid={meta.touched && !!meta.error}
        {...field}
        value={field.value ?? ""}
      />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  name,
  options,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  options: Option[];
  required?: boolean;
  placeholder?: string;
}) {
  const [field, meta] = useField(name);
  return (
    <FieldWrapper label={label} name={name} required={required}>
      <Select
        id={name}
        invalid={meta.touched && !!meta.error}
        {...field}
        value={field.value ?? ""}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </FieldWrapper>
  );
}
