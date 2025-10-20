import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { stat } from 'fs/promises';

export const runtime = 'nodejs';

// Ensure uploads directory exists
async function ensureUploadsDirectory() {
  const uploadsDir = join(process.cwd(), 'uploads');
  try {
    await stat(uploadsDir);
  } catch {
    // Directory doesn't exist, create it
    await mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export async function POST(req: NextRequest) {
  try {
    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDirectory();
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const conversationId = formData.get('conversationId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'No conversation ID provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and Word documents are allowed.' },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${conversationId}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, uniqueFileName);
    
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save file to disk
    await writeFile(filePath, buffer);
    
    // Generate file URL (in a real app, you might want to use a cloud storage service)
    const fileUrl = `/uploads/${uniqueFileName}`;
    
    // Activate n8n "Upload your file" node
    try {
      // Create a new FormData for the n8n request
      const n8nFormData = new FormData();
      n8nFormData.append('file', new Blob([buffer], { type: file.type }), file.name);
      n8nFormData.append('conversationId', conversationId);
      n8nFormData.append('fileName', file.name);
      n8nFormData.append('fileType', file.type);
      
      // Send request to n8n form endpoint (updated to production URL)
      const n8nResponse = await fetch('https://sswebhookss.joaobr.site/form/82848bc4-5ea2-4e5a-8bb6-3c09b94a8c5d', {
        method: 'POST',
        body: n8nFormData,
      });
      
      if (!n8nResponse.ok) {
        console.error('Failed to activate n8n upload node:', n8nResponse.status, await n8nResponse.text());
      }
    } catch (n8nError) {
      console.error('Error activating n8n upload node:', n8nError);
      // We don't return an error here because the file upload itself was successful
    }
    
    return NextResponse.json({
      message: 'File uploaded successfully',
      fileUrl,
      fileName: file.name,
      fileType: file.type
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}