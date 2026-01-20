import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { MoreHorizontalIcon, Loader2 } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Textarea } from '@/components/ui/textarea';

import { LocationSearchCombobox } from '@/components/ui/location-search-combobox';

import { useUiStore } from '@/store';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/lib/useDebounce';
import {
  listAdminVillages,
  createAdminVillage,
  updateAdminVillage,
  deactivateAdminVillage,
  deleteAdminVillagePermanently,
  bulkUploadVillages,
} from '@/lib/adminLocations';
import type { AdminVillage } from '@/types/adminLocations';

const DEFAULT_PAGE_SIZE = 10;

import { LocationsVillageDialog } from './LocationsVillageDialog';

function BulkUploadVillagesDialog({
  open,
  onOpenChange,
  onUpload,
  isUploading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (parentId: string, items: string) => void;
  isUploading: boolean;
}) {
  const [mandalId, setMandalId] = React.useState('');
  const [items, setItems] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setMandalId('');
      setItems('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Villages</DialogTitle>
          <DialogDescription>
            Select mandal and enter comma separated village names.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel>Mandal</FieldLabel>
            <LocationSearchCombobox
              type="mandal"
              value={mandalId}
              onValueChange={setMandalId}
              placeholder="Search mandal..."
            />
          </Field>
          <Field>
            <FieldLabel>Villages (comma separated)</FieldLabel>
            <Textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="Village 1, Village 2..."
              rows={5}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onUpload(mandalId, items)}
            disabled={!mandalId || !items.trim() || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline Pincode Editor Component
function PincodeCell({
  village,
  onUpdate,
  disabled,
}: {
  village: AdminVillage;
  onUpdate: (id: string, pincode: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [value, setValue] = React.useState(village.pincode || '');
  const [saving, setSaving] = React.useState(false);

  if (disabled) {
    return <span className="text-xs px-2">{value || '-'}</span>;
  }

  const handleBlur = async () => {
    if (value !== (village.pincode || '')) {
      setSaving(true);
      try {
        await onUpdate(village.id, value);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="relative">
      <InputGroupInput
        className="h-8 py-1 pr-8"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Pincode"
      />
      {saving && (
        <div className="absolute right-2 top-1.5">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export default function LocationsVillagesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { showToast } = useUiStore();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [mandalFilter, setMandalFilter] = React.useState('');

  const debouncedSearch = useDebounce(search, 300);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminVillage | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    React.useState<AdminVillage | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminVillage | null>(
    null,
  );

  const query = useQuery({
    queryKey: ['adminVillages', page, debouncedSearch, mandalFilter],
    queryFn: () =>
      listAdminVillages({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch,
        mandalId: mandalFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createAdminVillage,
    onSuccess: () => {
      showToast('Village created.', 'success');
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminVillages'] });
    },
    onError: (err) =>
      showToast(err instanceof Error ? err.message : 'Failed.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) =>
      updateAdminVillage(data.id, data.payload),
    onSuccess: () => {
      showToast('Village updated.', 'success');
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['adminVillages'] });
    },
    onError: (err) =>
      showToast(err instanceof Error ? err.message : 'Failed.', 'error'),
  });

  // Silent update for pincode
  const updatePincodeMutation = useMutation({
    mutationFn: (data: { id: string; pincode: string }) =>
      updateAdminVillage(data.id, { pincode: data.pincode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVillages'] });
    },
    onError: () => showToast('Failed to update pincode.', 'error'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminVillage,
    onSuccess: () => {
      showToast('Village deactivated.', 'success');
      setDeactivateTarget(null);
      queryClient.invalidateQueries({ queryKey: ['adminVillages'] });
    },
    onError: (err) =>
      showToast(err instanceof Error ? err.message : 'Failed.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminVillagePermanently,
    onSuccess: () => {
      showToast('Village deleted.', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['adminVillages'] });
    },
    onError: (err) =>
      showToast(err instanceof Error ? err.message : 'Failed.', 'error'),
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (data: { parentId: string; items: string }) =>
      bulkUploadVillages(data.parentId, data.items),
    onSuccess: () => {
      showToast('Villages uploaded.', 'success');
      setBulkOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminVillages'] });
    },
    onError: (err) =>
      showToast(err instanceof Error ? err.message : 'Failed.', 'error'),
  });

  const items = query.data?.data?.items ?? [];
  const total = query.data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Villages</CardTitle>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => setBulkOpen(true)}>
                  Bulk Upload
                </Button>
                <Button onClick={() => setCreateOpen(true)}>New Village</Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <InputGroup className="w-[200px]">
              <InputGroupAddon>Search</InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
              />
            </InputGroup>
            <div className="w-[240px]">
              <LocationSearchCombobox
                type="mandal"
                value={mandalFilter}
                onValueChange={setMandalFilter}
                placeholder="Filter by Mandal"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[120px]">Pincode</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 3 : 2}
                      className="text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 3 : 2}
                      className="text-center"
                    >
                      No villages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <PincodeCell
                          village={item}
                          onUpdate={async (id, val) => {
                            await updatePincodeMutation.mutateAsync({
                              id,
                              pincode: val,
                            });
                          }}
                          disabled={!isAdmin}
                        />
                      </TableCell>
                      <TableCell>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label="Open actions"
                              className={buttonVariants({
                                size: 'icon-sm',
                                variant: 'ghost',
                              })}
                            >
                              <MoreHorizontalIcon className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditing(item)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeactivateTarget(item)}
                                disabled={!item.isActive}
                              >
                                Deactivate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(item)}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {total} total
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <LocationsVillageDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Village"
        initialValues={{ mandalId: '', name: '', isActive: true }}
        onSave={(data) => {
          const payload = { ...data };
          if (!payload.code) {
            payload.code = `V${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          }
          createMutation.mutate(payload);
        }}
        isSaving={createMutation.isPending}
      />

      {editing && (
        <LocationsVillageDialog
          open={true}
          onOpenChange={(open) => !open && setEditing(null)}
          title="Edit Village"
          initialValues={{
            mandalId: editing.mandalId,
            name: editing.name,
            code: editing.code || '',
            pincode: editing.pincode || '',
            isActive: editing.isActive,
          }}
          onSave={(data) =>
            updateMutation.mutate({ id: editing.id, payload: data })
          }
          isSaving={updateMutation.isPending}
        />
      )}

      <BulkUploadVillagesDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onUpload={(pid, txt) =>
          bulkUploadMutation.mutate({ parentId: pid, items: txt })
        }
        isUploading={bulkUploadMutation.isPending}
      />
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => !o && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Village?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the village.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deactivateTarget &&
                deactivateMutation.mutate(deactivateTarget.id)
              }
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Village?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete village?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
