// Kebab-case id from a field name, e.g. "firstName" -> "field-first-name".
function fieldIdentifier(fieldName: string): string {
  return "field-" + fieldName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

// Native input for server-rendered forms. Astryx TextInput is controlled and needs
// client state, which these uncontrolled form posts do not need.
type FieldProperties = {
  label: string;
  name: string;
  type?: "text" | "email" | "number" | "url" | "tel";
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  hint?: string;
  step?: string;
  min?: number;
  max?: number;
  maxLength?: number;
};

export function Field({ label, hint, ...inputProperties }: FieldProperties) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {inputProperties.required && <span className="field__required"> *</span>}
      </span>
      <input {...inputProperties} className="field__control" id={fieldIdentifier(inputProperties.name)} />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <textarea
        name={name}
        id={fieldIdentifier(name)}
        defaultValue={defaultValue}
        rows={3}
        className="field__control field__control--textarea"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select
        name={name}
        id={fieldIdentifier(name)}
        defaultValue={defaultValue}
        className="field__control field__control--select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
