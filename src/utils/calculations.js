// Shared money helpers so the form, the preview templates and the history list
// always agree on how a total is built.

export const getCurrencySymbol = (code) => {
  switch (code) {
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    case "TRY": return "₺";
    case "DKK": return "kr.";
    default: return "$";
  }
};

export const formatMoney = (val, currency) => {
  const num = parseFloat(val) || 0;
  const symbol = getCurrencySymbol(currency);
  if (currency === "DKK") {
    return `${num.toFixed(2)} ${symbol}`;
  }
  return `${symbol}${num.toFixed(2)}`;
};

// Single source of truth for every derived amount on an invoice.
export const calculateTotals = (invoiceData) => {
  const items = invoiceData.items || [];

  const subtotal = items.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const discountVal = invoiceData.discountType === "percent"
    ? subtotal * ((parseFloat(invoiceData.discount) || 0) / 100)
    : (parseFloat(invoiceData.discount) || 0);

  const afterDiscount = subtotal - discountVal;

  const taxVal = afterDiscount * ((parseFloat(invoiceData.tax) || 0) / 100);
  const addTaxVal = afterDiscount * ((parseFloat(invoiceData.addTax) || 0) / 100);
  const shippingVal = parseFloat(invoiceData.shipping) || 0;
  const clearanceVal = parseFloat(invoiceData.clearanceFee) || 0;

  const total = afterDiscount + taxVal + addTaxVal + shippingVal + clearanceVal;
  const paidVal = invoiceData.isPaid ? total : (parseFloat(invoiceData.amountPaid) || 0);
  const balanceDue = invoiceData.isPaid ? 0 : total - paidVal;

  return {
    subtotal,
    discountVal,
    afterDiscount,
    taxVal,
    addTaxVal,
    shippingVal,
    clearanceVal,
    total,
    paidVal,
    balanceDue
  };
};

// DD.MM.YYYY
export const formatDateString = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
};

// M/D/YYYY — the US-style short date used by the shipping template
export const formatDateShort = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};
