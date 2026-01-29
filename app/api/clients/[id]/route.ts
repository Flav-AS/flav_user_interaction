import { NextResponse } from 'next/server';
import { adminApi, buildClientFromBackend, AccountPlanDto, PermissionDto, AccountGroupDto } from '@/lib/externalApi';
import type { Client, AccountGroup, Account, UserPermission } from '@/types';

// Helper to parse orgnr from route id
function parseOrgnr(id: string) {
  const orgnr = Number(id);
  if (!Number.isFinite(orgnr) || orgnr <= 0) {
    throw new Error('Invalid orgnr');
  }
  return orgnr;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgnr = parseOrgnr(id);

    const client = await buildClientFromBackend(orgnr);
    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error fetching client from backend', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// Persist all changes for a client (company + account plans + permissions) back to the real Admin API.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgnr = parseOrgnr(id);
    const newClient = (await request.json()) as Client;

    // Fetch current state from backend for diffing
    const [company, currentPlans, allGroups, currentPerms] = await Promise.all([
      adminApi.getCompany(orgnr),
      adminApi.getAccountPlansForOrgnr(orgnr),
      adminApi.getAccountGroups(),
      adminApi.getPermissionsForOrgnr(orgnr),
    ]);

    // 1) Company name
    if (newClient.name && newClient.name.trim() && newClient.name !== company.name) {
      await adminApi.updateCompany(orgnr, { name: newClient.name.trim() });
    }

    // 2) Account groups (global, not per-org)
    const groupById = new Map<number, AccountGroupDto>();
    for (const g of allGroups) {
      groupById.set(g.id, g);
    }

    const groupIdMap = new Map<string, number>(); // clientGroupId (string) -> backend id (number)

    // Existing groups with numeric ids
    for (const g of newClient.accountGroups) {
      const numId = Number(g.id);
      if (Number.isFinite(numId)) {
        groupIdMap.set(g.id, numId);
      }
    }

    // Create any new groups that don't yet exist in backend
    const pendingNewGroups = newClient.accountGroups.filter((g) => !groupIdMap.has(g.id));

    let createdSomething = true;
    while (pendingNewGroups.length > 0 && createdSomething) {
      createdSomething = false;

      for (let i = pendingNewGroups.length - 1; i >= 0; i--) {
        const g = pendingNewGroups[i] as AccountGroup & { parentId?: string };
        const parentKey = g.parentGroupId ?? (g as any).parentId ?? '';

        let parentBackendId: number | undefined;
        if (!parentKey) {
          parentBackendId = 0; // root
        } else if (groupIdMap.has(parentKey)) {
          parentBackendId = groupIdMap.get(parentKey)!;
        } else {
          // Parent not created yet – skip this round
          continue;
        }

        const created = await adminApi.createAccountGroup({
          groupName: g.name,
          parentId: parentBackendId,
        });

        groupIdMap.set(g.id, created.id);
        groupById.set(created.id, created);
        pendingNewGroups.splice(i, 1);
        createdSomething = true;
      }
    }

    // Update existing groups (name / parent)
    for (const g of newClient.accountGroups) {
      const backendId = groupIdMap.get(g.id);
      if (!backendId) continue;

      const backendGroup = groupById.get(backendId);
      if (!backendGroup) continue;

      const desiredName = g.name;
      const desiredParentKey = g.parentGroupId ?? (g as any).parentId ?? '';
      const desiredParentId = desiredParentKey ? Number(desiredParentKey) : 0;

      const hasNameChange = desiredName !== backendGroup.groupName;
      const hasParentChange = desiredParentId !== backendGroup.parentId;

      if (hasNameChange || hasParentChange) {
        await adminApi.updateAccountGroup(backendId, {
          groupName: hasNameChange ? desiredName : undefined,
          parentId: hasParentChange ? desiredParentId : undefined,
        });
      }
    }

    // 3) Account plans (per-org chart of accounts)
    const currentByAccount = new Map<number, AccountPlanDto>();
    for (const plan of currentPlans) {
      currentByAccount.set(plan.account, plan);
    }

    type NewAccountState = {
      accountNumber: number;
      name: string;
      groupId: number;
      originalAccount?: number;
    };

    const newAccounts: NewAccountState[] = [];

    function parseOriginalAccountId(acc: Account): number | undefined {
      const match = /^([0-9]+)-([0-9]+)$/.exec(acc.id);
      if (!match) return undefined;
      const originalOrgnr = Number(match[1]);
      const originalAccount = Number(match[2]);
      if (!Number.isFinite(originalOrgnr) || originalOrgnr !== orgnr) return undefined;
      return Number.isFinite(originalAccount) ? originalAccount : undefined;
    }

    for (const g of newClient.accountGroups) {
      const backendGroupId = groupIdMap.get(g.id) ?? Number(g.id);
      if (!Number.isFinite(backendGroupId)) continue;

      for (const acc of g.accounts) {
        const originalAccount = parseOriginalAccountId(acc);
        const accountNumber = acc.accountNumber;
        if (!Number.isFinite(accountNumber)) continue;

        newAccounts.push({
          accountNumber,
          name: acc.accountName,
          groupId: backendGroupId,
          originalAccount,
        });
      }
    }

    const seenOriginalAccounts = new Set<number>();

    for (const acc of newAccounts) {
      if (acc.originalAccount != null && currentByAccount.has(acc.originalAccount)) {
        // Existing account plan
        const original = currentByAccount.get(acc.originalAccount)!;

        if (acc.accountNumber !== acc.originalAccount) {
          // Account number changed – emulate by delete + create
          await adminApi.deleteAccountPlan(orgnr, original.account);
          await adminApi.createAccountPlan({
            orgnr,
            account: acc.accountNumber,
            groupId: acc.groupId,
            name: acc.name,
          });
        } else {
          // Same account number – just update name/group if changed
          const needsUpdate =
            original.name !== acc.name || original.groupId !== acc.groupId;

          if (needsUpdate) {
            await adminApi.updateAccountPlan(orgnr, acc.accountNumber, {
              name: acc.name,
              groupId: acc.groupId,
            });
          }
        }

        seenOriginalAccounts.add(acc.originalAccount);
      } else {
        // New account plan
        await adminApi.createAccountPlan({
          orgnr,
          account: acc.accountNumber,
          groupId: acc.groupId,
          name: acc.name,
        });
      }
    }

    // Delete removed account plans
    for (const [account, plan] of currentByAccount.entries()) {
      if (!seenOriginalAccounts.has(account)) {
        await adminApi.deleteAccountPlan(orgnr, plan.account);
      }
    }

    // 4) Permissions
    const desiredUiPerms: UserPermission[] =
      ((newClient as any).userPermissions as UserPermission[] | undefined) ||
      ((newClient.authorizedEmails as any) as UserPermission[] | undefined) ||
      [];

    type PermKey = string; // `${email}|${fullAccess ? '1' : '0'}|${groupId}`

    const keyForPerm = (email: string, fullAccess: boolean, groupId: number): PermKey =>
      `${email.toLowerCase()}|${fullAccess ? '1' : '0'}|${groupId}`;

    const currentByKey = new Map<PermKey, PermissionDto[]>();
    for (const p of currentPerms) {
      const key = keyForPerm(p.email, p.fullAccess, p.groupId);
      const arr = currentByKey.get(key) ?? [];
      arr.push(p);
      currentByKey.set(key, arr);
    }

    const desiredKeys = new Set<PermKey>();

    for (const p of desiredUiPerms) {
      const email = p.email?.trim();
      if (!email) continue;

      if (p.accessLevel === 'full') {
        // Represent full access as a single row with groupId 0
        const key = keyForPerm(email, true, 0);
        desiredKeys.add(key);
      } else {
        const groups = p.allowedGroupIds || [];
        for (const gid of groups) {
          const backendId = groupIdMap.get(gid) ?? Number(gid);
          if (!Number.isFinite(backendId)) continue;
          const key = keyForPerm(email, false, backendId);
          desiredKeys.add(key);
        }
      }
    }

    // Delete permissions that are no longer desired
    for (const [key, existingPerms] of currentByKey.entries()) {
      if (!desiredKeys.has(key)) {
        for (const p of existingPerms) {
          await adminApi.deletePermission(p.id);
        }
      }
    }

    // Create permissions that don't exist yet
    for (const key of desiredKeys) {
      const existing = currentByKey.get(key) ?? [];
      if (existing.length > 0) {
        // Already present – keep one, delete any extras
        for (let i = 1; i < existing.length; i++) {
          await adminApi.deletePermission(existing[i].id);
        }
        continue;
      }

      const [email, fullAccessFlag, groupIdStr] = key.split('|');
      const fullAccess = fullAccessFlag === '1';
      const groupId = Number(groupIdStr);

      await adminApi.createPermission({
        orgnr,
        email,
        fullAccess,
        groupId,
      });
    }

    // Return the fresh state from backend so UI stays in sync
    const updatedClient = await buildClientFromBackend(orgnr);

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error('Error updating client in backend', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgnr = parseOrgnr(id);

    await adminApi.deleteCompany(orgnr);

    // We assume the backend takes care of cascading deletes for account plans/permissions.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company in backend', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
