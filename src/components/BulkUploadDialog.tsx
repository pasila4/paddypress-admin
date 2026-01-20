import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onUpload: (items: string) => void;
  isUploading: boolean;
  placeholder?: string;
}

export function BulkUploadDialog({
  open,
  onOpenChange,
  title,
  description,
  onUpload,
  isUploading,
  placeholder = 'Item 1, Item 2, Item 3...',
}: BulkUploadDialogProps) {
  const [items, setItems] = React.useState('');

  React.useEffect(() => {
    if (!open) setItems('');
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.trim()) return;
    onUpload(items);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Items (comma separated)</FieldLabel>
            <Textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder={placeholder}
              rows={6}
              disabled={isUploading}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !items.trim()}>
              {isUploading ? 'Uploading…' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
