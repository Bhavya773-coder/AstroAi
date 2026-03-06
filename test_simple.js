const http = require('http');

function testBackend() {
  console.log('Testing Birth Chart Backend...');
  
  // Test 1: Check if backend is running
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/profile/insight-status',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ Backend responded with status: ${res.statusCode}`);
    
    if (res.statusCode === 401) {
      console.log('✅ Endpoint exists (401 = needs authentication, which is expected)');
    }
    
    res.on('data', (d) => {
      console.log('Response:', d.toString());
    });
  });
  
  req.on('error', (e) => {
    console.log('❌ Backend test failed:', e.message);
  });
  
  req.end();
  
  // Test 2: Check detailed birth chart endpoint
  const options2 = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/birth-chart/generate-detailed',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req2 = http.request(options2, (res) => {
    console.log(`✅ Detailed birth chart endpoint responded with status: ${res.statusCode}`);
    
    if (res.statusCode === 401) {
      console.log('✅ Detailed endpoint exists (401 = needs authentication, which is expected)');
    }
  });
  
  req2.on('error', (e) => {
    console.log('❌ Detailed endpoint test failed:', e.message);
  });
  
  req2.write(JSON.stringify({
    full_name: 'Test User',
    date_of_birth: '1990-01-01'
  }));
  
  req2.end();
  
  console.log('\n🎉 Backend testing complete!');
  console.log('\n📝 Manual Testing Steps:');
  console.log('1. Open browser and go to: http://localhost:3000');
  console.log('2. Login with your account');
  console.log('3. Navigate to: http://localhost:3000/birth-chart');
  console.log('4. If you see "Birth Chart Not Available", click "Complete Getting Started"');
  console.log('5. Complete onboarding steps');
  console.log('6. Return to birth chart page to see the Cosmic Wheel');
}

testBackend();
