import { NextResponse } from 'next/server';
import { dataService } from '@/lib/mockData';

export async function GET() {
  try {
    const accounts = dataService.getPogoAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch POGO accounts' },
      { status: 500 }
    );
  }
}
