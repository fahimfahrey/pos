export class PrinterNotRegisteredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PrinterNotRegisteredError'
  }
}

export class PrinterUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PrinterUnavailableError'
  }
}

export class PrinterTransportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PrinterTransportError'
  }
}
