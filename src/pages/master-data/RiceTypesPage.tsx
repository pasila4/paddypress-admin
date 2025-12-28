import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontalIcon } from "lucide-react";

import { useUiStore } from "@/store";
import {
  listMasterRiceTypes,
  upsertMasterRiceType,
} from "@/lib/masterRiceTypes";
import type { MasterRiceType } from "@/types/masterRiceTypes";

const riceTypeSchema = z.object({
  code: z.string().min(1, "Enter a rice type code.").toUpperCase(),
  name: z.string().min(1, "Enter a rice type name."),
  isActive: z.boolean(),
});

type RiceTypeFormData = z.infer<typeof riceTypeSchema>;

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "default" : "outline"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function CreateRiceTypeDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onSave: (data: RiceTypeFormData) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<RiceTypeFormData>({
    resolver: zodResolver(riceTypeSchema),
    defaultValues: { isActive: true },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (props.open) reset({ code: "", name: "", isActive: true });
  }, [props.open, reset]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New rice type</DialogTitle>
          <DialogDescription>
            Codes are stored in uppercase. Use short stable codes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(props.onSave)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="createCode">Code</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Code</InputGroupAddon>
                <InputGroupInput id="createCode" placeholder="COMMON" {...register("code")} />
              </InputGroup>
              <FieldError errors={errors.code ? [errors.code] : []} />
            </Field>
            <Field>
              <FieldLabel htmlFor="createName">Name</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Name</InputGroupAddon>
                <InputGroupInput id="createName" placeholder="Common" {...register("name")} />
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
            <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={props.isSaving || !isValid}>
              {props.isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditRiceTypeDialog(props: {
  item: MasterRiceType | null;
  onClose: () => void;
  isSaving: boolean;
  onSave: (data: RiceTypeFormData) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<RiceTypeFormData>({
    resolver: zodResolver(riceTypeSchema),
    mode: "onChange",
  });

  React.useEffect(() => {
    if (props.item) {
      reset({
        code: props.item.code,
        name: props.item.name,
        isActive: props.item.isActive,
      });
    }
  }, [props.item, reset]);

  return (
    <Dialog open={Boolean(props.item)} onOpenChange={(open) => (!open ? props.onClose() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit rice type</DialogTitle>
          <DialogDescription>Update the rice type details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(props.onSave)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="editCode">Code</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Code</InputGroupAddon>
                <InputGroupInput id="editCode" disabled {...register("code")} />
              </InputGroup>
              <FieldError errors={errors.code ? [errors.code] : []} />
            </Field>
            <Field>
              <FieldLabel htmlFor="editName">Name</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Name</InputGroupAddon>
                <InputGroupInput id="editName" {...register("name")} />
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
            <Button type="button" variant="outline" onClick={props.onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={props.isSaving || !isValid || !isDirty}>
              {props.isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function RiceTypesPage() {
  const { showToast } = useUiStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = React.useState("");
  const [includeInactive, setIncludeInactive] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<MasterRiceType | null>(null);

  const riceTypesQuery = useQuery({
    queryKey: ["masterRiceTypes", search, includeInactive],
    queryFn: () => listMasterRiceTypes({ search, includeInactive }),
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: RiceTypeFormData) => {
      return upsertMasterRiceType(data.code, {
        name: data.name,
        isActive: data.isActive,
      });
    },
    onSuccess: (res) => {
      showToast(res.message ?? "Rice type saved.", "success");
      void queryClient.invalidateQueries({ queryKey: ["masterRiceTypes"] });
      setCreateOpen(false);
      setEditItem(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Save failed.";
      showToast(message, "error");
    },
  });

  const items = riceTypesQuery.data?.data.items ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Rice Types</CardTitle>
            <div className="text-sm text-muted-foreground">
              Maintain the master list of rice types (example: Common, Grade A).
            </div>
          </div>
          <Button size="lg" onClick={() => setCreateOpen(true)}>
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="max-w-sm flex-1">
            <Field>
              <FieldLabel htmlFor="search">Search</FieldLabel>
              <InputGroup>
                <InputGroupAddon>Search</InputGroupAddon>
                <InputGroupInput
                  id="search"
                  placeholder="Type a code or name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Field>
          </div>
          <div className="flex items-center pb-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={includeInactive}
                onCheckedChange={(v) => setIncludeInactive(Boolean(v))}
              />
              <span>Show inactive</span>
            </label>
          </div>
        </div>

        {riceTypesQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : riceTypesQuery.isError ? (
          <div className="text-sm text-destructive">Failed to load rice types.</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No rice types found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.code}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>
                    <ActiveBadge isActive={t.isActive} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label="Open actions"
                        className={buttonVariants({ size: "icon-sm", variant: "ghost" })}
                      >
                        <MoreHorizontalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditItem(t)}>Edit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CreateRiceTypeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isSaving={upsertMutation.isPending}
        onSave={(data) => upsertMutation.mutate(data)}
      />

      <EditRiceTypeDialog
        item={editItem}
        onClose={() => setEditItem(null)}
        isSaving={upsertMutation.isPending}
        onSave={(data) => upsertMutation.mutate(data)}
      />
    </Card>
  );
}
