const OK = 'OK';
const FAIL = 'FAIL';
const ACTIVE = 'ACTIVE';
const INACTIVE = 'INACTIVE';
const STATUSES = [ACTIVE, INACTIVE, 'DISABLED'];
const EUR = 'EUR';
const CURRENCIES = [
  'AUD',
  'CAD',
  'CHF',
  'COP',
  'DKK',
  'EGP',
  EUR,
  'GBP',
  'HUF',
  'IDR',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'QAR',
  'SEK',
  'SGD',
  'THB',
  'USD',
  'ZAR',
];
const OPERATOR = 'OPERATOR';
const PAY_METHODS = ['CARD', OPERATOR];
const STARTED = 'STARTED';

module.exports = {
  ACTIVE: ACTIVE,
  CURRENCIES: CURRENCIES,
  EUR: EUR,
  FAIL: FAIL,
  INACTIVE: INACTIVE,
  OK: OK,
  OPERATOR: OPERATOR,
  PAY_METHODS: PAY_METHODS,
  STARTED: STARTED,
  STATUSES: STATUSES,
};
