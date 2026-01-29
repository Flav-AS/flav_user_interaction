import type { Client, ClientSummary, AccountGroup, UserPermission, Account } from '@/types';

// Base configuration for external FLAV Admin API
const RAW_BASE_URL = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || '';

// Allow the value to be copied from Swagger URL directly by stripping the swagger path
const BASE_URL = RAW_BASE_URL.replace(/\/swagger\/(index\.html)?$/i, '');

const API_KEY = process.env.NEXT_PUBLIC_API_Key;
console.log('External API URL:', API_KEY);

if (!BASE_URL) {
  throw new Error('EXTERNAL_API_URL is not configured. Set it in your environment.');
}

if (!API_KEY) {
  throw new Error('API_KEY is not configured. Set it in your environment.');
}

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'X-API-KEY': API_KEY,
};



async function requestJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(defaultHeaders);

  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `External API ${init.method || 'GET'} ${path} failed with ${res.status}`;
    const body = await res.text().catch(() => '');
    if (body) message += `: ${body}`;
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

function get<T>(path: string): Promise<T> {
  return requestJson<T>(path, { method: 'GET' });
}

function post<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function put<T>(path: string, body: unknown): Promise<T> {
  return requestJson<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

function del<T = void>(path: string): Promise<T> {
  return requestJson<T>(path, { method: 'DELETE' });
}

// ========= Raw DTO types from the external API =========

export interface CompanyDto {
  orgnr: number;
  name: string;
}

export interface AccountPlanDto {
  orgnr: number;
  account: number;
  groupId: number;
  name: string;
}

export interface AccountGroupDto {
  id: number;
  groupName: string;
  parentId: number;
}

export interface PermissionDto {
  id: number;
  orgnr: number;
  email: string;
  fullAccess: boolean;
  groupId: number;
}

// ========= Low-level endpoint wrappers =========

export const adminApi = {
  // Companies
  getCompanies: () => get<CompanyDto[]>('/api/admin/companies'),
  getCompany: (orgnr: number) => get<CompanyDto>(`/api/admin/companies/${orgnr}`),
  createCompany: (payload: { orgnr: number; name: string }) =>
    post<CompanyDto>('/api/admin/companies', payload),
  updateCompany: (orgnr: number, payload: { name: string }) =>
    put<CompanyDto>(`/api/admin/companies/${orgnr}`, payload),
  deleteCompany: (orgnr: number) => del<void>(`/api/admin/companies/${orgnr}`),

  // Account plans
  getAccountPlans: () => get<AccountPlanDto[]>('/api/admin/accountplans'),
  getAccountPlansForOrgnr: (orgnr: number) =>
    get<AccountPlanDto[]>(`/api/admin/accountplans/orgnr/${orgnr}`),
  createAccountPlan: (payload: AccountPlanDto) =>
    post<AccountPlanDto>('/api/admin/accountplans', payload),
  updateAccountPlan: (orgnr: number, account: number, payload: Partial<AccountPlanDto>) =>
    put<AccountPlanDto>(`/api/admin/accountplans/${orgnr}/${account}`, payload),
  deleteAccountPlan: (orgnr: number, account: number) =>
    del<void>(`/api/admin/accountplans/${orgnr}/${account}`),

  // Account groups (global)
  getAccountGroups: () => get<AccountGroupDto[]>('/api/admin/accountgroups'),
  getAccountGroup: (id: number) => get<AccountGroupDto>(`/api/admin/accountgroups/${id}`),
  createAccountGroup: (payload: { groupName: string; parentId?: number }) =>
    post<AccountGroupDto>('/api/admin/accountgroups', payload),
  updateAccountGroup: (id: number, payload: { groupName?: string; parentId?: number }) =>
    put<AccountGroupDto>(`/api/admin/accountgroups/${id}`, payload),
  deleteAccountGroup: (id: number) => del<void>(`/api/admin/accountgroups/${id}`),
  getChildAccountGroups: (parentId: number) =>
    get<AccountGroupDto[]>(`/api/admin/accountgroups/children/${parentId}`),

  // Permissions
  getPermissions: () => get<PermissionDto[]>('/api/admin/permissions'),
  getPermissionsForOrgnr: (orgnr: number) =>
    get<PermissionDto[]>(`/api/admin/permissions/orgnr/${orgnr}`),
  getPermissionsForEmail: (email: string) =>
    get<PermissionDto[]>(`/api/admin/permissions/email/${encodeURIComponent(email)}`),
  getPermission: (id: number) => get<PermissionDto>(`/api/admin/permissions/${id}`),
  createPermission: (payload: { orgnr: number; email: string; fullAccess: boolean; groupId: number }) =>
    post<PermissionDto>('/api/admin/permissions', payload),
  updatePermission: (id: number, payload: Partial<PermissionDto>) =>
    put<PermissionDto>(`/api/admin/permissions/${id}`, payload),
  deletePermission: (id: number) => del<void>(`/api/admin/permissions/${id}`),
};

// ========= Mapping helpers to existing dashboard types =========

// Build a Client object (used throughout the admin UI) from backend data for a single orgnr
export async function buildClientFromBackend(orgnr: number): Promise<Client> {
  const [company, accountPlans, accountGroups, permissions] = await Promise.all([
    adminApi.getCompany(orgnr),
    adminApi.getAccountPlansForOrgnr(orgnr),
    adminApi.getAccountGroups(),
    adminApi.getPermissionsForOrgnr(orgnr),
  ]);

  // Index account groups by id for quick lookups
  const groupById = new Map<number, AccountGroupDto>();
  for (const g of accountGroups) {
    groupById.set(g.id, g);
  }

  // Build AccountGroup[] for this client from account plans + global groups
  const groupsMap = new Map<number, AccountGroup>();

  for (const plan of accountPlans) {
    const groupDto = groupById.get(plan.groupId);
    if (!groupDto) continue;

    let group = groupsMap.get(plan.groupId);
    if (!group) {
      const baseGroup: AccountGroup = {
        id: String(groupDto.id),
        name: groupDto.groupName,
        accounts: [],
        parentGroupId: groupDto.parentId ? String(groupDto.parentId) : undefined,
      };

      // Alias for existing tree components which look at "parentId" via any-cast
      (baseGroup as any).parentId = groupDto.parentId ? String(groupDto.parentId) : undefined;

      group = baseGroup;
      groupsMap.set(plan.groupId, group);
    }

    const account: Account = {
      id: `${plan.orgnr}-${plan.account}`,
      accountNumber: plan.account,
      accountName: plan.name,
    };

    group.accounts.push(account);
  }

  const clientAccountGroups = Array.from(groupsMap.values());

  // Map permissions → UserPermission model used in the UI
  const userPermissions: UserPermission[] = permissions.map((p) => ({
    email: p.email,
    accessLevel: p.fullAccess ? 'full' : 'limited',
    // Backend only has a single groupId per permission record; if not full access, treat that as the single allowed group
    allowedGroupIds: p.fullAccess ? [] : [String(p.groupId)],
  }));

  const client: Client = {
    id: String(company.orgnr),
    name: company.name,
    accountGroups: clientAccountGroups,
    groupHierarchy: [], // No hierarchy info from backend yet
    authorizedEmails: userPermissions,
    userPermissions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return client;
}

// Build the list view model used on /admin from backend companies/account plans/permissions
export async function getClientSummariesFromBackend(): Promise<ClientSummary[]> {
  const [companies, accountPlans, permissions] = await Promise.all([
    adminApi.getCompanies(),
    adminApi.getAccountPlans(),
    adminApi.getPermissions(),
  ]);

  const accountCountByOrg = new Map<number, number>();
  for (const plan of accountPlans) {
    accountCountByOrg.set(
      plan.orgnr,
      (accountCountByOrg.get(plan.orgnr) ?? 0) + 1,
    );
  }

  const authorizedCountByOrg = new Map<number, number>();
  for (const p of permissions) {
    const current = authorizedCountByOrg.get(p.orgnr) ?? 0;
    authorizedCountByOrg.set(p.orgnr, current + 1);
  }

  const now = new Date().toISOString();

  return companies.map((c) => ({
    id: String(c.orgnr),
    name: c.name,
    accountCount: accountCountByOrg.get(c.orgnr) ?? 0,
    authorizedUserCount: authorizedCountByOrg.get(c.orgnr) ?? 0,
    updatedAt: now,
  }));
}
