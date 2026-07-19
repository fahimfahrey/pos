// Register all printer adapters
import './adapters/browser-print'
import './adapters/pdf'
import './adapters/escpos'

// Re-export registry functions
export { registerPrinter, resolvePrinter, getRegisteredPrinters } from './printer-registry'
export { PrinterNotRegisteredError, PrinterUnavailableError, PrinterTransportError } from './errors'
