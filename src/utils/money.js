'use strict';

// Indian-numbering currency formatting. Manual grouping so we don't depend on
// Node's ICU locale data being present in the deploy image.
// ponytail: hand-rolled grouping; swap for Intl.NumberFormat('en-IN') if full-ICU
// is guaranteed in the runtime.

/**
 * Format a rupee amount with Indian digit grouping and a ₹ prefix.
 * 1000 -> ₹1,000 ; 125000 -> ₹1,25,000 ; 1050000 -> ₹10,50,000
 * @param {number} amount rupees (may have paise decimals)
 */
function formatINR(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new TypeError('formatINR expects a finite number');
  }
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const rupees = Math.trunc(abs);
  const paise = Math.round((abs - rupees) * 100);

  const digits = String(rupees);
  let grouped;
  if (digits.length <= 3) {
    grouped = digits;
  } else {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }

  const decimals = paise > 0 ? '.' + String(paise).padStart(2, '0') : '';
  return (negative ? '-₹' : '₹') + grouped + decimals;
}

/**
 * Build the standard money response object from integer paise.
 * @param {number} paise integer minor units
 */
function toMoney(paise) {
  const amount = (paise || 0) / 100;
  return { amount, currency: 'INR', formattedAmount: formatINR(amount) };
}

module.exports = { formatINR, toMoney };

// Self-check: `node src/utils/money.js`
if (require.main === module) {
  const assert = require('assert');
  assert.strictEqual(formatINR(1000), '₹1,000');
  assert.strictEqual(formatINR(10000), '₹10,000');
  assert.strictEqual(formatINR(125000), '₹1,25,000');
  assert.strictEqual(formatINR(1050000), '₹10,50,000');
  assert.strictEqual(formatINR(250), '₹250');
  assert.strictEqual(formatINR(0), '₹0');
  assert.strictEqual(formatINR(1234.5), '₹1,234.50');
  assert.deepStrictEqual(toMoney(2500000), {
    amount: 25000,
    currency: 'INR',
    formattedAmount: '₹25,000',
  });
  console.log('money.js self-check passed');
}
