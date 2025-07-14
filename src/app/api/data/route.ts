// Helper for listing all available slices
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(req: NextRequest) {
  const dataDir = path.join(process.cwd(), 'src', 'json_data');
  try {
    const files = await fs.readdir(dataDir);
    const slices = files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    return NextResponse.json({ slices });
  } catch (e) {
    return NextResponse.json({ error: 'Could not list slices' }, { status: 500 });
  }
}
