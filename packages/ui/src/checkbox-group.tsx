export interface CheckboxGroupOption {
  id: string;
  name: string;
}

export interface CheckboxGroupProps {
  label: string;
  options: CheckboxGroupOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function CheckboxGroup({ label, options, selectedIds, onChange, disabled }: CheckboxGroupProps) {
  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-1.5 text-sm text-slate-600">
            <input type="checkbox" disabled={disabled} checked={selectedIds.includes(option.id)} onChange={() => toggle(option.id)} />
            {option.name}
          </label>
        ))}
      </div>
    </div>
  );
}
