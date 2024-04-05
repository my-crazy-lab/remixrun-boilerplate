import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export const timezones = [
  {
    id: "Asia/Ho_Chi_Minh",
    name: "Asia/Ho Chi Minh",
    offset: "UTC+07:00",
    nOffset: 420
  },
  {
    id: "Asia/Bangkok",
    name: "Asia/Bangkok",
    offset: "UTC+07:00",
    nOffset: 420
  }
]

export default function TimezoneSwitcher() {
  const handleSelect = (option: string) => {
    // TODO add logic for set timezone
  };

  return (
    <Select
      defaultValue={`${timezones[0].id}`}
      onValueChange={value => handleSelect(value)}
    >
      <SelectTrigger className="h-10 w-[180px]">
        <SelectValue placeholder={`${timezones[0].name}`} />
      </SelectTrigger>
      <SelectContent side="top">
        {timezones.map(timezone => (
          <SelectItem key={timezone.id} value={`${timezone.id}`}>
            {timezone.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}