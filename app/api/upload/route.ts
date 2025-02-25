import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToCloudflare } from "@/lib/cloudflareClient";
import { deleteFromCloudflare } from "@/lib/cloudflareClient";

// const WORKER_URL = 'https://r2-worker.s-c7b.workers.dev';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filePath = `${path}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const url = await uploadToCloudflare(filePath, file);
    
    return NextResponse.json({ url: url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { filePath } = await request.json() as { filePath: string };
    await deleteFromCloudflare(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
} 