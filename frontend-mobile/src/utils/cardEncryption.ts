
// Updated CardEncryption to use server-side encryption
export class CardEncryption {
  static async encryptCardData(cardData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  }): Promise<{ encryptedData: string; iv: string; tag: string }> {
    const response = await fetch('/api/v1/encrypt/card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(cardData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to encrypt card data');
    }
    
    return response.json();
  }

  static async decryptCardData(encryptedData: {
    encryptedData: string;
    iv: string;
    tag: string;
  }): Promise<{ cardNumber: string; expiryDate: string; cvv: string }> {
    const response = await fetch('/api/v1/decrypt/card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(encryptedData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to decrypt card data');
    }
    
    return response.json();
  }

  static async hashPIN(pin: string, userId: string): Promise<string> {
    const response = await fetch('/api/v1/encrypt/pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ pin, userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to hash PIN');
    }
    
    const result = await response.json();
    return result.hashedPIN;
  }

  static async verifyPIN(pin: string, userId: string, hashedPIN: string): Promise<boolean> {
    const response = await fetch('/api/v1/encrypt/verify-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ pin, userId, hashedPIN })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.valid;
  }
}
