export const THERMAL_RECEIPT_CSS = `
  @page {
    size: 80mm auto;
    margin: 0;
  }

  @media print {
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }

    body {
      margin: 0;
      padding: 0;
      background: white;
    }

    .receipt-container {
      width: 80mm;
      margin: 0;
      padding: 0;
      font-family: monospace;
      font-size: 11px;
      line-height: 1.4;
      background: white;
      color: black;
    }

    .receipt-header {
      text-align: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #000;
    }

    .receipt-logo {
      max-width: 60mm;
      max-height: 30mm;
      margin-bottom: 4px;
    }

    .receipt-org-name {
      font-weight: bold;
      font-size: 12px;
      margin: 2px 0;
    }

    .receipt-branch-info {
      font-size: 9px;
      margin: 2px 0;
      text-align: center;
    }

    .receipt-items {
      margin: 8px 0;
    }

    .receipt-item-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 10px;
    }

    .receipt-item-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .receipt-item-qty {
      width: 30px;
      text-align: right;
      margin: 0 4px;
    }

    .receipt-item-price {
      width: 35px;
      text-align: right;
    }

    .receipt-divider {
      border-bottom: 1px dashed #000;
      margin: 4px 0;
    }

    .receipt-totals {
      margin: 4px 0;
      font-size: 10px;
    }

    .receipt-total-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
    }

    .receipt-total-label {
      flex: 1;
    }

    .receipt-total-value {
      width: 50px;
      text-align: right;
    }

    .receipt-grand-total {
      font-weight: bold;
      font-size: 12px;
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px solid #000;
    }

    .receipt-tax-breakdown {
      font-size: 9px;
      margin: 4px 0;
      padding: 4px 0;
      border-top: 1px dashed #000;
    }

    .receipt-tax-line {
      display: flex;
      justify-content: space-between;
      margin: 1px 0;
    }

    .receipt-payments {
      margin: 4px 0;
      padding: 4px 0;
      border-top: 1px dashed #000;
      font-size: 10px;
    }

    .receipt-payment-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
    }

    .receipt-change {
      margin-top: 2px;
      padding-top: 2px;
    }

    .receipt-footer {
      text-align: center;
      margin-top: 8px;
      padding-top: 8px;
      font-size: 9px;
      border-top: 1px dashed #000;
    }

    .receipt-number {
      font-size: 9px;
      text-align: center;
      margin: 2px 0;
    }

    .receipt-timestamp {
      font-size: 8px;
      text-align: center;
    }
  }

  @media screen {
    .receipt-container {
      width: 80mm;
      margin: 20px auto;
      padding: 16px;
      font-family: monospace;
      font-size: 11px;
      line-height: 1.4;
      background: white;
      color: black;
      border: 1px solid #ddd;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .receipt-header {
      text-align: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #999;
    }

    .receipt-logo {
      max-width: 60mm;
      max-height: 30mm;
      margin-bottom: 4px;
    }

    .receipt-org-name {
      font-weight: bold;
      font-size: 12px;
      margin: 2px 0;
    }

    .receipt-branch-info {
      font-size: 9px;
      margin: 2px 0;
      text-align: center;
      color: #666;
    }

    .receipt-items {
      margin: 8px 0;
    }

    .receipt-item-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 10px;
    }

    .receipt-item-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .receipt-item-qty {
      width: 30px;
      text-align: right;
      margin: 0 4px;
    }

    .receipt-item-price {
      width: 35px;
      text-align: right;
    }

    .receipt-divider {
      border-bottom: 1px dashed #999;
      margin: 4px 0;
    }

    .receipt-totals {
      margin: 4px 0;
      font-size: 10px;
    }

    .receipt-total-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
    }

    .receipt-total-label {
      flex: 1;
    }

    .receipt-total-value {
      width: 50px;
      text-align: right;
    }

    .receipt-grand-total {
      font-weight: bold;
      font-size: 12px;
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px solid #000;
    }

    .receipt-tax-breakdown {
      font-size: 9px;
      margin: 4px 0;
      padding: 4px 0;
      border-top: 1px dashed #999;
      color: #666;
    }

    .receipt-tax-line {
      display: flex;
      justify-content: space-between;
      margin: 1px 0;
    }

    .receipt-payments {
      margin: 4px 0;
      padding: 4px 0;
      border-top: 1px dashed #999;
      font-size: 10px;
    }

    .receipt-payment-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
    }

    .receipt-change {
      margin-top: 2px;
      padding-top: 2px;
      font-weight: bold;
    }

    .receipt-footer {
      text-align: center;
      margin-top: 8px;
      padding-top: 8px;
      font-size: 9px;
      border-top: 1px dashed #999;
      color: #666;
    }

    .receipt-number {
      font-size: 9px;
      text-align: center;
      margin: 2px 0;
      color: #999;
    }

    .receipt-timestamp {
      font-size: 8px;
      text-align: center;
      color: #ccc;
    }
  }
`
