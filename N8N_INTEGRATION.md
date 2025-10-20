# n8n Integration Setup
This document explains how to properly set up the n8n integration for file uploads in the chat application.

## File Upload Integration
When a user uploads a file through the chat interface, the system automatically activates the n8n "Upload your file" node using the form endpoint:

```
https://sswebhookss.joaobr.site/form/7aa22c3a-8f03-4201-812b-ceb2d8525472
```

1. User selects a file to upload through the chat interface
2. File is uploaded to the Next.js backend via `/api/chat/upload`
3. Backend automatically sends the file to the n8n form endpoint
4. n8n workflow processes the file as configured

The current n8n webhook uses the **production endpoint**, which means:

- The endpoint is always available
- No manual activation is required
- Files will be processed immediately upon upload

## Deployment

For production use, make sure to:

1. Deploy your n8n workflow (not just test mode)
2. Update the endpoint URL if needed
3. Configure proper authentication if required

## Supported File Types

The system supports uploading:
- PDF documents (.pdf)
- Word documents (.doc, .docx)

Other file types will be rejected by the upload endpoint.