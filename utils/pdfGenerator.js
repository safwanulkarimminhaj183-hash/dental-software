/**
 * Digital Invoice & Printable Receipt Generator Utility
 */
export function generateInvoiceHTML(invoiceData) {
  const { invoiceNumber, issueDate, patientName, patientPhone, doctorName, items, subtotal, tax, discount, totalAmount, paymentMethod, paymentStatus, transactionId } = invoiceData;

  const itemRows = items.map((item, index) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${index + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">৳${item.cost.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Dental Invoice - ${invoiceNumber}</title>
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
      .invoice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0077b6; padding-bottom: 20px; }
      .clinic-title { font-size: 24px; color: #0077b6; font-weight: bold; }
      .invoice-details { margin-top: 20px; display: flex; justify-content: space-between; }
      .table-invoice { width: 100%; border-collapse: collapse; margin-top: 30px; }
      .table-invoice th { background-color: #f2f7fb; color: #0077b6; text-align: left; padding: 12px; }
      .summary-section { margin-top: 20px; text-align: right; }
      .summary-row { font-size: 14px; margin-bottom: 5px; }
      .total-row { font-size: 18px; font-weight: bold; color: #0077b6; margin-top: 10px; }
      .badge-paid { background: #28a745; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; display: inline-block; }
      .badge-unpaid { background: #dc3545; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; display: inline-block; }
      .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
    </style>
  </head>
  <body>
    <div class="invoice-header">
      <div>
        <div class="clinic-title">SMILE CARE DENTAL CLINIC</div>
        <div>123 Healthcare Boulevard, Suite 400</div>
        <div>Contact: +880 1700-000000 | help@smiledental.com</div>
      </div>
      <div>
        <h2 style="margin: 0; color: #0077b6;">INVOICE</h2>
        <div><b>Invoice #:</b> ${invoiceNumber}</div>
        <div><b>Date:</b> ${new Date(issueDate).toLocaleDateString('en-BD')}</div>
        <div><b>Status:</b> <span class="${paymentStatus === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">${paymentStatus}</span></div>
      </div>
    </div>

    <div class="invoice-details">
      <div>
        <h4>Billed To (Patient):</h4>
        <div><b>Name:</b> ${patientName}</div>
        <div><b>Phone:</b> ${patientPhone}</div>
      </div>
      <div>
        <h4>Attending Dentist:</h4>
        <div>${doctorName || 'Dr. Smile Care Team'}</div>
        <div><b>Payment Method:</b> ${paymentMethod || 'bKash / Nagad / Card'}</div>
        <div><b>Txn ID:</b> ${transactionId || 'N/A'}</div>
      </div>
    </div>

    <table class="table-invoice">
      <thead>
        <tr>
          <th>#</th>
          <th>Treatment / Service Description</th>
          <th style="text-align: right;">Cost (BDT)</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="summary-section">
      <div class="summary-row">Subtotal: ৳${subtotal.toFixed(2)}</div>
      <div class="summary-row">Tax / VAT (15%): ৳${tax.toFixed(2)}</div>
      <div class="summary-row">Discount: -৳${discount.toFixed(2)}</div>
      <div class="total-row">Total Payable: ৳${totalAmount.toFixed(2)}</div>
    </div>

    <div class="footer">
      Thank you for choosing Smile Care Dental Clinic. Wishing you a healthy smile!<br>
      This is a computer-generated digital receipt. No physical signature is required.
    </div>
  </body>
  </html>
  `;
}
