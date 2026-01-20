import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { LocationSearchCombobox } from '@/components/ui/location-search-combobox';

const bulkUploadSchema = z.object({
  villageId: z.string().min(1, 'Select a village.'),
  items: z.string().min(1, 'Enter center names.'),
});

type BulkUploadFormData = z.infer<typeof bulkUploadSchema>;

interface BulkUploadIkpCentersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (villageId: string, items: string) => void;
  isUploading: boolean;
}

export function BulkUploadIkpCentersDialog({
  open,
  onOpenChange,
  onUpload,
  isUploading,
}: BulkUploadIkpCentersDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<BulkUploadFormData>({
    resolver: zodResolver(bulkUploadSchema),
    defaultValues: {
      villageId: '',
      items: '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (!open) {
      reset({
        villageId: '',
        items: '',
      });
    }
  }, [open, reset]);

  const onSubmit = (data: BulkUploadFormData) => {
    onUpload(data.villageId, data.items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload IKP Centers</DialogTitle>
          <DialogDescription>
            Select the location and enter comma separated center names.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <FieldError errors={errors.villageId ? [errors.villageId] : []} />
            </Field>
          </div>

          <Field>
            <FieldLabel>Center Names (comma separated)</FieldLabel>
            <Textarea
              {...register('items')}
              placeholder="Center 1, Center 2, Center 3..."
              rows={5}
              disabled={isUploading}
            />
            <FieldError errors={errors.items ? [errors.items] : []} />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !isValid}>
              {isUploading ? 'Uploading…' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
