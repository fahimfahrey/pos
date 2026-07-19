import { registerPrinter } from '../../printer-registry'
import { PdfPrinter } from './printer'

registerPrinter('pdf', () => new PdfPrinter())
