// Test QR Code Data for Payment
// You can use this data to test the QR scanner
// Copy any of these strings and create a QR code from it

const testQRData = [
  // Simple merchant data
  "Jaya Grocer\nAmount: RM 25.00",

  // JSON format
  JSON.stringify({
    merchant: "Jaya Grocer",
    amount: 25.00,
    reference: "TXN123456"
  }),

  // Another merchant
  JSON.stringify({
    merchant: "Petronas Station",
    store: "Petronas Taman Maluri",
    amount: 50.00
  }),

  // Simple text
  "Merchant: 7-Eleven\nLocation: KL Sentral\nAmount: RM 15.50"
];

export default testQRData;