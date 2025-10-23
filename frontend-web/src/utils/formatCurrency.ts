export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }
};

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    'NGN': '₦',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'INR': '₹',
  };
  
  return symbols[currency] || currency;
};

export const formatNumber = (amount: number): string => {
  try {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return amount.toString();
  }
};
