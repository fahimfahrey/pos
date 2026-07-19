import { registerPrinter } from '../../printer-registry'
import { EscPosPrinter } from './printer'

registerPrinter('escpos', () => new EscPosPrinter())
