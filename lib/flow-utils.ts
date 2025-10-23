// Utility functions for Flow integration

export function getUserAddress(user: any): string | undefined {
  // Extract address from Flow user object
  // Flow user objects can have different structures depending on the wallet
  return user?.addr || user?.address || user?.addresses?.[0];
}

export function isUserConnected(user: any): boolean {
  return !!user && !!getUserAddress(user);
}

