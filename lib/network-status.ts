// Network status checker for Flow services
export async function checkFlowNetworkStatus() {
  const services = [
    'https://rest-testnet.onflow.org',
    'https://fcl-discovery.onflow.org/testnet/authn',
    'https://fcl-discovery.onflow.org/authn'
  ];

  const results = await Promise.allSettled(
    services.map(async (url) => {
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
    service: services[index],
    result: result.status === 'fulfilled' ? result.value : { error: 'Failed to check' }
  }));

  console.log('Flow Network Status Check:', status);
  
  const allHealthy = status.every(s => s.result.ok);
  
  if (!allHealthy) {
    console.warn('⚠️ Some Flow services are not responding properly');
    console.warn('This may cause wallet connection issues');
  }

  return {
    allHealthy,
    services: status
  };
}

// Check network status on page load
export function initializeNetworkCheck() {
  if (typeof window !== 'undefined') {
    checkFlowNetworkStatus();
  }
}


