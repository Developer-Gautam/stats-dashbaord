import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(req: NextRequest, { params }: any) {
  const { slice } = params;
  const dataDir = path.join(process.cwd(), 'src', 'json_data');
  const filePath = path.join(dataDir, `${slice}.json`);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Data slice not found' }, { status: 404 });
  }
}
