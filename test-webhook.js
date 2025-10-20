const https = require('https');

// Test the webhook URL
const url = 'https://ssn8nss.joaobr.site/webhook-test/a9ac359b-ae8a-4611-96b8-eb302ce6b0ca';

const data = JSON.stringify({
  message: 'test',
  conversationId: '123',
  settings: {}
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(url, options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();