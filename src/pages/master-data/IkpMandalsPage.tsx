import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { MoreHorizontalIcon } from "lucide-react";

import {
  GroupedCombobox,
  type GroupedComboboxGroup,
} from "@/components/ui/grouped-combobox";

import { useUiStore } from "@/store";
import { useDebounce } from "@/lib/useDebounce";
import {
  createAdminIkpMandal,
  deactivateAdminIkpMandal,
  deleteAdminIkpMandalPermanently,
  listAdminIkpDistricts,
  listAdminIkpMandals,
  listAdminIkpStates,
  updateAdminIkpMandal,
} from "@/lib/adminIkpLocations";
import type {
  AdminIkpDistrict,
  AdminIkpMandal,
  AdminIkpState,
} from "@/types/adminIkpLocations";

const DEFAULT_PAGE_SIZE = 10;

const mandalSchema = z.object({
  districtId: z.string().min(1, "Select a district."),
  name: z
    .string()
    .min(1, "Enter a mandal name.")
    .max(100, "Max 100 characters."),
  isActive: z.boolean(),
});

type MandalFormData = z.infer<typeof mandalSchema>;

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "default" : "outline"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function MandalDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialValues: MandalFormData;
  onSave: (data: MandalFormData) => void;
  isSaving: boolean;
  districtGroups: GroupedComboboxGroup[];
  disableDistrict?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<MandalFormData>({
    resolver: zodResolver(mandalSchema),
    defaultValues: props.initialValues,
    mode: "onChange",
  });

  React.useEffect(() => {
    if (props.open) reset(props.initialValues);
  }, [props.open, props.initialValues, reset]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(props.onSave)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>District</FieldLabel>
              <Controller
                control={control}
                name="districtId"
                render={({ field }) => (
                  <GroupedCombobox
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    groups={props.districtGroups}
                    placeholder="Select district"
                    emptyText="No districts found."
                    disabled={props.disableDistrict}
                  />
                )}
              />
              <FieldError
                errors={errors.districtId ? [errors.districtId] : []}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="mandalName">Mandal name</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Name</InputGroupAddon>
                <InputGroupInput
                  id="mandalName"
                  placeholder="Rajahmundry Rural"
                  {...register("name")}
                />
              </InputGroup>
              <FieldError errors={errors.name ? [errors.name] : []} />
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
                (props.disableDistrict ? !isDirty : false)
              }
            >
              {props.isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function IkpMandalsPage() {
  const { showToast } = useUiStore();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [stateId, setStateId] = React.useState<string>("");
  const [districtId, setDistrictId] = React.useState<string>("");
  const [includeInactive, setIncludeInactive] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(DEFAULT_PAGE_SIZE);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminIkpMandal | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    React.useState<AdminIkpMandal | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminIkpMandal | null>(null);

  const [createInitialValues, setCreateInitialValues] =
    React.useState<MandalFormData>({
      districtId: "",
      name: "",
      isActive: true,
    });

  const lastCreateValuesRef = React.useRef<MandalFormData | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, districtId, includeInactive, stateId]);

  const statesQuery = useQuery({
    queryKey: ["adminIkpStatesForMandals"],
    queryFn: () =>
      listAdminIkpStates({ page: 1, limit: 200, includeInactive: true }),
  });

  const districtsForDialogQuery = useQuery({
    queryKey: ["adminIkpDistrictsForMandalDialog"],
    queryFn: () =>
      listAdminIkpDistricts({
        page: 1,
        limit: 500,
        includeInactive: true,
      }),
    enabled: statesQuery.isSuccess,
  });

  const districtsQuery = useQuery({
    queryKey: ["adminIkpDistrictsForMandals", stateId],
    queryFn: () =>
      listAdminIkpDistricts({
        page: 1,
        limit: 200,
        includeInactive: true,
        stateId: stateId || undefined,
      }),
    enabled: statesQuery.isSuccess,
  });

  const listQuery = useQuery({
    queryKey: [
      "adminIkpMandals",
      debouncedSearch,
      districtId,
      includeInactive,
      page,
      limit,
    ],
    queryFn: () =>
      listAdminIkpMandals({
        search: debouncedSearch,
        districtId: districtId || undefined,
        includeInactive,
        page,
        limit,
      }),
    enabled: districtsQuery.isSuccess,
  });

  const states = statesQuery.data?.data.items ?? [];
  const districts = districtsQuery.data?.data.items ?? [];
  const districtsForDialog = districtsForDialogQuery.data?.data.items ?? [];

  const stateById = React.useMemo(() => {
    const map = new Map<string, AdminIkpState>();
    for (const s of states) map.set(s.id, s);
    return map;
  }, [states]);

  const districtGroups = React.useMemo<GroupedComboboxGroup[]>(() => {
    const districtsByState = new Map<string, AdminIkpDistrict[]>();
    for (const d of districtsForDialog) {
      const list = districtsByState.get(d.stateId) ?? [];
      list.push(d);
      districtsByState.set(d.stateId, list);
    }

    return states.map((s) => ({
      label: `${s.code} - ${s.name}`,
      options: (districtsByState.get(s.id) ?? []).map((d) => ({
        value: d.id,
        label: `${d.name}${d.isActive ? "" : " (inactive)"}`,
      })),
    }));
  }, [districtsForDialog, states]);

  const stateFilterGroups = React.useMemo<GroupedComboboxGroup[]>(() => {
    return [
      {
        label: "States",
        options: states.map((s) => ({
          value: s.id,
          label: `${s.code} - ${s.name}${s.isActive ? "" : " (inactive)"}`,
        })),
      },
    ];
  }, [states]);

  const districtFilterGroups = React.useMemo<GroupedComboboxGroup[]>(() => {
    return [
      {
        label: "Districts",
        options: districts.map((d) => ({
          value: d.id,
          label: `${d.name}${d.isActive ? "" : " (inactive)"}`,
        })),
      },
    ];
  }, [districts]);

  const districtById = React.useMemo(() => {
    const map = new Map<string, AdminIkpDistrict>();
    for (const d of districts) map.set(d.id, d);
    return map;
  }, [districts]);

  const createMutation = useMutation({
    mutationFn: createAdminIkpMandal,
    onSuccess: (res) => {
      showToast(res.message ?? "Mandal created.", "success");
      setCreateInitialValues((p) => {
        const last = lastCreateValuesRef.current;
        return {
          districtId: last?.districtId ?? p.districtId,
          name: "",
          isActive: last?.isActive ?? p.isActive,
        };
      });
      void queryClient.invalidateQueries({ queryKey: ["adminIkpMandals"] });
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : "Failed to create mandal.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminIkpMandalPermanently,
    onSuccess: (res) => {
      showToast(res.message ?? "Mandal deleted.", "success");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["adminIkpMandals"] });
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : "Failed to delete mandal.", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; payload: MandalFormData }) =>
      updateAdminIkpMandal(args.id, args.payload),
    onSuccess: (res) => {
      showToast(res.message ?? "Mandal updated.", "success");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["adminIkpMandals"] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : "Failed to update mandal.",
        "error"
      );
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminIkpMandal,
    onSuccess: (res) => {
      showToast(res.message ?? "Mandal deactivated.", "success");
      setDeactivateTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["adminIkpMandals"] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : "Failed to deactivate mandal.",
        "error"
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
            <CardTitle>Mandals</CardTitle>
            <div className="text-xs text-muted-foreground">
              Manage mandals under districts.
            </div>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={
              !districtsForDialogQuery.isSuccess ||
              districtsForDialog.length === 0
            }
          >
            New mandal
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
            <Field className="md:col-span-2">
              <FieldLabel>State</FieldLabel>
              <GroupedCombobox
                value={stateId}
                onValueChange={(v) => {
                  const next = v ? (v === stateId ? "" : v) : "";
                  setStateId(next);
                  setDistrictId("");
                }}
                groups={stateFilterGroups}
                placeholder="All states"
                emptyText="No states found."
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>District</FieldLabel>
              <GroupedCombobox
                value={districtId}
                onValueChange={(v) => setDistrictId(v ? (v === districtId ? "" : v) : "")}
                groups={districtFilterGroups}
                placeholder={stateId ? "All districts" : "Select state first"}
                emptyText={stateId ? "No districts found." : "Select a state first."}
                disabled={!stateId}
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="mandalSearch">Search</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Search</InputGroupAddon>
                <InputGroupInput
                  id="mandalSearch"
                  placeholder="Search by mandal name"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>Include inactive</FieldLabel>
              <label className="flex h-7 items-center gap-2 rounded-md border border-border px-2 text-xs">
                <Checkbox
                  checked={includeInactive}
                  onCheckedChange={(v) => setIncludeInactive(Boolean(v))}
                />
                <span>Yes</span>
              </label>
            </Field>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Mandal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statesQuery.isLoading ||
                districtsQuery.isLoading ||
                listQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-xs text-muted-foreground"
                    >
                      Loading mandals…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-xs text-muted-foreground"
                    >
                      No mandals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => {
                    const district = districtById.get(row.districtId);
                    const state = district
                      ? stateById.get(district.stateId)
                      : undefined;
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="text-xs">
                          {state ? `${state.code} - ${state.name}` : ""}
                        </TableCell>
                        <TableCell className="text-xs">
                          {district ? district.name : row.districtId}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="text-xs">
                          <ActiveBadge isActive={row.isActive} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon-xs">
                                <MoreHorizontalIcon className="size-3.5" />
                              </Button>
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
                    );
                  })
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
                disabled={
                  statesQuery.isLoading ||
                  districtsQuery.isLoading ||
                  listQuery.isLoading ||
                  page <= 1
                }
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={
                  statesQuery.isLoading ||
                  districtsQuery.isLoading ||
                  listQuery.isLoading ||
                  page >= totalPages
                }
              >
                Next
              </Button>
            </div>
          </div>

          {(statesQuery.isError ||
            districtsQuery.isError ||
            listQuery.isError) && (
            <div className="text-xs text-destructive">
              {statesQuery.error instanceof Error
                ? statesQuery.error.message
                : districtsQuery.error instanceof Error
                ? districtsQuery.error.message
                : listQuery.error instanceof Error
                ? listQuery.error.message
                : "Failed to load mandals."}
            </div>
          )}
        </CardContent>
      </Card>

      <MandalDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New mandal"
        description="Add a new mandal under a district."
        initialValues={createInitialValues}
        onSave={(data) => {
          lastCreateValuesRef.current = data;
          createMutation.mutate(data);
        }}
        isSaving={createMutation.isPending}
        districtGroups={districtGroups}
      />

      <MandalDialog
        open={Boolean(editing)}
        onOpenChange={(open) => (!open ? setEditing(null) : null)}
        title="Edit mandal"
        description="Update the mandal details."
        initialValues={{
          districtId: editing?.districtId ?? "",
          name: editing?.name ?? "",
          isActive: editing?.isActive ?? true,
        }}
        onSave={(data) => {
          if (!editing) return;
          updateMutation.mutate({ id: editing.id, payload: data });
        }}
        isSaving={updateMutation.isPending}
        districtGroups={districtGroups}
        disableDistrict
      />

      <Dialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => (!open ? setDeactivateTarget(null) : null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate mandal</DialogTitle>
            <DialogDescription>
              This will mark the mandal inactive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeactivateTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                deactivateTarget &&
                deactivateMutation.mutate(deactivateTarget.id)
              }
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? "Deactivating…" : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete mandal permanently?</DialogTitle>
            <DialogDescription>
              This will permanently delete the mandal. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
