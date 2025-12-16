/**
 * Production Service Health Check Script
 * Tests all production services on Render to verify they're running
 * 
 * Usage: node check-production-health.js
 * Note: Uses native fetch (Node.js 18+)
 */

const PRODUCTION_SERVICES = [
  { name: 'Auth Service', url: 'https://auth-service-uds0.onrender.com/health' },
  { name: 'Quiz Service', url: 'https://quiz-service-6jzt.onrender.com/health' },
  { name: 'Gamification Service', url: 'https://gamification-service-ax6n.onrender.com/health' },
  { name: 'Social Service', url: 'https://social-service-lwjy.onrender.com/health' },
  { name: 'Result Service', url: 'https://result-service-vwjh.onrender.com/health' },
  { name: 'Live Service', url: 'https://live-service-ga6w.onrender.com/health' },
  { name: 'Meeting Service', url: 'https://meeting-service-ogfj.onrender.com/health' },
  { name: 'Moderation Service', url: 'https://moderation-service-3e2e.onrender.com/health' },
  { name: 'API Gateway', url: 'https://api-gateway-kzo9.onrender.com/health' }
];

async function checkServiceHealth(service) {
  try {
    console.log(`\n🔍 Checking ${service.name}...`);
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(service.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CognitoLearningHub-HealthCheck/1.0'
      }
    });
    
    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      console.log(`✅ ${service.name}: HEALTHY`);
      console.log(`   Response Time: ${responseTime}ms`);
      console.log(`   Status: ${response.status}`);
      if (data.status || data.message) {
        console.log(`   Data:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
      }
      return { ...service, status: 'healthy', responseTime, data };
    } else {
      console.log(`⚠️  ${service.name}: Status ${response.status}`);
      console.log(`   Response Time: ${responseTime}ms`);
      return { ...service, status: 'degraded', responseTime, statusCode: response.status };
    }
  } catch (error) {
    console.log(`❌ ${service.name}: FAILED`);
    if (error.name === 'AbortError') {
      console.log(`   Error: Request timeout (service may be sleeping on Render)`);
      console.log(`   Tip: Visit the URL in browser to wake it up`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return { ...service, status: 'unhealthy', error: error.message };
  }
}

async function checkAllServices() {
  console.log('🚀 Starting Production Service Health Checks...');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Check services sequentially (Render has rate limits)
  for (const service of PRODUCTION_SERVICES) {
    const result = await checkServiceHealth(service);
    results.push(result);
    // Wait 1 second between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  const healthy = results.filter(r => r.status === 'healthy').length;
  const degraded = results.filter(r => r.status === 'degraded').length;
  const unhealthy = results.filter(r => r.status === 'unhealthy').length;
  
  console.log(`\n✅ Healthy:   ${healthy}/${PRODUCTION_SERVICES.length}`);
  console.log(`⚠️  Degraded:  ${degraded}/${PRODUCTION_SERVICES.length}`);
  console.log(`❌ Unhealthy: ${unhealthy}/${PRODUCTION_SERVICES.length}`);
  
  if (healthy === PRODUCTION_SERVICES.length) {
    console.log('\n🎉 All services are healthy!');
  } else if (unhealthy > 0) {
    console.log('\n⚠️  Some services are not responding. This may be normal if:');
    console.log('   - Services are sleeping (Render free tier)');
    console.log('   - First request after inactivity (takes ~30s to wake up)');
    console.log('   - Service is currently deploying');
    console.log('\n💡 Try visiting the URLs in your browser to wake them up.');
  }
  
  // Average response time for healthy services
  const healthyServices = results.filter(r => r.status === 'healthy');
  if (healthyServices.length > 0) {
    const avgResponseTime = healthyServices.reduce((sum, s) => sum + s.responseTime, 0) / healthyServices.length;
    console.log(`\n⏱️  Average Response Time: ${Math.round(avgResponseTime)}ms`);
  }
  
  return results;
}

// Run the health checks
checkAllServices()
  .then((results) => {
    console.log('\n✨ Health check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Health check failed:', error);
    process.exit(1);
  });
