// EAN-13 checksum calculation
export function calculateEan13Checksum(digits12: string): string {
  if (digits12.length !== 12 || !/^\d+$/.test(digits12)) {
    throw new Error('EAN-13 input must be exactly 12 digits')
  }

  let sum = 0
  for (let i = 0; i < 12; i++) {
    const weight = i % 2 === 0 ? 1 : 3
    sum += parseInt(digits12[i]) * weight
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit.toString()
}

export function encodeEan13(barcode: string): string {
  if (!/^\d{12}$/.test(barcode)) {
    throw new Error('EAN-13 barcode must be 12 digits')
  }
  return barcode + calculateEan13Checksum(barcode)
}

export function validateEan13Checksum(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false
  const digits12 = barcode.substring(0, 12)
  const checkDigit = barcode[12]
  return calculateEan13Checksum(digits12) === checkDigit
}

// Code-128 encoding (simplified implementation for alphanumeric)
const CODE128_CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
const CODE128_PATTERNS: Record<number, string> = {
  0: '11011001100',
  1: '11001101100',
  2: '11001100110',
  3: '10010011000',
  4: '10010001100',
  5: '10001001100',
  6: '10011001000',
  7: '10011000100',
  8: '10001100100',
  9: '11010011000',
  10: '11010001100',
  11: '11000100100',
  12: '10110011000',
  13: '10011011000',
  14: '10011001010',
  15: '10110001000',
  16: '10001011000',
  17: '10010110000',
  18: '10010110100',
  19: '10010010110',
  20: '10110100100',
  21: '10110010100',
  22: '10110010010',
  23: '10011010100',
  24: '10011010010',
  25: '10011000010',
  26: '10110101000',
  27: '10110100010',
  28: '10110010001',
  29: '10101011000',
  30: '10100110100',
  31: '10100110010',
  32: '10100010110',
  33: '10010101000',
  34: '10010100110',
  35: '10010010101',
  36: '11001001000',
  37: '11001000100',
  38: '11000100010',
  39: '10011001000',
  40: '10011000100',
  41: '10011000010',
  42: '10110100100',
  43: '10011010100',
  44: '10011010010',
  45: '10110010100',
  46: '10110010010',
  47: '10110001001',
  48: '10101001100',
  49: '10100011100',
  50: '10001011100',
  51: '10010111000',
  52: '10001110010',
  53: '10001110100',
  54: '10110111000',
  55: '10110001110',
  56: '10001101110',
  57: '10111011000',
  58: '10111000110',
  59: '10001110110',
  60: '11101101110',
  61: '11010001110',
  62: '11000110111',
  63: '10111010000',
  64: '10001101000',
  65: '10001100010',
  66: '11010110000',
  67: '11010001100',
  68: '11000101100',
  69: '11000100110',
  70: '10110100010',
  71: '10011100010',
  72: '10011101000',
  73: '10011100100',
  74: '11000110010',
  75: '11000101010',
  76: '11010100110',
  77: '11010010110',
  78: '11000101110',
  79: '10101111000',
  80: '10100111100',
  81: '10010111100',
  82: '10010110110',
  83: '10111100100',
  84: '10111010010',
  85: '10111001001',
  86: '10110010011',
  87: '10011010011',
  88: '10011001011',
  89: '10011010001',
  90: '11101000110',
  91: '11010001110',
  92: '11000110111',
  93: '10001101110',
  94: '10111010000',
  95: '10001101000',
  96: '10001100010',
  97: '11010110000',
  98: '11010001100',
  99: '11000101100',
  100: '11000100110',
  101: '10110100010',
  102: '10011100010',
  103: '10011101000',
  104: '10011100100',
  105: '11000110010',
}

export function encodeCode128(text: string): { bars: number[]; text: string } {
  if (!/^[\x20-\x7E]*$/.test(text)) {
    throw new Error('Code-128 only supports printable ASCII characters')
  }

  const bars: number[] = []

  // Start code B
  bars.push(parseInt(CODE128_PATTERNS[104], 2))

  let checksum = 104
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const code = char.charCodeAt(0)
    const charCode = code >= 32 ? code - 32 : 0

    bars.push(parseInt(CODE128_PATTERNS[charCode], 2))
    checksum += charCode * (i + 1)
  }

  // Checksum
  const checksumCode = checksum % 103
  bars.push(parseInt(CODE128_PATTERNS[checksumCode], 2))

  // Stop code
  bars.push(parseInt('1100011101011', 2))

  return { bars, text }
}
