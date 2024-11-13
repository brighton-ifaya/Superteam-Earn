import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { isEditingAtom, isGodAtom } from '../../atoms';
import { useListingForm } from '../../hooks';

const deadlineOptions = [
  { label: '1 Week', value: 7 },
  { label: '2 Weeks', value: 14 },
  { label: '3 Weeks', value: 21 },
];

export const DEADLINE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

export function Deadline() {
  const form = useListingForm();
  const deadline = useWatch({
    name: 'deadline',
    control: form.control,
  });

  const [maxDeadline, setMaxDeadline] = useState<Date | undefined>(undefined);
  const [minDeadline, setMinDeadline] = useState<Date | undefined>(new Date());

  const editable = useAtomValue(isEditingAtom);
  const isGod = useAtomValue(isGodAtom);

  useEffect(() => {
    if (editable && deadline) {
      const originalDeadline = dayjs(deadline);
      const twoWeeksLater = originalDeadline.add(2, 'weeks');
      setMaxDeadline(twoWeeksLater.toDate());
    }
  }, [editable]);

  useEffect(() => {
    if (isGod) setMinDeadline(undefined);
    else setMinDeadline(new Date());
  }, [isGod]);

  const handleDeadlineSelection = (days: number) => {
    return dayjs().add(days, 'day').format(DEADLINE_FORMAT);
  };

  useEffect(() => {
    // TODO: Debug why zod default for deadline specifically is not working
    if (form) {
      if (!deadline)
        form.setValue('deadline', handleDeadlineSelection(Number(7)));
    }
  }, [form]);

  return (
    <FormField
      name="deadline"
      control={form.control}
      render={({ field }) => {
        return (
          <FormItem className="gap-2">
            <FormLabel className="">
              Deadline (in {Intl.DateTimeFormat().resolvedOptions().timeZone})
            </FormLabel>
            <div className="flex rounded-md border ring-primary has-[:focus]:ring-1 has-[data-[state=open]]:ring-1">
              <DateTimePicker
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => {
                  console.log('DateTimePicker date', date);
                  if (date) {
                    const formattedDate = dayjs(date).format(DEADLINE_FORMAT);
                    field.onChange(formattedDate);
                  } else {
                    field.onChange(undefined);
                  }
                  form.onChange();
                }}
                use12HourFormat
                hideSeconds
                max={maxDeadline ? maxDeadline : undefined}
                min={minDeadline ? minDeadline : undefined}
                classNames={{
                  trigger: 'border-0',
                }}
              />
              <Select
                onValueChange={(data) => {
                  field.onChange(handleDeadlineSelection(Number(data)));
                }}
                defaultValue={'7'}
              >
                <SelectTrigger className="w-32 rounded-none border-0 border-l focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deadlineOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value + ''}>
                      <div className="flex items-center gap-2 pl-2 text-xs text-slate-500">
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
