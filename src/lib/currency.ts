// Sri Lankan Rupee currency formatting

export const CURRENCY_SYMBOL = 'Rs.';
export const CURRENCY_CODE = 'LKR';

export const formatPrice = (amount: number): string => {
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPriceShort = (amount: number): string => {
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString('en-LK')}`;
};
