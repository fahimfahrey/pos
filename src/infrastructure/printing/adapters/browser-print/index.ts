import { registerPrinter } from '../../printer-registry'
import { BrowserPrintPrinter } from './printer'

registerPrinter('browser-print', () => new BrowserPrintPrinter())
