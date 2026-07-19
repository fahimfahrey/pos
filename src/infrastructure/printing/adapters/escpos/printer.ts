import type { Printer, PrintJobPayload } from '@shared/ports/printer'
import type { ReceiptDocument } from '@domains/receipts/entities/receipt-document'
import { encodeReceipt } from './escpos-encoder'
import { WebUsbTransport } from './webusb-transport'
import { WebSerialTransport } from './webserial-transport'
import { PrinterTransportError, PrinterUnavailableError } from '../../errors'

export class EscPosPrinter implements Printer {
  readonly id = 'escpos'

  private usbTransport: WebUsbTransport | null = null
  private serialTransport: WebSerialTransport | null = null

  async isAvailable(): Promise<boolean> {
    return await this.hasWebUsbSupport() || await this.hasWebSerialSupport()
  }

  async print(payload: PrintJobPayload): Promise<{ jobId: string }> {
    const document = payload.document as ReceiptDocument

    const jobId = `escpos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Encode receipt to ESC/POS bytes
    const bytes = encodeReceipt(document)

    // Try USB first, then fall back to Serial
    try {
      if (await this.hasWebUsbSupport()) {
        await this.printViaUsb(bytes)
        return { jobId }
      }
    } catch (error) {
      console.warn('USB print failed, trying serial:', error)
    }

    try {
      if (await this.hasWebSerialSupport()) {
        await this.printViaSerial(bytes)
        return { jobId }
      }
    } catch (error) {
      console.warn('Serial print failed:', error)
    }

    throw new PrinterUnavailableError('No ESC/POS transport available (WebUSB or WebSerial)')
  }

  private async hasWebUsbSupport(): Promise<boolean> {
    if (!this.usbTransport) {
      this.usbTransport = new WebUsbTransport()
    }
    return this.usbTransport.isAvailable()
  }

  private async hasWebSerialSupport(): Promise<boolean> {
    if (!this.serialTransport) {
      this.serialTransport = new WebSerialTransport()
    }
    return this.serialTransport.isAvailable()
  }

  private async printViaUsb(bytes: Uint8Array): Promise<void> {
    if (!this.usbTransport) {
      this.usbTransport = new WebUsbTransport()
    }

    try {
      if (!this.usbTransport.device) {
        await this.usbTransport.requestDevice()
      }
      await this.usbTransport.write(bytes)
    } finally {
      // Keep device open for next print
    }
  }

  private async printViaSerial(bytes: Uint8Array): Promise<void> {
    if (!this.serialTransport) {
      this.serialTransport = new WebSerialTransport()
    }

    try {
      if (!this.serialTransport.port) {
        await this.serialTransport.requestPort()
      }
      await this.serialTransport.write(bytes)
    } finally {
      // Keep port open for next print
    }
  }
}

// Type definitions for WebUSB and WebSerial (if not available in environment)
declare global {
  interface Navigator {
    usb?: {
      requestDevice(options?: { filters: Array<{ vendorId?: number; productId?: number }> }): Promise<USBDevice>
      getDevices(): Promise<USBDevice[]>
    }
    serial?: {
      requestPort(options?: { filters: Array<{ usbVendorId?: number; usbProductId?: number }> }): Promise<SerialPort>
      getPorts(): Promise<SerialPort[]>
    }
  }

  interface USBDevice {
    opened: boolean
    configuration: USBConfiguration | null
    open(): Promise<void>
    close(): Promise<void>
    transferOut(endpointNumber: number, data: Uint8Array): Promise<USBOutTransferResult>
  }

  interface USBConfiguration {
    interfaces: USBInterface[]
  }

  interface USBInterface {
    alternates: USBAlternateInterface[]
  }

  interface USBAlternateInterface {
    endpoints: USBEndpoint[]
  }

  interface USBEndpoint {
    endpointNumber: number
    type: 'bulk' | 'interrupt' | 'isochronous'
    direction: 'in' | 'out'
  }

  interface USBOutTransferResult {
    bytesWritten: number
  }

  interface SerialPort {
    readable: ReadableStream<Uint8Array> | null
    writable: WritableStream<Uint8Array> | null
    open(options: SerialOptions): Promise<void>
    close(): Promise<void>
  }

  interface SerialOptions {
    baudRate: number
    dataBits?: number
    stopBits?: number
    parity?: 'none' | 'even' | 'odd'
    flowControl?: 'none' | 'hardware'
  }
}

export {}
