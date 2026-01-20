import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationSearchCombobox } from '@/components/ui/location-search-combobox';

export const villageSchema = z.object({
  mandalId: z.string().min(1, 'Select a mandal.'),
  name: z.string().min(1, 'Enter a village name.'),
  code: z.string().optional(),
  pincode: z.string().optional(),
  isActive: z.boolean(),
});

export type VillageFormData = z.infer<typeof villageSchema>;

export function LocationsVillageDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues: VillageFormData;
  onSave: (data: VillageFormData) => void;
  isSaving: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<VillageFormData>({
    resolver: zodResolver(villageSchema),
    defaultValues: initialValues,
  });

  React.useEffect(() => {
    if (open) reset(initialValues);
  }, [open, initialValues, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <Field>
            <FieldLabel>Mandal</FieldLabel>
            <Controller
              control={control}
              name="mandalId"
              render={({ field }) => (
                <LocationSearchCombobox
                  type="mandal"
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Search mandal..."
                />
              )}
            />
            <FieldError errors={errors.mandalId ? [errors.mandalId] : []} />
          </Field>

          <Field>
            <FieldLabel>Village Name</FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...register('name')}
                placeholder="E.g. Village Name"
              />
            </InputGroup>
            <FieldError errors={errors.name ? [errors.name] : []} />
          </Field>
          <Field>
            <FieldLabel>Pincode</FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...register('pincode')}
                placeholder="E.g. 500001"
              />
            </InputGroup>
            <FieldError errors={errors.pincode ? [errors.pincode] : []} />
          </Field>
          <Field>
            <FieldLabel>Code (Optional)</FieldLabel>
            <InputGroup>
              <InputGroupInput {...register('code')} placeholder="E.g. Code" />
            </InputGroup>
          </Field>
          <Field>
            <label className="flex items-center gap-2 text-sm">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(Boolean(v))}
                  />
                )}
              />
              <span>Active</span>
            </label>
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !isValid}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
