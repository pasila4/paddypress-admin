import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

import { Checkbox } from '@/components/ui/checkbox';
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
import { MoreHorizontalIcon } from 'lucide-react';

import { LocationSearchCombobox } from '@/components/ui/location-search-combobox';
import { BulkUploadIkpCentersDialog } from '@/components/BulkUploadIkpCentersDialog';

import { useUiStore } from '@/store';
import { useDebounce } from '@/lib/useDebounce';
import {
  createAdminIkpCenter,
  deactivateAdminIkpCenter,
  deleteAdminIkpCenterPermanently,
  listAdminIkpCenters,
  updateAdminIkpCenter,
  bulkUploadIkpCenters,
} from '@/lib/adminIkpCenters';
import type {
  AdminIkpCenter,
  UpdateAdminIkpCenterRequest,
} from '@/types/adminIkpCenters';
import {} from '@/lib/adminLocations';

const DEFAULT_PAGE_SIZE = 10;

import { IkpCenterDialog, type IkpCenterFormData } from './IkpCenterDialog';

export default function IkpCentersPage() {
  const { showToast } = useUiStore();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = React.useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [filters, setFilters] = React.useState({
    search: '',
    villageId: '',
    includeInactive: true,
  });

  React.useEffect(() => {
    setFilters((p) => ({ ...p, search: debouncedSearch }));
  }, [debouncedSearch]);

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(DEFAULT_PAGE_SIZE);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminIkpCenter | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    React.useState<AdminIkpCenter | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminIkpCenter | null>(
    null,
  );

  const [createInitialValues, setCreateInitialValues] =
    React.useState<IkpCenterFormData>({
      villageId: '',
      name: '',
      notes: '',
      isActive: true,
    });

  const lastCreateValuesRef = React.useRef<IkpCenterFormData | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  const listQuery = useQuery({
    queryKey: ['adminIkpCenters', page, limit, filters],
    queryFn: () =>
      listAdminIkpCenters({
        page,
        limit,
        search: filters.search,
        villageId: filters.villageId,
        includeInactive: filters.includeInactive,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createAdminIkpCenter,
    onSuccess: () => {
      showToast('Center created.', 'success');
      setCreateInitialValues((p) => {
        const last = lastCreateValuesRef.current;
        return {
          ...p,
          villageId: last?.villageId ?? p.villageId,
          name: '',
          notes: '',
          isActive: last?.isActive ?? p.isActive,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['adminIkpCenters'] });
      queryClient.invalidateQueries({ queryKey: ['adminIkpStatesForCenters'] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : 'Failed to create center.',
        'error',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminIkpCenterPermanently(id),
    onSuccess: () => {
      showToast('Center deleted.', 'success');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['adminIkpCenters'] });
      queryClient.invalidateQueries({ queryKey: ['adminIkpStatesForCenters'] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete center.',
        'error',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; payload: UpdateAdminIkpCenterRequest }) =>
      updateAdminIkpCenter(args.id, args.payload),
    onSuccess: () => {
      showToast('Center updated.', 'success');
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['adminIkpCenters'] });
      queryClient.invalidateQueries({ queryKey: ['adminIkpStatesForCenters'] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : 'Failed to update center.',
        'error',
      );
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateAdminIkpCenter(id),
    onSuccess: () => {
      showToast('Center deactivated.', 'success');
      setDeactivateTarget(null);
      queryClient.invalidateQueries({ queryKey: ['adminIkpCenters'] });
      queryClient.invalidateQueries({ queryKey: ['adminIkpStatesForCenters'] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : 'Failed to deactivate center.',
        'error',
      );
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (args: { villageId: string; items: string }) =>
      bulkUploadIkpCenters(args.villageId, args.items),
    onSuccess: () => {
      showToast('Centers uploaded successfully.', 'success');
      setBulkOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminIkpCenters'] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : 'Failed to upload centers.',
        'error',
      );
    },
  });

  const items = listQuery.data?.data.items ?? [];
  const total = listQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Centers</CardTitle>
            <div className="text-xs text-muted-foreground">
              Manage master centers. Millers can search and select these while
              recording procurements.
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              Bulk Upload
            </Button>
            <Button onClick={() => setCreateOpen(true)}>New center</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="ikpSearch">Search</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Search</InputGroupAddon>
                <InputGroupInput
                  id="ikpSearch"
                  placeholder="Search by name, village, mandal…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </InputGroup>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>Location</FieldLabel>
              <LocationSearchCombobox
                type="village"
                value={filters.villageId}
                onValueChange={(v) =>
                  setFilters((p) => ({
                    ...p,
                    villageId: v,
                  }))
                }
                placeholder="Filter by village..."
              />
            </Field>
          </div>

          <Field>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={filters.includeInactive}
                onCheckedChange={(v) =>
                  setFilters((p) => ({ ...p, includeInactive: Boolean(v) }))
                }
              />
              <span>Include inactive</span>
            </label>
          </Field>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Center</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-xs text-muted-foreground"
                    >
                      Loading centers…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-xs text-muted-foreground"
                    >
                      No centers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs">
                        <div className="space-y-0.5">
                          <div className="font-medium">{row.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {row.state} / {row.district} / {row.mandal} /{' '}
                            {row.village}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.isActive ? 'Active' : 'Inactive'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label="Open actions"
                            className={buttonVariants({
                              size: 'icon-sm',
                              variant: 'ghost',
                            })}
                          >
                            <MoreHorizontalIcon className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditing(row)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeactivateTarget(row)}
                              disabled={!row.isActive}
                            >
                              Deactivate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(row)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
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
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={listQuery.isLoading || page <= 1}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={listQuery.isLoading || page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>

          {listQuery.isError && (
            <div className="text-xs text-destructive">
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : 'Failed to load centers.'}
            </div>
          )}
        </CardContent>
      </Card>

      <IkpCenterDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New center"
        description="Add an IKP center. This will be available for millers."
        initialValues={createInitialValues}
        onSave={(data) => createMutation.mutate(data)}
        isSaving={createMutation.isPending}
      />

      <BulkUploadIkpCentersDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onUpload={(villageId, items) =>
          bulkUploadMutation.mutate({ villageId, items })
        }
        isUploading={bulkUploadMutation.isPending}
      />

      <IkpCenterDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
        title="Edit center"
        description="Update center details."
        initialValues={{
          villageId: editing?.villageId ?? '',
          name: editing?.name ?? '',
          notes: editing?.notes ?? '',
          isActive: editing?.isActive ?? true,
        }}
        onSave={(data) => {
          if (!editing) return;
          updateMutation.mutate({
            id: editing.id,
            payload: {
              villageId: data.villageId,
              name: data.name,
              notes: data.notes,
              isActive: data.isActive,
            },
          });
        }}
        isSaving={updateMutation.isPending}
      />

      <AlertDialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => (!open ? setDeactivateTarget(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate center?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the center from miller selection. Existing records
              will not be changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deactivateTarget) return;
                deactivateMutation.mutate(deactivateTarget.id);
              }}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? 'Deactivating…' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete center permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the center. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTarget) return;
                deleteMutation.mutate(deleteTarget.id);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
