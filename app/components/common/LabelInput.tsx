export default function LabelInput({
  label,
  id,
  type,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required: boolean;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-foreground/80 text-sm">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="
      px-4 py-3 rounded border border-foreground/20
      bg-background text-foreground
      focus:border-foreground/40 focus:outline-none
      transition-colors duration-300
      placeholder:text-foreground/40
    "
        placeholder={placeholder}
      />
    </div>
  );
}
