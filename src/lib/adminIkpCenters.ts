import { apiFetch } from "./api";
import {
  AdminIkpCenterResponseSchema,
  AdminIkpCentersListResponseSchema,
  CreateAdminIkpCenterRequestSchema,
  UpdateAdminIkpCenterRequestSchema,
  type CreateAdminIkpCenterRequest,
  type UpdateAdminIkpCenterRequest,
} from "../types/adminIkpCenters";

export async function listAdminIkpCenters(params: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  stateId?: string;
  district?: string;
  districtId?: string;
  mandal?: string;
  mandalId?: string;
  village?: string;
  villageId?: string;
  includeInactive?: boolean;
} = {}) {
  const searchParams = new URLSearchParams();
  if (typeof params.page === "number") searchParams.set("page", String(params.page));
  if (typeof params.limit === "number") searchParams.set("limit", String(params.limit));
  if (params.search && params.search.trim() !== "") searchParams.set("search", params.search.trim());
  if (params.state && params.state.trim() !== "") searchParams.set("state", params.state.trim());
  if (params.stateId && params.stateId.trim() !== "") searchParams.set("stateId", params.stateId.trim());
  if (params.district && params.district.trim() !== "") searchParams.set("district", params.district.trim());
  if (params.districtId && params.districtId.trim() !== "") {
    searchParams.set("districtId", params.districtId.trim());
  }
  if (params.mandal && params.mandal.trim() !== "") searchParams.set("mandal", params.mandal.trim());
  if (params.mandalId && params.mandalId.trim() !== "") searchParams.set("mandalId", params.mandalId.trim());
  if (params.village && params.village.trim() !== "") searchParams.set("village", params.village.trim());
  if (params.villageId && params.villageId.trim() !== "") searchParams.set("villageId", params.villageId.trim());
  if (typeof params.includeInactive === "boolean") {
    searchParams.set("includeInactive", String(params.includeInactive));
  }

  const qs = searchParams.toString();
  const res = await apiFetch(`/admin/ikp-centers${qs ? `?${qs}` : ""}`);
  const parsed = AdminIkpCentersListResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error("Unexpected response from server.");
  return parsed.data;
}

export async function createAdminIkpCenter(payload: CreateAdminIkpCenterRequest) {
  const validated = CreateAdminIkpCenterRequestSchema.safeParse(payload);
  if (!validated.success) throw new Error("Check the center details and try again.");

  const res = await apiFetch("/admin/ikp-centers", {
    method: "POST",
    body: JSON.stringify(validated.data),
  });

  const parsed = AdminIkpCenterResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error("Unexpected response from server.");
  return parsed.data;
}

export async function deleteAdminIkpCenterPermanently(id: string) {
  const res = await apiFetch(`/admin/ikp-centers/${encodeURIComponent(id)}/permanent`, {
    method: "DELETE",
  });

  const parsed = AdminIkpCenterResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error("Unexpected response from server.");
  return parsed.data;
}

export async function updateAdminIkpCenter(id: string, payload: UpdateAdminIkpCenterRequest) {
  const validated = UpdateAdminIkpCenterRequestSchema.safeParse(payload);
  if (!validated.success) throw new Error("Check the center details and try again.");

  const res = await apiFetch(`/admin/ikp-centers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(validated.data),
  });

  const parsed = AdminIkpCenterResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error("Unexpected response from server.");
  return parsed.data;
}

export async function deactivateAdminIkpCenter(id: string) {
  const res = await apiFetch(`/admin/ikp-centers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  const parsed = AdminIkpCenterResponseSchema.safeParse(res);
  if (!parsed.success) throw new Error("Unexpected response from server.");
  return parsed.data;
}

export async function bulkUploadIkpCenters(villageId: string, items: string) {
  const res = await apiFetch("/admin/ikp-centers/bulk", {
    method: "POST",
    body: JSON.stringify({ villageId, items }),
  });
  return res;
}
