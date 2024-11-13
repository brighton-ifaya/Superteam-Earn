import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useListingForm } from '../../hooks';

export function POC() {
  const form = useListingForm();
  return (
    <FormField
      name="pocSocials"
      control={form?.control}
      render={({ field }) => {
        return (
          <FormItem className="gap-2">
            <FormLabel>Point of Contact</FormLabel>
            <FormControl>
              <Input placeholder="yb@superteamearn.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
