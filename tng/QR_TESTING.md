# QR Scanner Testing

## How to Test the QR Scanner

1. Click the "Scan & PayLater" button on the home screen
2. Allow camera permissions when prompted
3. Point your camera at a QR code
4. The scanner will automatically detect and process the QR code
5. Enter the payment amount
6. Click "Pay Now" to proceed to payment approval

## Test QR Code Data

You can create QR codes with the following data formats:

### Format 1: Simple Text
```
Jaya Grocer
Amount: RM 25.00
```

### Format 2: JSON
```json
{
  "merchant": "Jaya Grocer",
  "amount": 25.00,
  "reference": "TXN123456"
}
```

### Format 3: Merchant Info
```json
{
  "merchant": "Petronas Station",
  "store": "Petronas Taman Maluri",
  "amount": 50.00
}
```

## Online QR Code Generators

You can use these websites to generate test QR codes:
- https://www.qr-code-generator.com/
- https://qr-code-generator.org/
- https://www.qrcode-monkey.com/

## Troubleshooting

- **Camera not working**: Make sure to allow camera permissions
- **QR not detected**: Ensure good lighting and position QR code within the frame
- **Multiple screens**: The app should now show only one screen at a time
- **Payment not proceeding**: Make sure to enter a valid amount greater than 0