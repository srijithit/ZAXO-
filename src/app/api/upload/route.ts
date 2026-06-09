import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let fileToUpload: Blob | File | null = null;
    let filename = 'file';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (file && typeof file !== 'string') {
        fileToUpload = file as unknown as File;
        filename = (file as any).name || 'file';
      }
    } else {
      // Fallback to reading raw body
      const { searchParams } = new URL(request.url);
      filename = searchParams.get('filename') || 'file';
      const body = await request.blob();
      if (body.size > 0) {
        fileToUpload = body;
      }
    }

    if (!fileToUpload) {
      return NextResponse.json({ error: 'No file provided in the request' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(filename, fileToUpload, {
      access: 'public',
    });

    return NextResponse.json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      contentType: blob.contentType,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
