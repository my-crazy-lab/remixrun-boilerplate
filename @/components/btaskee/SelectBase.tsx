import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectBaseProps {
  onValueChange: (value: string) => void;
  defaultValue: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

const SelectBase: React.FC<SelectBaseProps> = ({
  onValueChange,
  defaultValue,
  options,
  placeholder,
}) => (
  <Select onValueChange={onValueChange} defaultValue={defaultValue}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map(option => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default SelectBase;
