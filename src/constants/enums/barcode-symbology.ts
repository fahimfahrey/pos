export const BARCODE_SYMBOLOGY = {
  EAN13: 'ean13',
  UPC_A: 'upc_a',
  CODE128: 'code128',
  QR: 'qr',
} as const

export type BarcodeSymbology = (typeof BARCODE_SYMBOLOGY)[keyof typeof BARCODE_SYMBOLOGY]
