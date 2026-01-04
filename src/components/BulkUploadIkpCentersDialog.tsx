import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
    GroupedCombobox,
    type GroupedComboboxGroup,
} from "@/components/ui/grouped-combobox";

import type { AdminState, AdminDistrict, AdminMandal, AdminVillage } from "@/types/adminLocations";

const bulkUploadSchema = z.object({
    stateId: z.string().min(1, "Select a state."),
    districtId: z.string().min(1, "Select a district."),
    mandalId: z.string().min(1, "Select a mandal."),
    villageId: z.string().min(1, "Select a village."),
    items: z.string().min(1, "Enter center names."),
});

type BulkUploadFormData = z.infer<typeof bulkUploadSchema>;

interface BulkUploadIkpCentersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpload: (villageId: string, items: string) => void;
    isUploading: boolean;
    states: AdminState[];
    districts: AdminDistrict[];
    mandals: AdminMandal[];
    villages: AdminVillage[];
}

export function BulkUploadIkpCentersDialog({
    open,
    onOpenChange,
    onUpload,
    isUploading,
    states,
    districts,
    mandals,
    villages,
}: BulkUploadIkpCentersDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<BulkUploadFormData>({
        resolver: zodResolver(bulkUploadSchema),
        defaultValues: {
            stateId: "",
            districtId: "",
            mandalId: "",
            villageId: "",
            items: "",
        },
        mode: "onChange",
    });

    const selectedStateId = watch("stateId");
    const selectedDistrictId = watch("districtId");
    const selectedMandalId = watch("mandalId");

    const filteredDistricts = React.useMemo(() => {
        if (!selectedStateId) return [];
        return districts.filter((d) => d.stateId === selectedStateId);
    }, [districts, selectedStateId]);

    const filteredMandals = React.useMemo(() => {
        if (!selectedDistrictId) return [];
        return mandals.filter((m) => m.districtId === selectedDistrictId);
    }, [mandals, selectedDistrictId]);

    const filteredVillages = React.useMemo(() => {
        if (!selectedMandalId) return [];
        return villages.filter((v) => v.mandalId === selectedMandalId);
    }, [villages, selectedMandalId]);

    React.useEffect(() => {
        if (!open) {
            reset({
                stateId: "",
                districtId: "",
                mandalId: "",
                villageId: "",
                items: "",
            });
        }
    }, [open, reset]);

    const onSubmit = (data: BulkUploadFormData) => {
        onUpload(data.villageId, data.items);
    };

    const stateGroups: GroupedComboboxGroup[] = React.useMemo(() => ([{
        label: "States",
        options: states.map(s => ({ value: s.id, label: s.name }))
    }]), [states]);

    const districtGroups: GroupedComboboxGroup[] = React.useMemo(() => ([{
        label: "Districts",
        options: filteredDistricts.map(d => ({ value: d.id, label: d.name }))
    }]), [filteredDistricts]);

    const mandalGroups: GroupedComboboxGroup[] = React.useMemo(() => ([{
        label: "Mandals",
        options: filteredMandals.map(m => ({ value: m.id, label: m.name }))
    }]), [filteredMandals]);

    const villageGroups: GroupedComboboxGroup[] = React.useMemo(() => ([{
        label: "Villages",
        options: filteredVillages.map(v => ({ value: v.id, label: v.name }))
    }]), [filteredVillages]);

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
                            <FieldLabel>State</FieldLabel>
                            <Controller
                                control={control}
                                name="stateId"
                                render={({ field }) => (
                                    <GroupedCombobox
                                        value={field.value}
                                        onValueChange={(v) => {
                                            field.onChange(v);
                                            setValue("districtId", "");
                                            setValue("mandalId", "");
                                            setValue("villageId", "");
                                        }}
                                        groups={stateGroups}
                                        placeholder="Select state"
                                        emptyText="No states found."
                                    />
                                )}
                            />
                            <FieldError errors={errors.stateId ? [errors.stateId] : []} />
                        </Field>

                        <Field>
                            <FieldLabel>District</FieldLabel>
                            <Controller
                                control={control}
                                name="districtId"
                                render={({ field }) => (
                                    <GroupedCombobox
                                        value={field.value}
                                        onValueChange={(v) => {
                                            field.onChange(v);
                                            setValue("mandalId", "");
                                            setValue("villageId", "");
                                        }}
                                        groups={districtGroups}
                                        placeholder="Select district"
                                        disabled={!selectedStateId}
                                        emptyText="No districts found."
                                    />
                                )}
                            />
                            <FieldError errors={errors.districtId ? [errors.districtId] : []} />
                        </Field>

                        <Field>
                            <FieldLabel>Mandal</FieldLabel>
                            <Controller
                                control={control}
                                name="mandalId"
                                render={({ field }) => (
                                    <GroupedCombobox
                                        value={field.value}
                                        onValueChange={(v) => {
                                            field.onChange(v);
                                            setValue("villageId", "");
                                        }}
                                        groups={mandalGroups}
                                        placeholder="Select mandal"
                                        disabled={!selectedDistrictId}
                                        emptyText="No mandals found."
                                    />
                                )}
                            />
                            <FieldError errors={errors.mandalId ? [errors.mandalId] : []} />
                        </Field>

                        <Field>
                            <FieldLabel>Village</FieldLabel>
                            <Controller
                                control={control}
                                name="villageId"
                                render={({ field }) => (
                                    <GroupedCombobox
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        groups={villageGroups}
                                        placeholder="Select village"
                                        disabled={!selectedMandalId}
                                        emptyText="No villages found."
                                    />
                                )}
                            />
                            <FieldError errors={errors.villageId ? [errors.villageId] : []} />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel>Center Names (comma separated)</FieldLabel>
                        <Textarea
                            {...register("items")}
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
                            {isUploading ? "Uploading…" : "Upload"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
