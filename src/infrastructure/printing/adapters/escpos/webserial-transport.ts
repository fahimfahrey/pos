import { PrinterTransportError } from '../../errors'

export class WebSerialTransport {
  private port: SerialPort | null = null
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null

  async isAvailable(): Promise<boolean> {
    return typeof navigator !== 'undefined' && !!navigator.serial
  }

  async requestPort(): Promise<void> {
    if (!navigator.serial) {
      throw new PrinterTransportError('WebSerial not supported in this browser')
    }

    try {
      this.port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x04b8 }, // Epson
          { usbVendorId: 0x0519 }, // Star Micronics
          { usbVendorId: 0x0456 }, // Honeywell
        ],
      })

      if (!this.port.readable || !this.port.writable) {
        throw new PrinterTransportError('Serial port does not support read/write')
      }

      // Open connection with standard thermal printer settings
      await this.port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      })

      this.writer = this.port.writable.getWriter()
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        throw new PrinterTransportError('No serial port selected')
      }
      throw new PrinterTransportError(`Failed to connect to serial printer: ${error}`)
    }
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.writer) {
      throw new PrinterTransportError('Port not connected. Call requestPort() first.')
    }

    try {
      await this.writer.write(data)
    } catch (error) {
      throw new PrinterTransportError(`Failed to write to printer: ${error}`)
    }
  }

  async close(): Promise<void> {
    if (this.writer) {
      try {
        await this.writer.close()
      } catch (error) {
        console.warn('Failed to close writer:', error)
      }
      this.writer = null
    }

    if (this.port) {
      try {
        await this.port.close()
      } catch (error) {
        console.warn('Failed to close serial port:', error)
      }
      this.port = null
    }
  }
}
