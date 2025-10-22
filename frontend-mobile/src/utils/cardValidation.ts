// Card validation utilities
export const validateCardNumber = (cardNumber: string): boolean => {
  // Check if input contains non-digits or spaces (should fail)
  if (/\D/.test(cardNumber) || /\s/.test(cardNumber)) {
    return false;
  }
  
  // Remove spaces and non-digits for processing
  const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');
  
  // Check if it's empty or too short
  if (!cleaned || cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;

  // Process digits from right to left
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  // Check format MM/YY
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiryDate)) {
    return false;
  }

  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;

  const expMonth = parseInt(month);
  const expYear = parseInt(year);

  // Check if expiry date is in the future (allow current month)
  if (expYear < currentYear) {
    return false;
  }

  if (expYear === currentYear && expMonth < currentMonth) {
    return false;
  }

  return true;
};

export const validateCVV = (cvv: string, cardType?: string | null): boolean => {
  // Check if input contains non-digits (should fail)
  if (/\D/.test(cvv)) {
    return false;
  }
  
  // Remove non-digits for processing
  const cleaned = cvv.replace(/\D/g, '');
  
  // American Express uses 4-digit CVV, others use 3-digit
  if (cardType === 'amex') {
    return cleaned.length === 4;
  } else {
    return cleaned.length === 3;
  }
};

export const detectCardType = (cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' | null => {
  const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');
  
  if (cleaned.startsWith('4')) {
    return 'visa';
  } else if (cleaned.startsWith('5') || cleaned.startsWith('2')) {
    return 'mastercard';
  } else if (cleaned.startsWith('3')) {
    return 'amex';
  } else if (cleaned.startsWith('6')) {
    return 'discover';
  }
  
  return null;
};

export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');
  if (cleaned.length < 8) return cardNumber;
  
  const firstFour = cleaned.substring(0, 4);
  const lastFour = cleaned.substring(cleaned.length - 4);
  const middleLength = Math.max(4, cleaned.length - 8); // At least 4 asterisks
  const middle = '*'.repeat(middleLength);
  
  return `${firstFour} ${middle} ${lastFour}`;
};

export const formatCardNumberForDisplay = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '').replace(/\D/g, '');
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

export const getCardIcon = (cardType: string): string => {
  switch (cardType) {
    case 'visa':
      return 'card';
    case 'mastercard':
      return 'card';
    case 'amex':
      return 'card';
    case 'discover':
      return 'card';
    default:
      return 'card-outline';
  }
};

export const getCardGradient = (cardType: string): string[] => {
  switch (cardType) {
    case 'visa':
      return ['#1A1F71', '#2A3F81'];
    case 'mastercard':
      return ['#EB001B', '#FF1A2B'];
    case 'amex':
      return ['#006FCF', '#0070F0'];
    case 'discover':
      return ['#FF6000', '#FF7000'];
    default:
      return ['#6B7280', '#9CA3AF'];
  }
};
