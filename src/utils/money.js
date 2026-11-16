


export function formatMoney(amount, currency = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount || 0))
}

export function calculateTotals(items, settings) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0)
  const feePerService = Math.max(0, Number(settings.serviceFee) || 0)
  const taxRate = Math.min(100, Math.max(0, Number(settings.serviceTaxPercent) || 0)) / 100
  const commissionRate = Math.min(100, Math.max(0, Number(settings.commissionPercent) || 0)) / 100
  const serviceFee = feePerService * items.length
  const serviceTax = items.reduce((sum, item) => sum + Number((Number(item.price || 0) * taxRate).toFixed(2)), 0)
  const commission = items.reduce((sum, item) => sum + Number((Number(item.price || 0) * commissionRate).toFixed(2)), 0)
  const total = items.reduce((sum, item) => sum + Number((Number(item.price || 0) + feePerService + Number((Number(item.price || 0) * taxRate).toFixed(2))).toFixed(2)), 0)
  return { subtotal, serviceFee, serviceTax, commission, total }
}