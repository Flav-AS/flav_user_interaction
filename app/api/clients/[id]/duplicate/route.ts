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

    // Create ID mappings for account groups to preserve parent-child relationships
    const groupIdMap = new Map<string, string>();
    
    // First pass: generate new IDs for all groups
    originalClient.accountGroups.forEach(group => {
      const newId = `ag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      groupIdMap.set(group.id, newId);
    });

    // Second pass: duplicate groups with mapped parent IDs
    const duplicatedAccountGroups = originalClient.accountGroups.map(group => {
      const newGroup: any = {
        ...group,
        id: groupIdMap.get(group.id)!,
        accounts: group.accounts.map(account => ({
          ...account,
          id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      };

      // Map parentId to new ID if it exists
      if ((group as any).parentId) {
        const newParentId = groupIdMap.get((group as any).parentId);
        if (newParentId) {
          newGroup.parentId = newParentId;
        }
      }

      return newGroup;
    });

    // Duplicate hierarchy with new IDs
    const duplicatedHierarchy = originalClient.groupHierarchy.map(hierarchy => ({
      ...hierarchy,
      id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));

    // Create a new client with duplicated data
    const newClient = dataService.createClient(name.trim());
    
    // Update the new client with all the duplicated data
    const updatedClient = dataService.updateClient(newClient.id, {
      accountGroups: duplicatedAccountGroups,
      groupHierarchy: duplicatedHierarchy,
      authorizedEmails: [...originalClient.authorizedEmails],
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