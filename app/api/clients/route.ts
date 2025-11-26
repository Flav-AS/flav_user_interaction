import { NextResponse } from 'next/server';
import { dataService } from '@/lib/mockData';

export async function GET() {
  try {
    const clients = dataService.getAllClients();
    return NextResponse.json({ clients });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    const newClient = dataService.createClient(name);
    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
