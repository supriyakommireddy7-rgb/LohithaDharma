const http = require('http');

const emails = [
  {
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    subject: "Looking for a Villa",
    message: "Hi, I am looking for a 3 BHK luxury villa. Please provide details."
  },
  {
    name: "Raju",
    email: "raju@example.com",
    phone: "9123456780",
    subject: "Plot kavali",
    message: "నమస్కారం, నాకు ఒక ప్లాట్ కావాలి. దయచేసి వివరాలు పంపండి."
  },
  {
    name: "Ramesh",
    email: "ramesh@example.com",
    phone: "9988776655",
    subject: "Ghar chahiye",
    message: "नमस्ते, मुझे एक अपार्टमेंट चाहिए। कृपया जानकारी दें।"
  }
];

function sendRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/receive-email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("=== Running Multi-Language Email Tests ===\n");
  
  for (const email of emails) {
    console.log(`Sending email from: ${email.name} (${email.subject})`);
    try {
      const response = await sendRequest(email);
      console.log(`[Result] Success: ${response.success}`);
      console.log(`[Result] Detected Language: ${response.data.language}`);
      console.log(`[Result] Delivery Status: ${response.deliveryStatus}`);
      console.log(`[Result] AI Reply Snippet: ${response.data.aiReply.substring(0, 100)}...\n`);
    } catch (err) {
      console.error("Failed to send request:", err);
    }
  }
}

runTests();
