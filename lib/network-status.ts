// Network status checker for Flow services
export async function checkFlowNetworkStatus() {
  const mainnetServices = [
    'https://rest-mainnet.onflow.org',
    'https://fcl-discovery.onflow.org/authn'
  ];
  
  const testnetServices = [
    'https://rest-testnet.onflow.org',
    'https://fcl-discovery.onflow.org/testnet/authn'
  ];
  
  const allServices = [...mainnetServices, ...testnetServices];

  const results = await Promise.allSettled(
    allServices.map(async (url) => {
      try {
        const response = await fetch(url, { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        return {
          url,
          status: response.status,
          ok: response.ok
        };
      } catch (error) {
        return {
          url,
          status: 'error',
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );

  const status = results.map((result, index) => ({
    service: allServices[index],
    result: result.status === 'fulfilled' ? result.value : { error: 'Failed to check' }
  }));

  console.log('Flow Network Status Check:', status);
  
  // Check mainnet vs testnet health
  const mainnetHealthy = mainnetServices.every(url => {
    const serviceStatus = status.find(s => s.service === url);
    return serviceStatus?.result.ok;
  });
  
  const testnetHealthy = testnetServices.every(url => {
    const serviceStatus = status.find(s => s.service === url);
    return serviceStatus?.result.ok;
  });
  
  const allHealthy = status.every(s => s.result.ok);
  
  let recommendations = [];
  if (!testnetHealthy && mainnetHealthy) {
    recommendations.push('✅ Mainnet is working well - using mainnet for production stability');
    recommendations.push('❌ Testnet services are down - this is common with Flow testnet');
  } else if (!mainnetHealthy && testnetHealthy) {
    recommendations.push('⚠️ Mainnet services are down - but staying on mainnet for production');
    recommendations.push('✅ Testnet is working - but mainnet is preferred for production');
  } else if (!allHealthy) {
    recommendations.push('❌ Both networks have issues - Flow services may be experiencing outages');
    recommendations.push('💡 Try using the fallback wallet connection method');
  } else {
    recommendations.push('✅ All services are healthy - using mainnet for production');
  }
  
  if (!allHealthy) {
    console.warn('⚠️ Some Flow services are not responding properly');
    console.warn('This may cause wallet connection issues');
    recommendations.forEach(rec => console.log(rec));
  }

  return {
    allHealthy,
    network: 'mainnet', // Always prefer mainnet for production
    services: status,
    recommendations
  };
}

// Check network status on page load
export function initializeNetworkCheck() {
  if (typeof window !== 'undefined') {
    checkFlowNetworkStatus();
  }
}



