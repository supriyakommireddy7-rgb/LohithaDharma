const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'lohithadharma200@gmail.com',
      password: 'admin123'
    });
    console.log("Success! Token:", res.data.token);
  } catch (err) {
    console.error("Failed:", err.response ? err.response.data : err.message);
  }
}

testLogin();
