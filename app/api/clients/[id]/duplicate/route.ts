// app/api/clients/[id]/duplicate/route.ts

import { NextResponse } from 'next/server';
import { dataService } from '@/lib/mockData';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    // Get the original client
    const originalClient = dataService.getClientById(id);
    
    if (!originalClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create a new client with duplicated data
    const duplicatedClient = {
      id: `client-${Date.now()}`,
      name: name.trim(),
      accountGroups: originalClient.accountGroups.map(group => ({
        ...group,
        id: `ag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        accounts: group.accounts.map(account => ({
          ...account,
          id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      })),
      groupHierarchy: originalClient.groupHierarchy.map(hierarchy => ({
        ...hierarchy,
        id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
      authorizedEmails: [...originalClient.authorizedEmails],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add the duplicated client to the data service
    // This assumes you have a method to add a client directly
    // If not, we'll need to update the dataService
    const newClient = dataService.createClient(duplicatedClient.name);
    
    // Update the new client with all the duplicated data
    const updatedClient = dataService.updateClient(newClient.id, {
      accountGroups: duplicatedClient.accountGroups,
      groupHierarchy: duplicatedClient.groupHierarchy,
      authorizedEmails: duplicatedClient.authorizedEmails,
    });

    return NextResponse.json({ client: updatedClient }, { status: 201 });
  } catch (error) {
    console.error('Duplicate error:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate client' },
      { status: 500 }
    );
  }
}