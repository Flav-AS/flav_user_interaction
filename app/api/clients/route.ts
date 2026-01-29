import { NextResponse } from 'next/server';
import { getClientSummariesFromBackend, adminApi } from '@/lib/externalApi';

// List clients backed by the real Admin API (companies + account plans + permissions)
export async function GET() {
  try {
    const clients = await getClientSummariesFromBackend();
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error fetching clients from backend', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// Create a new company in the real Admin API.
// Expects: { orgnr: number | string, name: string }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgnr, name } = body || {};

    if (!orgnr || !name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Both orgnr and name are required' },
        { status: 400 }
      );
    }

    const parsedOrgnr = Number(orgnr);
    if (!Number.isFinite(parsedOrgnr) || parsedOrgnr <= 0) {
      return NextResponse.json(
        { error: 'orgnr must be a positive number' },
        { status: 400 }
      );
    }

    const company = await adminApi.createCompany({ orgnr: parsedOrgnr, name: name.trim() });

    // Minimal client payload – enough for the UI to redirect to /admin/clients/[id]
    return NextResponse.json(
      { client: { id: String(company.orgnr), name: company.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating company via backend', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
