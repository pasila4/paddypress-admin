import { z } from "zod";

export const AdminStateSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type AdminState = z.infer<typeof AdminStateSchema>;

export const AdminDistrictSchema = z.object({
    id: z.string(),
    stateId: z.string(),
    code: z.string().optional().nullable(),
    name: z.string(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type AdminDistrict = z.infer<typeof AdminDistrictSchema>;

export const AdminMandalSchema = z.object({
    id: z.string(),
    districtId: z.string(),
    code: z.string().optional().nullable(),
    name: z.string(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type AdminMandal = z.infer<typeof AdminMandalSchema>;

export const AdminVillageSchema = z.object({
    id: z.string(),
    mandalId: z.string(),
    code: z.string().optional().nullable(),
    pincode: z.string().optional().nullable(),
    name: z.string(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type AdminVillage = z.infer<typeof AdminVillageSchema>;

export const PagedAdminResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        success: z.boolean(),
        data: z.object({
            items: z.array(itemSchema),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
        }),
        message: z.string().optional(),
    });

export const AdminStatesListResponseSchema = PagedAdminResponseSchema(AdminStateSchema);
export type AdminStatesListResponse = z.infer<typeof AdminStatesListResponseSchema>;

export const AdminDistrictsListResponseSchema = PagedAdminResponseSchema(AdminDistrictSchema);
export type AdminDistrictsListResponse = z.infer<typeof AdminDistrictsListResponseSchema>;

export const AdminMandalsListResponseSchema = PagedAdminResponseSchema(AdminMandalSchema);
export type AdminMandalsListResponse = z.infer<typeof AdminMandalsListResponseSchema>;

export const AdminVillagesListResponseSchema = PagedAdminResponseSchema(AdminVillageSchema);
export type AdminVillagesListResponse = z.infer<typeof AdminVillagesListResponseSchema>;

export const AdminStateResponseSchema = z.object({
    success: z.boolean(),
    data: AdminStateSchema,
    message: z.string().optional(),
});

export type AdminStateResponse = z.infer<typeof AdminStateResponseSchema>;

export const AdminDistrictResponseSchema = z.object({
    success: z.boolean(),
    data: AdminDistrictSchema,
    message: z.string().optional(),
});

export type AdminDistrictResponse = z.infer<typeof AdminDistrictResponseSchema>;

export const AdminMandalResponseSchema = z.object({
    success: z.boolean(),
    data: AdminMandalSchema,
    message: z.string().optional(),
});

export type AdminMandalResponse = z.infer<typeof AdminMandalResponseSchema>;

export const AdminVillageResponseSchema = z.object({
    success: z.boolean(),
    data: AdminVillageSchema,
    message: z.string().optional(),
});

export type AdminVillageResponse = z.infer<typeof AdminVillageResponseSchema>;

export const CreateAdminStateRequestSchema = z.object({
    code: z.string().min(1, "Enter a state code."),
    name: z.string().min(1, "Enter a state name."),
    isActive: z.boolean().optional(),
});

export type CreateAdminStateRequest = z.infer<typeof CreateAdminStateRequestSchema>;

export const UpdateAdminStateRequestSchema = CreateAdminStateRequestSchema.partial();
export type UpdateAdminStateRequest = z.infer<typeof UpdateAdminStateRequestSchema>;

export const CreateAdminDistrictRequestSchema = z.object({
    stateId: z.string().min(1, "Select a state."),
    name: z.string().min(1, "Enter a district name."),
    code: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type CreateAdminDistrictRequest = z.infer<typeof CreateAdminDistrictRequestSchema>;

export const UpdateAdminDistrictRequestSchema = z
    .object({
        name: z.string().min(1, "Enter a district name.").optional(),
        code: z.string().optional(),
        isActive: z.boolean().optional(),
    })
    .partial();

export type UpdateAdminDistrictRequest = z.infer<typeof UpdateAdminDistrictRequestSchema>;

export const CreateAdminMandalRequestSchema = z.object({
    districtId: z.string().min(1, "Select a district."),
    name: z.string().min(1, "Enter a mandal name."),
    code: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type CreateAdminMandalRequest = z.infer<typeof CreateAdminMandalRequestSchema>;

export const UpdateAdminMandalRequestSchema = z
    .object({
        name: z.string().min(1, "Enter a mandal name.").optional(),
        code: z.string().optional(),
        isActive: z.boolean().optional(),
    })
    .partial();

export type UpdateAdminMandalRequest = z.infer<typeof UpdateAdminMandalRequestSchema>;

export const CreateAdminVillageRequestSchema = z.object({
    mandalId: z.string().min(1, "Select a mandal."),
    name: z.string().min(1, "Enter a village name."),
    code: z.string().optional(),
    pincode: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type CreateAdminVillageRequest = z.infer<typeof CreateAdminVillageRequestSchema>;

export const UpdateAdminVillageRequestSchema = z
    .object({
        name: z.string().min(1, "Enter a village name.").optional(),
        code: z.string().optional(),
        pincode: z.string().optional(),
        isActive: z.boolean().optional(),
    })
    .partial();

export type UpdateAdminVillageRequest = z.infer<typeof UpdateAdminVillageRequestSchema>;

export const BulkUploadResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        created: z.number()
    }),
    message: z.string().optional()
});
export type BulkUploadResponse = z.infer<typeof BulkUploadResponseSchema>;
