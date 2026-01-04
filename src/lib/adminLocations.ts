import { apiFetch } from "./api";
import {
    AdminDistrictResponseSchema,
    AdminDistrictsListResponseSchema,
    AdminMandalResponseSchema,
    AdminMandalsListResponseSchema,
    AdminStateResponseSchema,
    AdminStatesListResponseSchema,
    AdminVillageResponseSchema,
    AdminVillagesListResponseSchema,
    CreateAdminDistrictRequestSchema,
    CreateAdminMandalRequestSchema,
    CreateAdminStateRequestSchema,
    CreateAdminVillageRequestSchema,
    UpdateAdminDistrictRequestSchema,
    UpdateAdminMandalRequestSchema,
    UpdateAdminStateRequestSchema,
    UpdateAdminVillageRequestSchema,
    type CreateAdminDistrictRequest,
    type CreateAdminMandalRequest,
    type CreateAdminStateRequest,
    type CreateAdminVillageRequest,
    type UpdateAdminDistrictRequest,
    type UpdateAdminMandalRequest,
    type UpdateAdminStateRequest,
    type UpdateAdminVillageRequest,
} from "../types/adminLocations";

// --- States ---

export async function listAdminStates(params: {
    page?: number;
    limit?: number;
    search?: string;
    includeInactive?: boolean;
} = {}) {
    const qs = new URLSearchParams();
    if (typeof params.page === "number") qs.set("page", String(params.page));
    if (typeof params.limit === "number") qs.set("limit", String(params.limit));
    if (params.search && params.search.trim() !== "") qs.set("search", params.search.trim());
    if (typeof params.includeInactive === "boolean") qs.set("includeInactive", String(params.includeInactive));

    const res = await apiFetch(`/admin/locations/states${qs.toString() ? `?${qs}` : ""}`);
    const parsed = AdminStatesListResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function createAdminState(payload: CreateAdminStateRequest) {
    const validated = CreateAdminStateRequestSchema.safeParse(payload);
    if (!validated.success) throw new Error("Check the state details and try again.");

    const res = await apiFetch("/admin/locations/states", {
        method: "POST",
        body: JSON.stringify(validated.data),
    });

    const parsed = AdminStateResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function updateAdminState(id: string, payload: UpdateAdminStateRequest) {
    const validated = UpdateAdminStateRequestSchema.safeParse(payload);
    if (!validated.success) throw new Error("Check the state details and try again.");

    const res = await apiFetch(`/admin/locations/states/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(validated.data),
    });

    const parsed = AdminStateResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function deactivateAdminState(id: string) {
    const res = await apiFetch(`/admin/locations/states/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });

    const parsed = AdminStateResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function deleteAdminStatePermanently(id: string) {
    const res = await apiFetch(`/admin/locations/states/${encodeURIComponent(id)}/permanent`, {
        method: "DELETE",
    });

    const parsed = AdminStateResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function bulkUploadStates(items: string) {
    const res = await apiFetch("/admin/locations/states/bulk", {
        method: "POST",
        body: JSON.stringify({ csvData: items }),
    });
    return res;
}

// --- Districts ---

export async function listAdminDistricts(params: {
    page?: number;
    limit?: number;
    search?: string;
    stateId?: string;
    includeInactive?: boolean;
} = {}) {
    const qs = new URLSearchParams();
    if (typeof params.page === "number") qs.set("page", String(params.page));
    if (typeof params.limit === "number") qs.set("limit", String(params.limit));
    if (params.search && params.search.trim() !== "") qs.set("search", params.search.trim());
    if (params.stateId && params.stateId.trim() !== "") qs.set("stateId", params.stateId.trim());
    if (typeof params.includeInactive === "boolean") qs.set("includeInactive", String(params.includeInactive));

    const res = await apiFetch(`/admin/locations/districts${qs.toString() ? `?${qs}` : ""}`);
    const parsed = AdminDistrictsListResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function createAdminDistrict(payload: CreateAdminDistrictRequest) {
    const validated = CreateAdminDistrictRequestSchema.safeParse(payload);
    if (!validated.success) throw new Error("Check the district details and try again.");

    const res = await apiFetch("/admin/locations/districts", {
        method: "POST",
        body: JSON.stringify(validated.data),
    });

    const parsed = AdminDistrictResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function updateAdminDistrict(id: string, payload: UpdateAdminDistrictRequest) {
    const validated = UpdateAdminDistrictRequestSchema.safeParse(payload);
    if (!validated.success) throw new Error("Check the district details and try again.");

    const res = await apiFetch(`/admin/locations/districts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(validated.data),
    });

    const parsed = AdminDistrictResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function deactivateAdminDistrict(id: string) {
    const res = await apiFetch(`/admin/locations/districts/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });

    const parsed = AdminDistrictResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function deleteAdminDistrictPermanently(id: string) {
    const res = await apiFetch(`/admin/locations/districts/${encodeURIComponent(id)}/permanent`, {
        method: "DELETE",
    });

    const parsed = AdminDistrictResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function bulkUploadDistricts(parentId: string, items: string) {
    const res = await apiFetch("/admin/locations/districts/bulk", {
        method: "POST",
        body: JSON.stringify({ parentId, items }),
    });
    return res;
}

// --- Mandals ---

export async function listAdminMandals(params: {
    page?: number;
    limit?: number;
    search?: string;
    districtId?: string;
    includeInactive?: boolean;
} = {}) {
    const qs = new URLSearchParams();
    if (typeof params.page === "number") qs.set("page", String(params.page));
    if (typeof params.limit === "number") qs.set("limit", String(params.limit));
    if (params.search && params.search.trim() !== "") qs.set("search", params.search.trim());
    if (params.districtId && params.districtId.trim() !== "") qs.set("districtId", params.districtId.trim());
    if (typeof params.includeInactive === "boolean") qs.set("includeInactive", String(params.includeInactive));

    const res = await apiFetch(`/admin/locations/mandals${qs.toString() ? `?${qs}` : ""}`);
    const parsed = AdminMandalsListResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function createAdminMandal(payload: CreateAdminMandalRequest) {
    const validated = CreateAdminMandalRequestSchema.safeParse(payload);
    if (!validated.success) throw new Error("Check the mandal details and try again.");

    const res = await apiFetch("/admin/locations/mandals", {
        method: "POST",
        body: JSON.stringify(validated.data),
    });

    const parsed = AdminMandalResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function updateAdminMandal(id: string, payload: UpdateAdminMandalRequest) {
    const validated = UpdateAdminMandalRequestSchema.safeParse(payload);
    if (!validated.success) throw new Error("Check the mandal details and try again.");

    const res = await apiFetch(`/admin/locations/mandals/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(validated.data),
    });

    const parsed = AdminMandalResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function deactivateAdminMandal(id: string) {
    const res = await apiFetch(`/admin/locations/mandals/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });

    const parsed = AdminMandalResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function deleteAdminMandalPermanently(id: string) {
    const res = await apiFetch(`/admin/locations/mandals/${encodeURIComponent(id)}/permanent`, {
        method: "DELETE",
    });

    const parsed = AdminMandalResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function bulkUploadMandals(parentId: string, items: string) {
    const res = await apiFetch("/admin/locations/mandals/bulk", {
        method: "POST",
        body: JSON.stringify({ parentId, items }),
    });
    return res;
}

// --- Villages ---

export async function listAdminVillages(params: {
    page?: number;
    limit?: number;
    search?: string;
    stateId?: string;
    districtId?: string;
    mandalId?: string;
    includeInactive?: boolean;
} = {}) {
    const qs = new URLSearchParams();
    if (typeof params.page === "number") qs.set("page", String(params.page));
    if (typeof params.limit === "number") qs.set("limit", String(params.limit));
    if (params.search && params.search.trim() !== "") qs.set("search", params.search.trim());
    if (params.stateId && params.stateId.trim() !== "") qs.set("stateId", params.stateId.trim());
    if (params.districtId && params.districtId.trim() !== "") qs.set("districtId", params.districtId.trim());
    if (params.mandalId && params.mandalId.trim() !== "") qs.set("mandalId", params.mandalId.trim());
    if (typeof params.includeInactive === "boolean") qs.set("includeInactive", String(params.includeInactive));

    const res = await apiFetch(`/admin/locations/villages${qs.toString() ? `?${qs}` : ""}`);
    const parsed = AdminVillagesListResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function createAdminVillage(payload: CreateAdminVillageRequest) {
    const validated = CreateAdminVillageRequestSchema.safeParse(payload);
    if (!validated.success) throw new Error("Check the village details and try again.");

    const res = await apiFetch("/admin/locations/villages", {
        method: "POST",
        body: JSON.stringify(validated.data),
    });

    const parsed = AdminVillageResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function updateAdminVillage(id: string, payload: UpdateAdminVillageRequest) {
    const validated = UpdateAdminVillageRequestSchema.safeParse(payload);
    if (!validated.success) throw new Error("Check the village details and try again.");

    const res = await apiFetch(`/admin/locations/villages/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(validated.data),
    });

    const parsed = AdminVillageResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function deactivateAdminVillage(id: string) {
    const res = await apiFetch(`/admin/locations/villages/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });

    const parsed = AdminVillageResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function deleteAdminVillagePermanently(id: string) {
    const res = await apiFetch(`/admin/locations/villages/${encodeURIComponent(id)}/permanent`, {
        method: "DELETE",
    });

    const parsed = AdminVillageResponseSchema.safeParse(res);
    if (!parsed.success) throw new Error("Unexpected response from server.");
    return parsed.data;
}

export async function bulkUploadVillages(parentId: string, items: string) {
    const res = await apiFetch("/admin/locations/villages/bulk", {
        method: "POST",
        body: JSON.stringify({ parentId, items }),
    });
    return res;
}
