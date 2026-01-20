import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationSearchCombobox } from '@/components/ui/location-search-combobox';

export const ikpCenterSchema = z.object({
  villageId: z.string().min(1, 'Select a village.'),
  name: z.string().min(1, 'Enter a center name.'),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

export type IkpCenterFormData = z.infer<typeof ikpCenterSchema>;

export function IkpCenterDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialValues: IkpCenterFormData;
  onSave: (data: IkpCenterFormData) => void;
  isSaving: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<IkpCenterFormData>({
    resolver: zodResolver(ikpCenterSchema),
    defaultValues: props.initialValues,
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (props.open) reset(props.initialValues);
  }, [props.open, props.initialValues, reset]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(props.onSave)} className="space-y-4">
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Village</FieldLabel>
                <Controller
                  control={control}
                  name="villageId"
                  render={({ field }) => (
                    <LocationSearchCombobox
                      type="village"
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Search village..."
                    />
                  )}
                />
                <FieldError
                  errors={errors.villageId ? [errors.villageId] : []}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="ikpName">Center name</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>Name</InputGroupAddon>
                  <InputGroupInput
                    id="ikpName"
                    placeholder="E.g. Katakoteswaram Center"
                    {...register('name')}
                  />
                </InputGroup>
                <FieldError errors={errors.name ? [errors.name] : []} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="ikpNotes">Notes</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="block-start">Notes</InputGroupAddon>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value ?? ''}
                      onChange={(next) => field.onChange(next)}
                      placeholder="Add employee names and phone numbers for reference."
                    />
                  )}
                />
              </InputGroup>
              <FieldError errors={errors.notes ? [errors.notes] : []} />
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
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => props.onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                props.isSaving ||
                !isValid ||
                (props.title.startsWith('Edit') ? !isDirty : false)
              }
            >
              {props.isSaving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
