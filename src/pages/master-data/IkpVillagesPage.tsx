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
  createAdminIkpVillage,
  deactivateAdminIkpVillage,
  deleteAdminIkpVillagePermanently,
  listAdminIkpDistricts,
  listAdminIkpMandals,
  listAdminIkpStates,
  listAdminIkpVillages,
  updateAdminIkpVillage,
} from "@/lib/adminIkpLocations";
import type {
  AdminIkpDistrict,
  AdminIkpMandal,
  AdminIkpState,
  AdminIkpVillage,
  UpdateAdminIkpVillageRequest,
} from "@/types/adminIkpLocations";

const DEFAULT_PAGE_SIZE = 10;

const villageSchema = z.object({
  mandalId: z.string().min(1, "Select a mandal."),
  name: z
    .string()
    .min(1, "Enter a village name.")
    .max(100, "Max 100 characters."),
  isActive: z.boolean(),
});

type VillageFormData = z.infer<typeof villageSchema>;

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "default" : "outline"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function VillageDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialValues: VillageFormData;
  onSave: (data: VillageFormData) => void;
  isSaving: boolean;
  mandalGroups: GroupedComboboxGroup[];
  disableMandal?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<VillageFormData>({
    resolver: zodResolver(villageSchema),
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
              <FieldLabel>Mandal</FieldLabel>
              <Controller
                control={control}
                name="mandalId"
                render={({ field }) => (
                  <GroupedCombobox
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    groups={props.mandalGroups}
                    placeholder="Select mandal"
                    emptyText="No mandals found."
                    disabled={props.disableMandal}
                  />
                )}
              />
              <FieldError errors={errors.mandalId ? [errors.mandalId] : []} />
            </Field>

            <Field>
              <FieldLabel htmlFor="villageName">Village name</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Name</InputGroupAddon>
                <InputGroupInput
                  id="villageName"
                  placeholder="E.g. Katakoteswaram"
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
                (props.disableMandal ? !isDirty : false)
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

export default function IkpVillagesPage() {
  const { showToast } = useUiStore();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = React.useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [stateId, setStateId] = React.useState<string>("");
  const [districtId, setDistrictId] = React.useState<string>("");
  const [mandalId, setMandalId] = React.useState<string>("");
  const [includeInactive, setIncludeInactive] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(DEFAULT_PAGE_SIZE);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminIkpVillage | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    React.useState<AdminIkpVillage | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminIkpVillage | null>(null);

  const [createInitialValues, setCreateInitialValues] =
    React.useState<VillageFormData>({
      mandalId: "",
      name: "",
      isActive: true,
    });

  const lastCreateValuesRef = React.useRef<VillageFormData | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, includeInactive, mandalId, districtId, stateId]);

  const statesQuery = useQuery({
    queryKey: ["adminIkpStatesForVillages"],
    queryFn: () =>
      listAdminIkpStates({ page: 1, limit: 200, includeInactive: true }),
  });

  const districtsForDialogQuery = useQuery({
    queryKey: ["adminIkpDistrictsForVillageDialog"],
    queryFn: () =>
      listAdminIkpDistricts({
        page: 1,
        limit: 500,
        includeInactive: true,
      }),
    enabled: statesQuery.isSuccess,
  });

  const mandalsForDialogQuery = useQuery({
    queryKey: ["adminIkpMandalsForVillageDialog"],
    queryFn: () =>
      listAdminIkpMandals({
        page: 1,
        limit: 1000,
        includeInactive: true,
      }),
    enabled: districtsForDialogQuery.isSuccess,
  });

  const districtsQuery = useQuery({
    queryKey: ["adminIkpDistrictsForVillages", stateId],
    queryFn: () =>
      listAdminIkpDistricts({
        page: 1,
        limit: 300,
        includeInactive: true,
        stateId: stateId || undefined,
      }),
    enabled: statesQuery.isSuccess && Boolean(stateId),
  });

  const mandalsQuery = useQuery({
    queryKey: ["adminIkpMandalsForVillages", districtId],
    queryFn: () =>
      listAdminIkpMandals({
        page: 1,
        limit: 500,
        includeInactive: true,
        districtId: districtId || undefined,
      }),
    enabled: statesQuery.isSuccess && Boolean(districtId),
  });

  const listQuery = useQuery({
    queryKey: [
      "adminIkpVillages",
      debouncedSearch,
      stateId,
      districtId,
      mandalId,
      includeInactive,
      page,
      limit,
    ],
    queryFn: () =>
      listAdminIkpVillages({
        search: debouncedSearch,
        stateId: stateId || undefined,
        districtId: districtId || undefined,
        mandalId: mandalId || undefined,
        includeInactive,
        page,
        limit,
      }),
    enabled: statesQuery.isSuccess,
  });

  const states: AdminIkpState[] = statesQuery.data?.data.items ?? [];
  const districts: AdminIkpDistrict[] = districtsQuery.data?.data.items ?? [];
  const mandals: AdminIkpMandal[] = mandalsQuery.data?.data.items ?? [];
  const districtsForDialog: AdminIkpDistrict[] =
    districtsForDialogQuery.data?.data.items ?? [];
  const mandalsForDialog: AdminIkpMandal[] =
    mandalsForDialogQuery.data?.data.items ?? [];
  const items: AdminIkpVillage[] = listQuery.data?.data.items ?? [];

  const mandalById = React.useMemo(() => {
    const map = new Map<string, AdminIkpMandal>();
    for (const m of mandalsForDialog) map.set(m.id, m);
    return map;
  }, [mandalsForDialog]);

  const mandalGroups = React.useMemo<GroupedComboboxGroup[]>(() => {
    const districtsById = new Map<string, AdminIkpDistrict>();
    for (const d of districtsForDialog) districtsById.set(d.id, d);

    const optionsByState = new Map<
      string,
      { value: string; label: string }[]
    >();

    for (const m of mandalsForDialog) {
      const district = districtsById.get(m.districtId);
      if (!district) continue;

      const list = optionsByState.get(district.stateId) ?? [];
      list.push({
        value: m.id,
        label: `${district.name} - ${m.name}${m.isActive ? "" : " (inactive)"}`,
      });
      optionsByState.set(district.stateId, list);
    }

    return states.map((s) => ({
      label: `${s.code} - ${s.name}`,
      options: (optionsByState.get(s.id) ?? []).sort((a, b) =>
        a.label.localeCompare(b.label)
      ),
    }));
  }, [districtsForDialog, mandalsForDialog, states]);

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

  const mandalFilterGroups = React.useMemo<GroupedComboboxGroup[]>(() => {
    return [
      {
        label: "Mandals",
        options: mandals.map((m) => ({
          value: m.id,
          label: `${m.name}${m.isActive ? "" : " (inactive)"}`,
        })),
      },
    ];
  }, [mandals]);

  const createMutation = useMutation({
    mutationFn: createAdminIkpVillage,
    onSuccess: (res) => {
      showToast(res.message ?? "Village created.", "success");
      setCreateInitialValues((p) => {
        const last = lastCreateValuesRef.current;
        return {
          mandalId: last?.mandalId ?? p.mandalId,
          name: "",
          isActive: last?.isActive ?? p.isActive,
        };
      });
      void queryClient.invalidateQueries({ queryKey: ["adminIkpVillages"] });
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : "Failed to create village.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminIkpVillagePermanently,
    onSuccess: (res) => {
      showToast(res.message ?? "Village deleted.", "success");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["adminIkpVillages"] });
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : "Failed to delete village.", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; payload: UpdateAdminIkpVillageRequest }) =>
      updateAdminIkpVillage(args.id, args.payload),
    onSuccess: (res) => {
      showToast(res.message ?? "Village updated.", "success");
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ["adminIkpVillages"] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : "Failed to update village.",
        "error"
      );
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminIkpVillage,
    onSuccess: (res) => {
      showToast(res.message ?? "Village deactivated.", "success");
      setDeactivateTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["adminIkpVillages"] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : "Failed to deactivate village.",
        "error"
      );
    },
  });

  const total = listQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Villages</CardTitle>
            <div className="text-xs text-muted-foreground">
              Manage villages under mandals.
            </div>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={
              !mandalsForDialogQuery.isSuccess || mandalsForDialog.length === 0
            }
          >
            New village
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="ikpVillageSearch">Search</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Search</InputGroupAddon>
                <InputGroupInput
                  id="ikpVillageSearch"
                  placeholder="Search by village name…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>State</FieldLabel>
              <GroupedCombobox
                value={stateId}
                onValueChange={(v) => {
                  const next = v ? (v === stateId ? "" : v) : "";
                  setStateId(next);
                  setDistrictId("");
                  setMandalId("");
                }}
                groups={stateFilterGroups}
                placeholder="All states"
                emptyText="No states found."
              />
            </Field>

            <Field>
              <FieldLabel>District</FieldLabel>
              <GroupedCombobox
                value={districtId}
                onValueChange={(v) => {
                  const next = v ? (v === districtId ? "" : v) : "";
                  setDistrictId(next);
                  setMandalId("");
                }}
                groups={districtFilterGroups}
                placeholder={stateId ? "All districts" : "Select state first"}
                emptyText={stateId ? "No districts found." : "Select a state first."}
                disabled={!stateId}
              />
            </Field>

            <Field>
              <FieldLabel>Mandal</FieldLabel>
              <GroupedCombobox
                value={mandalId}
                onValueChange={(v) => {
                  const next = v ? (v === mandalId ? "" : v) : "";
                  setMandalId(next);
                }}
                groups={mandalFilterGroups}
                placeholder={districtId ? "All mandals" : "Select district first"}
                emptyText={districtId ? "No mandals found." : "Select a district first."}
                disabled={!districtId}
              />
            </Field>
          </div>

          <Field>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={includeInactive}
                onCheckedChange={(v) => setIncludeInactive(Boolean(v))}
              />
              <span>Include inactive</span>
            </label>
          </Field>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Village</TableHead>
                  <TableHead>Mandal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-xs text-muted-foreground"
                    >
                      Loading villages…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-xs text-muted-foreground"
                    >
                      No villages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs font-medium">
                        {row.name}
                      </TableCell>
                      <TableCell className="text-xs">
                        {mandalById.get(row.mandalId)?.name ?? "—"}
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
                : "Failed to load villages."}
            </div>
          )}
        </CardContent>
      </Card>

      <VillageDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New village"
        description="Add a village under a mandal."
        initialValues={createInitialValues}
        onSave={(data) => {
          lastCreateValuesRef.current = data;
          createMutation.mutate({
            mandalId: data.mandalId,
            name: data.name,
            isActive: data.isActive,
          });
        }}
        isSaving={createMutation.isPending}
        mandalGroups={mandalGroups}
        disableMandal={Boolean(mandalId)}
      />

      <VillageDialog
        open={Boolean(editing)}
        onOpenChange={(open) => (!open ? setEditing(null) : null)}
        title="Edit village"
        description="Update village details."
        initialValues={{
          mandalId: editing?.mandalId ?? "",
          name: editing?.name ?? "",
          isActive: editing?.isActive ?? true,
        }}
        onSave={(data) => {
          if (!editing) return;
          updateMutation.mutate({
            id: editing.id,
            payload: {
              name: data.name,
              isActive: data.isActive,
            },
          });
        }}
        isSaving={updateMutation.isPending}
        mandalGroups={mandalGroups}
        disableMandal
      />

      <Dialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => (!open ? setDeactivateTarget(null) : null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate village?</DialogTitle>
            <DialogDescription>
              This will hide the village from selection. Existing centers and
              records will not be changed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deactivateTarget) return;
                deactivateMutation.mutate(deactivateTarget.id);
              }}
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
            <DialogTitle>Delete village permanently?</DialogTitle>
            <DialogDescription>
              This will permanently delete the village. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
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
