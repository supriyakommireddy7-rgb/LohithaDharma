const http = require('http');

const PORT = 5001;

console.log('==================================================');
console.log('  LOHITHA DHARMA REAL ESTATE - API INTEGRATION TEST  ');
console.log('==================================================\n');

const request = (method, path, data) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(postData);
    }
    req.end();
  });
};

const runTests = async () => {
  try {
    // 1. Health & Config status check
    console.log('1. Checking system configuration status...');
    const health = await request('GET', '/api/config-status');
    console.log(`Status: ${health.statusCode}`);
    console.log('Configured Services:', JSON.stringify(health.data.data, null, 2));
    console.log('--------------------------------------------------\n');

    // 2. Simulate Inbound English Email
    console.log('2. Simulating incoming ENGLISH inquiry...');
    const enInquiry = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '+1 555-0199',
      subject: 'Inquiry about villas near Gachibowli',
      message: 'Hello Lohitha Dharma team, I am John Doe. I am looking for a 3 BHK luxury villa near Gachibowli. My budget is around 2.5 Crores. I prefer to be contacted in the evening. Thank you.'
    };
    const enRes = await request('POST', '/api/receive-email', enInquiry);
    console.log(`Status: ${enRes.statusCode}`);
    if (enRes.statusCode === 201) {
      console.log(`Detected Language: ${enRes.data.data.language}`);
      console.log(`Extracted Phone: ${enRes.data.data.phone}`);
      console.log(`Extracted Budget: ${enRes.data.data.budget}`);
      console.log(`AI Response Sample:\n${enRes.data.data.aiReply.substring(0, 150)}...\n`);
    } else {
      console.log('Error:', enRes.data);
    }
    console.log('--------------------------------------------------\n');

    // 3. Simulate Inbound Telugu Email
    console.log('3. Simulating incoming TELUGU inquiry...');
    const teInquiry = {
      name: 'రామారావు',
      email: 'ramarao@example.com',
      phone: '9848022338',
      subject: 'నివాస ప్లాట్లు కావాలి',
      message: 'నమస్కారం, నా పేరు రామారావు. విజయవాడ హైవే సమీపంలో నివాస ప్లాట్లు (residential plots) ఏమైనా అందుబాటులో ఉన్నాయా? నా బడ్జెట్ 35 లక్షలు. దయచేసి వివరాలు పంపగలరు.'
    };
    const teRes = await request('POST', '/api/receive-email', teInquiry);
    console.log(`Status: ${teRes.statusCode}`);
    if (teRes.statusCode === 201) {
      console.log(`Detected Language: ${teRes.data.data.language}`);
      console.log(`Extracted Location: ${teRes.data.data.location}`);
      console.log(`AI Response Sample:\n${teRes.data.data.aiReply.substring(0, 150)}...\n`);
    } else {
      console.log('Error:', teRes.data);
    }
    console.log('--------------------------------------------------\n');

    // 4. Simulate Inbound Hindi Email
    console.log('4. Simulating incoming HINDI inquiry...');
    const hiInquiry = {
      name: 'अमित शर्मा',
      email: 'amit.sharma@example.com',
      phone: '9876543210',
      subject: 'अपार्टमेंट के बारे में जानकारी',
      message: 'नमस्ते लोहिता धर्मा टीम, मुझे शमशाबाद के पास 2 BHK अपार्टमेंट की तलाश है। मेरा बजट लगभग 60 लाख रुपये है। क्या आपके पास कोई अच्छे विकल्प हैं?'
    };
    const hiRes = await request('POST', '/api/receive-email', hiInquiry);
    console.log(`Status: ${hiRes.statusCode}`);
    if (hiRes.statusCode === 201) {
      console.log(`Detected Language: ${hiRes.data.data.language}`);
      console.log(`Extracted Property: ${hiRes.data.data.propertyType}`);
      console.log(`AI Response Sample:\n${hiRes.data.data.aiReply.substring(0, 150)}...\n`);
    } else {
      console.log('Error:', hiRes.data);
    }
    console.log('--------------------------------------------------\n');

    // 5. Query all emails log
    console.log('5. Querying database emails log...');
    const logList = await request('GET', '/api/emails');
    console.log(`Status: ${logList.statusCode}`);
    console.log(`Total Emails saved in Database: ${logList.data.count}`);
    
    let sampleLeadId = '';
    if (logList.data.count > 0) {
      sampleLeadId = logList.data.data[0]._id;
      console.log(`Recent Lead Name: ${logList.data.data[0].name} (${logList.data.data[0].email})`);
    }
    console.log('--------------------------------------------------\n');

    // 6. Update lead status of recent record
    if (sampleLeadId) {
      console.log(`6. Updating status of Lead ID: ${sampleLeadId} to 'Follow-up'...`);
      const updateRes = await request('PUT', `/api/email/${sampleLeadId}/status`, { status: 'Follow-up' });
      console.log(`Status: ${updateRes.statusCode}`);
      console.log(`Updated Status in DB: ${updateRes.data.data.leadStatus}`);
    } else {
      console.log('6. Skipped update status test (no leads found)');
    }
    console.log('--------------------------------------------------\n');

    console.log('🎉 INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('\n❌ TEST RUN ENCOUNTERED AN ERROR:');
    if (error.code === 'ECONNREFUSED') {
      console.error(`Could not connect to Express server at port ${PORT}. Make sure to start the server first using: npm start`);
    } else {
      console.error(error);
    }
  }
};

runTests();
