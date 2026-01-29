// Duplicate a company + its account plans + permissions in the real Admin API.

import { NextResponse } from 'next/server';
import { adminApi } from '@/lib/externalApi';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, orgnr } = body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    if (!orgnr) {
      return NextResponse.json(
        { error: 'New orgnr is required to duplicate a client' },
        { status: 400 }
      );
    }

    const sourceOrgnr = Number(id);
    const newOrgnr = Number(orgnr);

    if (!Number.isFinite(sourceOrgnr) || sourceOrgnr <= 0) {
      return NextResponse.json(
        { error: 'Invalid source orgnr' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(newOrgnr) || newOrgnr <= 0) {
      return NextResponse.json(
        { error: 'Invalid new orgnr' },
        { status: 400 }
      );
    }

    // Load source data
    const [sourceCompany, sourcePlans, sourcePerms] = await Promise.all([
      adminApi.getCompany(sourceOrgnr),
      adminApi.getAccountPlansForOrgnr(sourceOrgnr),
      adminApi.getPermissionsForOrgnr(sourceOrgnr),
    ]);

    if (!sourceCompany) {
      return NextResponse.json(
        { error: 'Source client not found' },
        { status: 404 }
      );
    }

    // Create new company
    const newCompany = await adminApi.createCompany({
      orgnr: newOrgnr,
      name: name.trim(),
    });

    // Duplicate account plans
    for (const plan of sourcePlans) {
      await adminApi.createAccountPlan({
        orgnr: newCompany.orgnr,
        account: plan.account,
        groupId: plan.groupId,
        name: plan.name,
      });
    }

    // Duplicate permissions
    for (const perm of sourcePerms) {
      await adminApi.createPermission({
        orgnr: newCompany.orgnr,
        email: perm.email,
        fullAccess: perm.fullAccess,
        groupId: perm.groupId,
      });
    }

    return NextResponse.json(
      { client: { id: String(newCompany.orgnr), name: newCompany.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Duplicate error (backend)', error);
    return NextResponse.json(
      { error: 'Failed to duplicate client' },
      { status: 500 }
    );
  }
}
