import React from "react";
import { CreditCard } from "lucide-react";

const getCurrencySymbol = (code) => {
  switch (code) {
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    case "TRY": return "₺";
    case "DKK": return "kr.";
    default: return "$";
  }
};

export default function InvoicePreview({ invoiceData, t, elementRef, onPayClick, lang }) {
  const {
    title,
    logo,
    invoiceNumber,
    invoiceDate,
    dueDate,
    paymentTerms,
    // From Details
    fromName,
    fromEmail,
    fromAddress,
    fromWebsite,
    fromPhone,
    fromVatId,
    fromRegNo,
    fromTaxOffice,
    fromMersis,
    fromJurisdiction,
    fromDirector,
    // To Details
    toName,
    toEmail,
    toAddress,
    toVatId,
    toRegNo,
    // Item Details
    items,
    notes,
    terms,
    signature,
    currency,
    discount,
    discountType,
    tax,
    addTax,
    shipping,
    amountPaid,
    isPaid,
    // Stripe settings
    acceptStripe,
    stripeLink,
    // Bank details
    bankName,
    bankAccountHolder,
    bankIban,
    bankBic
  } = invoiceData;

  const isTurkey = lang === "tr";
  const symbol = getCurrencySymbol(currency);

  // Formatting utility
  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    if (currency === "DKK") {
      return `${num.toFixed(2)} ${symbol}`;
    }
    return `${symbol}${num.toFixed(2)}`;
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return acc + (qty * rate);
  }, 0);

  const discountVal = discountType === "percent"
    ? subtotal * ((parseFloat(discount) || 0) / 100)
    : (parseFloat(discount) || 0);

  const afterDiscount = subtotal - discountVal;

  const taxVal = afterDiscount * ((parseFloat(tax) || 0) / 100);
  const addTaxVal = afterDiscount * ((parseFloat(addTax) || 0) / 100);
  const shippingVal = parseFloat(shipping) || 0;

  const total = afterDiscount + taxVal + addTaxVal + shippingVal;
  const paidVal = parseFloat(amountPaid) || 0;
  const balanceDue = total - paidVal;

  // Format date helper (DD.MM.YYYY)
  const formatDateString = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const showReverseCharge = !isTurkey && fromVatId && toVatId;

  return (
    <div className="invoice-a4-sheet" ref={elementRef} id="invoice-capture-area">

      {/* Header with logo & title */}
      <div className="preview-header">
        <div className="preview-logo-area">
          {logo ? (
            <img src={logo} alt="Company Logo" className="preview-logo-img" />
          ) : (
            <div style={{ color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic", height: "40px", display: "flex", alignItems: "center" }}>
              {/* Optional Placeholder */}
            </div>
          )}
        </div>
        <div className="preview-title-area">
          <h1 className="preview-title-text">{title || t.invoice}</h1>
          <div className="preview-inv-number">{invoiceNumber || "INV-2026-001"}</div>
        </div>
      </div>

      {/* Meta Sender & Recipient Section */}
      <div className="preview-meta-section">
        <div className="preview-meta-group">
          <h5>{t.from}</h5>
          <div className="preview-meta-address">
            <strong style={{ fontSize: "1.05rem" }}>{fromName || "Semih Yazılım"}</strong>
            {fromAddress && `${fromAddress}`}
            {fromPhone && `\n${t.phone}: ${fromPhone}`}
            {fromEmail && `\n${t.email}: ${fromEmail}`}
            {fromWebsite && `\n${t.website}: ${fromWebsite}`}
          </div>
        </div>

        <div className="preview-meta-group">
          <div className="form-grid-2">
            <div>
              <h5>{t.billTo}</h5>
              <div className="preview-meta-address">
                <strong style={{ fontSize: "1.05rem" }}>{toName || "ABC Fitness LLC"}</strong>
                {toAddress && `${toAddress}`}
                {toEmail && `\n${t.email}: ${toEmail}`}
                
                {/* Recipient VAT number display */}
                {toVatId && (
                  <div style={{ marginTop: "0.35rem", fontSize: "0.8rem", color: "#475569", fontWeight: "600" }}>
                    {t.vatId}: {toVatId}
                  </div>
                )}
              </div>
            </div>
            
            <div className="preview-details-group">
              <h5>&nbsp;</h5>
              <div className="preview-detail-row">
                <span>{t.invoiceDate}:</span>
                <span>{formatDateString(invoiceDate)}</span>
              </div>
              <div className="preview-detail-row">
                <span>{t.dueDate}:</span>
                <span>{formatDateString(dueDate)}</span>
              </div>
              <div className="preview-detail-row">
                <span>{t.paymentTerms}:</span>
                <span>
                  {paymentTerms === "30" ? `30 ${t.days}` :
                   paymentTerms === "60" ? `60 ${t.days}` :
                   paymentTerms === "receipt" ? t.dueOnReceipt :
                   paymentTerms}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table with Pos column */}
      <table className="preview-items-table">
        <thead>
          <tr>
            <th style={{ width: "8%", textAlign: "left" }}>{t.pos}</th>
            <th style={{ width: "52%", textAlign: "left" }}>{t.item}</th>
            <th style={{ width: "12%", textAlign: "right" }}>{t.quantity}</th>
            <th style={{ width: "14%", textAlign: "right" }}>{t.rate}</th>
            <th style={{ width: "14%", textAlign: "right" }}>{t.amount}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const amt = qty * rate;
            return (
              <tr key={index}>
                <td style={{ textAlign: "left", color: "#64748b", fontWeight: "600" }}>
                  {String(index + 1).padStart(2, "0")}
                </td>
                <td>
                  <div className="preview-item-description">{item.description || "Service Description"}</div>
                </td>
                <td style={{ textAlign: "right" }}>{qty}</td>
                <td style={{ textAlign: "right" }}>{formatCurrency(rate)}</td>
                <td style={{ textAlign: "right" }}>{formatCurrency(amt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Bottom section: Notes, VAT Breakdown, Totals, Signature */}
      <div className="preview-bottom-section">
        {/* Notes, Terms & VAT Breakdown */}
        <div className="preview-notes-terms">
          {notes && (
            <div className="preview-notes-block">
              <h6>{t.notes}</h6>
              <p>{notes}</p>
            </div>
          )}
          {terms && (
            <div className="preview-terms-block">
              <h6>{t.terms}</h6>
              <p>{terms}</p>
            </div>
          )}

          {/* European VAT Breakdown Specification Table */}
          {tax > 0 && (
            <div style={{ marginTop: "0.25rem", pageBreakInside: "avoid" }}>
              <h6 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", fontWeight: 700, marginBottom: "0.35rem" }}>
                {t.vatBreakdown}
              </h6>
              <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse", border: "1px solid #e2e8f0" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid #cbd5e1", textAlign: "left", color: "#475569" }}>{t.vatRate}</th>
                    <th style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid #cbd5e1", textAlign: "right", color: "#475569" }}>{t.net}</th>
                    <th style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid #cbd5e1", textAlign: "right", color: "#475569" }}>{t.vatAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>%{tax}</td>
                    <td style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>{formatCurrency(afterDiscount)}</td>
                    <td style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>{formatCurrency(taxVal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Dynamic Reverse Charge Notice */}
          {showReverseCharge && (
            <div className="preview-compliance-note" style={{ 
              fontSize: "0.725rem", 
              color: "#64748b", 
              fontStyle: "italic", 
              marginTop: "0.35rem" 
            }}>
              ℹ️ {t.reverseChargeNote}
            </div>
          )}
        </div>

        {/* Calculations Block */}
        <div>
          <div className="preview-totals-block">
            <div className="preview-total-row">
              <span>{t.subtotal}:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            {discountVal > 0 && (
              <div className="preview-total-row">
                <span>
                  {t.discount} ({discountType === "percent" ? `${discount}%` : t.custom}):
                </span>
                <span>-{formatCurrency(discountVal)}</span>
              </div>
            )}

            {tax > 0 && (
              <div className="preview-total-row">
                <span>{t.tax} ({tax}%):</span>
                <span>{formatCurrency(taxVal)}</span>
              </div>
            )}

            {addTax > 0 && (
              <div className="preview-total-row">
                <span>{t.addTax} ({addTax}%):</span>
                <span>{formatCurrency(addTaxVal)}</span>
              </div>
            )}

            {shippingVal > 0 && (
              <div className="preview-total-row">
                <span>{t.shipping}:</span>
                <span>{formatCurrency(shippingVal)}</span>
              </div>
            )}

            <div className="preview-total-row grand-total">
              <span>{t.total}:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {paidVal > 0 && (
              <div className="preview-total-row">
                <span>{t.amountPaid}:</span>
                <span>{formatCurrency(paidVal)}</span>
              </div>
            )}

            <div className={`preview-total-row balance-due ${balanceDue <= 0 ? "paid-off" : ""}`}>
              <span>{t.balanceDue}:</span>
              <span>{formatCurrency(balanceDue)}</span>
            </div>

            {/* Clickable Stripe Pay Button inside Preview */}
            {!isPaid && acceptStripe && !isTurkey && (
              <div className="pdf-no-print" style={{ marginTop: "0.75rem" }}>
                {stripeLink ? (
                  <a
                    href={stripeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      backgroundColor: "#6366f1",
                      color: "#ffffff",
                      fontWeight: "bold",
                      padding: "0.6rem",
                      fontSize: "0.85rem",
                      textAlign: "center",
                      textDecoration: "none",
                      borderRadius: "0.375rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    <CreditCard size={14} />
                    {t.payInvoice}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={onPayClick}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      backgroundColor: "#6366f1",
                      color: "#ffffff",
                      fontWeight: "bold",
                      padding: "0.6rem",
                      fontSize: "0.85rem",
                      borderRadius: "0.375rem"
                    }}
                  >
                    <CreditCard size={14} />
                    {t.payInvoice}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Signature Area */}
          {signature && (
            <div className="preview-signature-area">
              <div className="preview-signature-line">
                <img src={signature} alt="Signature" className="preview-signature-img" />
              </div>
              <div className="preview-signature-label">{t.signature}</div>
            </div>
          )}
        </div>
      </div>

      {/* 3-Column European Standard Corporate Footer */}
      <footer className="preview-footer" style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr 1fr", 
        gap: "1.25rem", 
        fontSize: "0.65rem", 
        color: "#64748b", 
        borderTop: "1px solid #cbd5e1", 
        paddingTop: "0.85rem", 
        marginTop: "auto",
        lineHeight: "1.45"
      }}>
        {/* Column 1: Company Contact Details */}
        <div style={{ textAlign: "left" }}>
          <strong style={{ color: "#475569", display: "block", marginBottom: "0.2rem" }}>
            {fromName || "Smart Invoice"}
          </strong>
          {fromAddress && <div>{fromAddress.replace(/\n/g, ", ")}</div>}
          {fromPhone && <div>Tel: {fromPhone}</div>}
          {fromEmail && <div>Email: {fromEmail}</div>}
          {fromWebsite && <div>Web: {fromWebsite}</div>}
        </div>

        {/* Column 2: Legal Registrations */}
        <div style={{ textAlign: "left" }}>
          <strong style={{ color: "#475569", display: "block", marginBottom: "0.2rem" }}>
            {t.legalNotice}
          </strong>
          {fromVatId && <div>{t.vatId}: {fromVatId}</div>}
          {fromRegNo && <div>{t.companyRegNo}: {fromRegNo}</div>}
          {fromMersis && <div>{t.mersisNo}: {fromMersis}</div>}
          {fromTaxOffice && <div>{t.taxOffice}: {fromTaxOffice}</div>}
          {fromJurisdiction && <div>Gerichtsstand: {fromJurisdiction}</div>}
          {fromDirector && <div>{t.managingDirector}: {fromDirector}</div>}
        </div>

        {/* Column 3: Bank Payment Details */}
        <div style={{ textAlign: "left" }}>
          <strong style={{ color: "#475569", display: "block", marginBottom: "0.2rem" }}>
            {t.bankDetails}
          </strong>
          {bankName && <div>{t.bankName}: {bankName}</div>}
          {bankAccountHolder && <div>{t.bankAccountHolder}: {bankAccountHolder}</div>}
          {bankIban && <div style={{ wordBreak: "break-all" }}>{t.iban}: {bankIban}</div>}
          {bankBic && <div>{t.bic}: {bankBic}</div>}
        </div>
      </footer>
    </div>
  );
}
