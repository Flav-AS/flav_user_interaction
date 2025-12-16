import { NextRequest, NextResponse } from 'next/server';
import { accountsDataService } from '@/lib/accountsData';

export async function GET() {
  try {
    const accounts = accountsDataService.getAllAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, groupIds } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      );
    }

    if (typeof code !== 'number') {
      return NextResponse.json(
        { error: 'Code must be a number' },
        { status: 400 }
      );
    }

    const account = accountsDataService.createAccount(code, name, groupIds || []);
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create account';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, code, name, groupIds } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (code !== undefined) updates.code = code;
    if (name !== undefined) updates.name = name;
    if (groupIds !== undefined) updates.groupIds = groupIds;

    const account = accountsDataService.updateAccount(id, updates);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update account';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const success = accountsDataService.deleteAccount(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
