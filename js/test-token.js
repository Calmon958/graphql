/**
 * Test Token Validity
 */
function testToken() {
  const token = localStorage.getItem(APP_CONFIG.STORAGE.AUTH_TOKEN);
  
  if (!token) {
    console.error('No token found in localStorage');
    return;
  }
  
  console.log('Token from localStorage:', token);
  
  // Check if token has three parts separated by dots (JWT format)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('Token does not have valid JWT format (should have 3 parts)');
    return;
  }
  
  // Try to decode the parts
  try {
    const header = JSON.parse(atob(parts[0]));
    console.log('JWT Header:', header);
    
    const payload = JSON.parse(atob(parts[1]));
    console.log('JWT Payload:', payload);
    
    console.log('JWT Signature (base64url encoded):', parts[2]);
    
    // Check expiration
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      console.log('Token expires at:', expirationDate);
      console.log('Token is ' + (expirationDate > now ? 'valid' : 'expired'));
    }
    
    console.log('Token appears to be a valid JWT');
  } catch (e) {
    console.error('Error decoding JWT parts:', e);
    console.error('Token is not a valid JWT');
  }
}

// Run the test when the script loads
testToken();