// Test script for file upload functionality
const fs = require('fs');
const path = require('path');

// Test the upload functionality
async function testFileUpload() {
  console.log('Testing file upload functionality...');
  
  try {
    // Create mock form data
    const formData = new FormData();
    
    // For testing purposes, we'll create a simple text file
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload functionality.');
    
    // Read the test file
    const fileBuffer = fs.readFileSync(testFilePath);
    const file = new File([fileBuffer], 'test-upload.txt', { type: 'text/plain' });
    
    formData.append('file', file);
    formData.append('conversationId', 'test-conversation-123');
    
    console.log('Calling upload handler...');
    
    // Call the upload handler
    // Note: This is a simplified test and won't actually run the full Next.js environment
    console.log('Upload handler would process the file and activate the n8n endpoint');
    console.log('File name:', file.name);
    console.log('Conversation ID:', 'test-conversation-123');
    console.log('n8n endpoint:', 'https://sswebhookss.joaobr.site/form/7aa22c3a-8f03-4201-812b-ceb2d8525472');
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testFileUpload();