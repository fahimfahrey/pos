# Hardware Support

This document describes supported hardware interfaces and capabilities for the POS system.

## Thermal Receipt Printers

### Supported Models

The ESC/POS printer adapter supports standard ESC/POS-compatible thermal printers:

- **Epson** TM-T20, TM-T88, TM-T100 and compatible models
- **Star Micronics** TSP1000, TSP700II and compatible models
- **Honeywell** RP4 and compatible models
- **Generic** 80mm thermal printers implementing ESC/POS command set (most common models)

### Connection Methods

#### WebUSB (Recommended)

**Supported Browsers:**
- Chrome 61+
- Edge 79+
- Opera 48+

**Not Supported:**
- Safari (iOS, macOS)
- Firefox (as of current versions)
- Mobile browsers (except Chrome on Android)

**Pairing Flow:**
1. User clicks "Connect Printer" button in settings (requires user gesture)
2. Browser's device picker opens
3. User selects the printer from the list
4. Browser stores permission (persists across sessions)
5. Printer becomes available for printing without re-prompting

**Troubleshooting:**
- If permission is revoked or device is unplugged, the button will re-prompt on next use
- Some printers require specific driver/firmware versions for WebUSB support
- Test with `chrome://device-log` for USB communication issues

#### WebSerial

**Supported Browsers:**
- Chrome 89+
- Edge 89+
- Opera 75+

**Not Supported:**
- Safari
- Firefox
- Mobile browsers (limited support)

**Connection:**
- Works over USB-to-Serial adapters (common for older printers)
- Also supports direct serial connections on devices that expose them (e.g., desktop Linux)

**Pairing Flow:**
- Same user gesture requirement as WebUSB
- Browser stores port permission across sessions
- Serial connection configured at 9600 baud, 8 data bits, 1 stop bit, no parity

## Fallback Behavior

If the preferred printer (ESC/POS via WebUSB or WebSerial) is unavailable or fails to print:

1. System automatically falls back to **Browser Print** (OS print dialog)
2. Browser Print opens the OS print dialog with thermal receipt CSS
3. User can select "Print to PDF" or any OS printer
4. If all printers fail, user sees an error message; **the sale is NOT blocked**

This ensures that checkout always completes even if hardware is unavailable.

## Print Outcome Guarantees

### WebUSB/WebSerial (Real Hardware)
- ✅ Printer receives byte stream (high confidence)
- ✅ Paper is cut at the end
- ✅ Receipt is physically printed (unless hardware error)
- ⚠️ No completion callback from thermal printer (fire-and-forget)

### Browser Print Dialog
- ✅ Dialog opens and is user-visible
- ⚠️ User may cancel the dialog (not an error, treated as user choice)
- ⚠️ Paper may not actually print if user cancels or selects "Don't Print"
- **Print job is considered "successful" once dialog opens**, not after user confirms

**Implication:** The system cannot guarantee that a receipt physically prints. This is a platform limitation. For critical use cases (PCI compliance, audit trails), consider a server-side receipt archival system alongside hardware printing.

## Print Modes

### Browser Print
- Always available on any modern browser
- Outputs 80mm thermal-formatted HTML
- User selects destination in print dialog (printer, PDF, etc.)
- Good for development and single-screen setup (POS runs on touchscreen with printer attached to OS)

### PDF Download
- Generates downloadable PDF from same receipt HTML
- User's browser print-to-PDF or third-party tool handles actual output
- Useful for emailed receipts or manual archival

### ESC/POS Direct
- Communicates directly with thermal printer hardware
- No user dialog or OS involvement
- Fastest and most reliable for hardware-attached scenarios
- Requires WebUSB or WebSerial support (Chromium-based only)

## Settings Integration

Current POS version does not include a "Connect Printer" settings UI. To add hardware printer support:

1. Create a settings page route (e.g., `/pos/settings/hardware`)
2. Detect available transport methods (WebUSB, WebSerial)
3. Add "Connect Printer" button(s) that call `requestDevice()` / `requestPort()`
4. Store selected printer ID in organization settings
5. Checkout screen reads preferred printer from settings and passes it to `printReceipt()`

Example:
```typescript
const preferredPrinterId = settings.hardwareSettings?.printerIds?.['register-1']
await printReceipt(document, { jobRunner, preferredPrinterId })
```

## Testing

### Browser-Print (No Hardware Required)
```bash
npm run test
# Tests for ReceiptView snapshot, DisplayCartView, etc.
```

### ESC/POS Encoder (No Hardware Required)
```bash
npm run test src/infrastructure/printing/adapters/escpos/escpos-encoder.test.ts
# Tests byte sequence generation
```

### Orchestrator Fallback Logic (No Hardware Required)
```bash
npm run test src/infrastructure/printing/receipt-print-orchestrator.test.ts
# Tests fallback chain and failure handling
```

### Real Hardware (Optional)
- Connect a thermal printer via USB with WebUSB support
- Open the receipt page in Chrome/Edge
- Test "Print" button to verify hardware communication

## Known Limitations

1. **ESC/POS image printing not implemented** — Organization logo appears as text in receipt, not embedded image
2. **Multi-language receipt text** — Receipts currently render in English only; no localization for international text/character sets
3. **Custom fonts** — Thermal printers only support built-in fonts; custom fonts in receipt template are ignored
4. **Print layout optimization** — Wrapping, pagination, and field truncation are basic; high-volume items may need manual column tuning
5. **Simultaneous prints** — No queue; if two receipts try to print to the same ESC/POS printer at once, behavior is undefined (likely fails/overlaps)

## Compliance & Audit

For financial/tax compliance (PCI DSS, GDPR, etc.):
- This system does not audit which receipts were actually printed
- It only confirms "print job was submitted" (not "paper came out")
- Critical deployments should implement server-side receipt archival and e-receipt delivery (email)
- Local storage of finalized sales is available in IndexedDB for dispute resolution

---

**Version:** 1.0  
**Last Updated:** 2024-01-01  
**Status:** Production (ESC/POS WebUSB/WebSerial not yet integrated with settings UI)
