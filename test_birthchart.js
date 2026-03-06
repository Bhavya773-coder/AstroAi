const axios = require('axios');

async function testBirthChartAPI() {
  try {
    console.log('Testing Birth Chart API endpoints...');
    
    // Test 1: Check if backend is running
    console.log('\n1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:5001/api/profile/insight-status', {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.log('Health check failed (expected without auth):', err.response?.status || err.message);
    });
    
    if (healthResponse?.status === 200) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend health check failed');
    }
    
    // Test 2: Check if detailed birth chart endpoint exists
    console.log('\n2. Testing detailed birth chart endpoint...');
    try {
      const detailedResponse = await axios.post('http://localhost:5001/api/birth-chart/generate-detailed', {
        full_name: 'Test User',
        date_of_birth: '1990-01-01',
        time_of_birth: '12:00',
        place_of_birth: 'New York',
        gender: 'male'
      }, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      
      if (detailedResponse.status === 200) {
        console.log('✅ Detailed birth chart endpoint is accessible');
      } else {
        console.log('❌ Detailed birth chart endpoint returned:', detailedResponse.status);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('✅ Detailed birth chart endpoint exists (401 = needs authentication)');
      } else {
        console.log('❌ Detailed birth chart endpoint error:', err.response?.status || err.message);
      }
    }
    
    console.log('\n🎉 API endpoint testing complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Open http://localhost:3000/birth-chart in browser');
    console.log('2. Login with a test account');
    console.log('3. Complete onboarding if no birth chart data exists');
    console.log('4. Verify the Cosmic Wheel visualization appears');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testBirthChartAPI();
