import { NextResponse } from 'next/server';
import { dataService, getDefaultPogoMainGroup } from '@/lib/mockData';
import { ClientExport } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = dataService.getClientById(id);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Transform client data into export format
    const exportData: ClientExport = {
      client: {
        id: client.id,
        name: client.name,
      },
      accountGroups: client.accountGroups.map(group => ({
        id: group.id,
        name: group.name,
        accounts: group.accounts.map(account => ({
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          mainGroup: account.customMainGroup ?? getDefaultPogoMainGroup(account.accountNumber),
        })),
      })),
      hierarchy: client.groupHierarchy,
      authorizedEmails: client.authorizedEmails,
      exportedAt: new Date().toISOString(),
    };

    return NextResponse.json(exportData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export client data' },
      { status: 500 }
    );
  }
}
