import { PrinterTransportError } from '../../errors'

export class WebUsbTransport {
  private device: USBDevice | null = null

  async isAvailable(): Promise<boolean> {
    return typeof navigator !== 'undefined' && !!navigator.usb
  }

  async requestDevice(): Promise<void> {
    if (!navigator.usb) {
      throw new PrinterTransportError('WebUSB not supported in this browser')
    }

    try {
      this.device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0519 }, // Star Micronics
          { vendorId: 0x0456 }, // Honeywell
        ],
      })

      if (!this.device.opened) {
        await this.device.open()
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        throw new PrinterTransportError('No USB printer selected')
      }
      throw new PrinterTransportError(`Failed to connect to USB printer: ${error}`)
    }
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.device) {
      throw new PrinterTransportError('Device not connected. Call requestDevice() first.')
    }

    try {
      // Find the first bulk out endpoint
      const iface = this.device.configuration?.interfaces[0]
      if (!iface) {
        throw new PrinterTransportError('No interface found on device')
      }

      const endpoint = iface.alternates[0]?.endpoints.find(
        (e) => e.type === 'bulk' && e.direction === 'out',
      )

      if (!endpoint) {
        throw new PrinterTransportError('No bulk out endpoint found')
      }

      await this.device.transferOut(endpoint.endpointNumber, data)
    } catch (error) {
      if (error instanceof PrinterTransportError) {
        throw error
      }
      throw new PrinterTransportError(`Failed to write to printer: ${error}`)
    }
  }

  async close(): Promise<void> {
    if (this.device && this.device.opened) {
      try {
        await this.device.close()
      } catch (error) {
        console.warn('Failed to close USB device:', error)
      }
    }
    this.device = null
  }
}
