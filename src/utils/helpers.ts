
export const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
