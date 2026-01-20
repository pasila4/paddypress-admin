import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { MoreHorizontalIcon } from 'lucide-react';

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
  listAdminDistricts,
  createAdminDistrict,
  updateAdminDistrict,
  deactivateAdminDistrict,
  deleteAdminDistrictPermanently,
  bulkUploadDistricts,
} from '@/lib/adminLocations';
import type { AdminDistrict } from '@/types/adminLocations';

const DEFAULT_PAGE_SIZE = 10;

import { LocationsDistrictDialog } from './LocationsDistrictDialog';

function BulkUploadDistrictsDialog({
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
  const [stateId, setStateId] = React.useState('');
  const [items, setItems] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setStateId('');
      setItems('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Districts</DialogTitle>
          <DialogDescription>
            Select state and enter comma separated district names.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel>State</FieldLabel>
            <LocationSearchCombobox
              type="state"
              value={stateId}
              onValueChange={setStateId}
              placeholder="Search state..."
            />
          </Field>
          <Field>
            <FieldLabel>Districts (comma separated)</FieldLabel>
            <Textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="District 1, District 2..."
              rows={5}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onUpload(stateId, items)}
            disabled={!stateId || !items.trim() || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LocationsDistrictsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { showToast } = useUiStore();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [stateFilter, setStateFilter] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminDistrict | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    React.useState<AdminDistrict | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminDistrict | null>(
    null,
  );

  const query = useQuery({
    queryKey: ['adminDistricts', page, debouncedSearch, stateFilter],
    queryFn: () =>
      listAdminDistricts({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search: debouncedSearch,
        stateId: stateFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createAdminDistrict,
    onSuccess: () => {
      showToast('District created.', 'success');
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminDistricts'] });
    },
    onError: (err) =>
      showToast(err instanceof Error ? err.message : 'Failed.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) =>
      updateAdminDistrict(data.id, data.payload),
    onSuccess: () => {
      showToast('District updated.', 'success');
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['adminDistricts'] });
    },
    onError: (err) =>
      showToast(err instanceof Error ? err.message : 'Failed.', 'error'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminDistrict,
    onSuccess: () => {
      showToast('District deactivated.', 'success');
      setDeactivateTarget(null);
      queryClient.invalidateQueries({ queryKey: ['adminDistricts'] });
    },
    onError: (err) =>
      showToast(err instanceof Error ? err.message : 'Failed.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminDistrictPermanently,
    onSuccess: () => {
      showToast('District deleted.', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['adminDistricts'] });
    },
    onError: (err) =>
      showToast(err instanceof Error ? err.message : 'Failed.', 'error'),
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (data: { parentId: string; items: string }) =>
      bulkUploadDistricts(data.parentId, data.items),
    onSuccess: () => {
      showToast('Districts uploaded.', 'success');
      setBulkOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminDistricts'] });
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
          <CardTitle>Districts</CardTitle>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => setBulkOpen(true)}>
                  Bulk Upload
                </Button>
                <Button onClick={() => setCreateOpen(true)}>
                  New District
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <InputGroup className="max-w-xs">
              <InputGroupAddon>Search</InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search districts..."
              />
            </InputGroup>
            <div className="w-[240px]">
              <LocationSearchCombobox
                type="state"
                value={stateFilter}
                onValueChange={setStateFilter}
                placeholder="Filter by State"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No districts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.code || '-'}</TableCell>
                      <TableCell>{item.state?.name || '-'}</TableCell>
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

      <LocationsDistrictDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New District"
        initialValues={{ stateId: '', name: '', isActive: true }}
        onSave={(data) => {
          const payload = { ...data };
          if (!payload.code) {
            payload.code = `D${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          }
          createMutation.mutate(payload);
        }}
        isSaving={createMutation.isPending}
      />

      {editing && (
        <LocationsDistrictDialog
          open={true}
          onOpenChange={(open) => !open && setEditing(null)}
          title="Edit District"
          initialValues={{
            stateId: editing.stateId,
            name: editing.name,
            code: editing.code || '',
            isActive: editing.isActive,
          }}
          onSave={(data) =>
            updateMutation.mutate({ id: editing.id, payload: data })
          }
          isSaving={updateMutation.isPending}
        />
      )}

      <BulkUploadDistrictsDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onUpload={(pid, txt) =>
          bulkUploadMutation.mutate({ parentId: pid, items: txt })
        }
        isUploading={bulkUploadMutation.isPending}
      />
      {/* Alert Dialogs for Delete/Deactivate omitted for brevity but should be added if needed, I have logic for them above. I will add them. */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => !o && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate District?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the district.
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
            <AlertDialogTitle>Delete District?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete district?
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
