import { useLayoutEffect, useRef } from "react";
import { CreditCard } from "lucide-react";
import PaperTexture from "./PaperTexture";
import {
  calculateTotals,
  formatMoney,
  getCurrencySymbol,
  formatDateShort
} from "../../utils/calculations";

/**
 * Commerce / logistics style invoice: order summary box, black amount pill,
 * billing + shipping addresses and a boxed grand total.
 */
export default function ShippingTemplate({ invoiceData, t, onPayClick, lang }) {
  const {
    title,
    logo,
    invoiceNumber,
    invoiceDate,
    shippingCarrier,
    toName,
    toAddress,
    toEmail,
    shippingName,
    shippingAddress,
    items,
    notes,
    signature,
    currency,
    discount,
    discountType,
    tax,
    addTax,
    isPaid,
    acceptStripe,
    stripeLink,
    cardBrand,
    cardLast4,
    customerServicePhone,
    fromPhone,
    bankName,
    bankAccountNumber,
    bankAccountHolder,
    footerNote
  } = invoiceData;

  const sheetRef = useRef(null);
  const contentRef = useRef(null);

  // The commerce invoice is deliberately a one-page document. Measure its
  // natural height after every edit and scale the complete layout only when
  // needed. Expanding the layout width before scaling it back keeps the
  // visual edges aligned with the A4 margins and avoids a narrow, shrunken
  // column in the top-left corner.
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    const content = contentRef.current;
    if (!sheet || !content) return undefined;

    let active = true;

    const fitToPage = () => {
      if (!active) return;

      const styles = window.getComputedStyle(sheet);
      const verticalPadding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const availableHeight = sheet.clientHeight - verticalPadding;

      // Reset before measuring so a previous, smaller scale does not affect
      // the natural content height after the user edits the invoice.
      content.style.width = "100%";
      content.style.height = `${availableHeight}px`;
      content.style.transform = "scale(1)";

      const naturalHeight = content.scrollHeight;
      let fitScale = Math.min(1, availableHeight / naturalHeight);

      const applyScale = (nextScale) => {
        content.style.width = `${100 / nextScale}%`;
        content.style.height = `${availableHeight / nextScale}px`;
        content.style.transform = `scale(${nextScale})`;
      };

      applyScale(fitScale);

      // Wider text can reflow after scaling. A second measurement closes the
      // small rounding/reflow gap and guarantees that the footer stays inside.
      const scaledOverflow = content.scrollHeight * fitScale;
      if (scaledOverflow > availableHeight + 0.5) {
        fitScale *= availableHeight / scaledOverflow;
        applyScale(fitScale);
      }

      content.dataset.fitScale = fitScale.toFixed(4);
    };

    fitToPage();

    const images = Array.from(content.querySelectorAll("img"));
    images.forEach((image) => image.addEventListener("load", fitToPage));

    if (document.fonts?.ready) {
      document.fonts.ready.then(fitToPage);
    }

    return () => {
      active = false;
      images.forEach((image) => image.removeEventListener("load", fitToPage));
    };
  }, [invoiceData, lang]);

  const isTurkey = lang === "tr";
  const symbol = getCurrencySymbol(currency);
  const formatCurrency = (val) => formatMoney(val, currency);

  const {
    subtotal,
    discountVal,
    taxVal,
    addTaxVal,
    shippingVal,
    clearanceVal,
    total,
    paidVal,
    balanceDue
  } = calculateTotals(invoiceData);

  // "$ 185.00 USD" — badge keeps the currency code spelled out
  const badgeAmount = currency === "DKK"
    ? `${total.toFixed(2)} ${symbol} ${currency}`
    : `${symbol} ${total.toFixed(2)} ${currency}`;

  const servicePhone = customerServicePhone || fromPhone;
  const last4 = String(cardLast4 || "").slice(-4);

  return (
    <div
      className="invoice-a4-sheet tpl-shipping paper-crumpled"
      ref={sheetRef}
      id="invoice-capture-area"
    >
      <PaperTexture />

      <div className="tpl2-page-content" ref={contentRef}>

        {/* Order summary box + title / amount badge */}
        <header className="tpl2-header">
        <div className="tpl2-order-box">
          <div className="tpl2-order-field">
            <div className="tpl2-label">{t.orderDate}</div>
            <div className="tpl2-value">{formatDateShort(invoiceDate)}</div>
          </div>
          <div className="tpl2-order-field">
            <div className="tpl2-label">{t.invoiceNo}</div>
            <div className="tpl2-value tpl2-value-strong">{invoiceNumber || "INV-000000"}</div>
          </div>
          {shippingCarrier && (
            <div className="tpl2-order-field">
              <div className="tpl2-label">{t.shippingService}</div>
              <div className="tpl2-value">{shippingCarrier}</div>
            </div>
          )}
        </div>

        <div className="tpl2-header-right">
          {logo && <img src={logo} alt="Company Logo" className="tpl2-logo" />}
          <h1 className="tpl2-title">{title || t.invoice}</h1>
          <div className="tpl2-amount-badge">{badgeAmount}</div>
        </div>
        </header>

        <div className="tpl2-rule" />

        {/* Items */}
        <table className="tpl2-items-table">
        <thead>
          <tr>
            <th style={{ width: "46%", textAlign: "left" }}>{t.itemDescription}</th>
            <th style={{ width: "14%", textAlign: "right" }}>{t.qty}</th>
            <th style={{ width: "20%", textAlign: "right" }}>{t.price}</th>
            <th style={{ width: "20%", textAlign: "right" }}>{t.lineTotal}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            return (
              <tr key={index}>
                <td>{item.description}</td>
                <td style={{ textAlign: "right" }}>{qty}</td>
                <td style={{ textAlign: "right" }}>{formatCurrency(rate)}</td>
                <td style={{ textAlign: "right" }}>{formatCurrency(qty * rate)}</td>
              </tr>
            );
          })}
        </tbody>
        </table>

        <div className="tpl2-rule" />

        {/* Addresses + totals */}
        <div className="tpl2-body">
        <div className="tpl2-addresses">
          <div className="tpl2-address-block">
            <h5 className="tpl2-section-heading">{t.billingAddress}</h5>
            <div className="tpl2-address-text">
              {toName && <strong>{toName}</strong>}
              {toAddress}
              {toEmail && `\n${toEmail}`}
            </div>
          </div>

          <div className="tpl2-address-divider" />

          <div className="tpl2-address-block">
            <h5 className="tpl2-section-heading">{t.shippingAddress}</h5>
            <div className="tpl2-address-text">
              {shippingName && <strong>{shippingName}</strong>}
              {shippingAddress}
            </div>
          </div>

          {notes && (
            <div className="tpl2-address-block" style={{ marginTop: "0.75rem" }}>
              <h5 className="tpl2-section-heading">{t.notes}</h5>
              <div className="tpl2-address-text">{notes}</div>
            </div>
          )}
        </div>

        <div className="tpl2-totals">
          <div className="tpl2-total-row">
            <span>{t.subtotal}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {discountVal > 0 && (
            <div className="tpl2-total-row">
              <span>{t.discount} {discountType === "percent" ? `(${discount}%)` : ""}</span>
              <span>-{formatCurrency(discountVal)}</span>
            </div>
          )}

          <div className="tpl2-total-row">
            <span>{t.shipping}</span>
            <span>{formatCurrency(shippingVal)}</span>
          </div>

          <div className="tpl2-total-row">
            <span>{t.clearanceHandling}</span>
            <span>{formatCurrency(clearanceVal)}</span>
          </div>

          <div className="tpl2-total-row">
            <span>{t.salesTax} ({tax || 0}%)</span>
            <span>{formatCurrency(taxVal)}</span>
          </div>

          {addTax > 0 && (
            <div className="tpl2-total-row">
              <span>{t.addTax} ({addTax}%)</span>
              <span>{formatCurrency(addTaxVal)}</span>
            </div>
          )}

          {paidVal > 0 && (
            <div className="tpl2-total-row">
              <span>{t.paidAmount}</span>
              <span>{formatCurrency(paidVal)}</span>
            </div>
          )}

          <div className="tpl2-total-row">
            <span>{t.paymentMethod}</span>
            <span className="tpl2-card">
              {cardBrand || "—"}
              {last4 && <span className="tpl2-card-mask"> •••• •••• {last4}</span>}
            </span>
          </div>

          {balanceDue > 0 && (
            <div className="tpl2-total-row tpl2-balance">
              <span>{t.balanceDue}</span>
              <span>{formatCurrency(balanceDue)}</span>
            </div>
          )}

          <div className="tpl2-grand-total">
            <span>{t.grandTotal}</span>
            <span>{formatCurrency(total)}</span>
          </div>

          {!isPaid && acceptStripe && !isTurkey && (
            <div className="pdf-no-print" style={{ marginTop: "0.75rem" }}>
              {stripeLink ? (
                <a
                  href={stripeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tpl2-pay-btn"
                >
                  <CreditCard size={14} />
                  {t.payInvoice}
                </a>
              ) : (
                <button type="button" onClick={onPayClick} className="tpl2-pay-btn">
                  <CreditCard size={14} />
                  {t.payInvoice}
                </button>
              )}
            </div>
          )}

          {signature && (
            <div className="tpl2-signature">
              <img src={signature} alt="Signature" />
              <div className="tpl2-signature-label">{t.signature}</div>
            </div>
          )}
        </div>
        </div>

        {/* Footer */}
        <div className="tpl2-footer-wrap">
        <div className="tpl2-rule" />
        <div className="tpl2-footer">
          <div>
            <h5 className="tpl2-section-heading">{t.customerService}</h5>
            {servicePhone && <div className="tpl2-footer-text">{servicePhone}</div>}
          </div>
          <div className="tpl2-footer-bank">
            {bankName && <div>{t.bankName} : <strong>{bankName}</strong></div>}
            {bankAccountNumber && <div>{t.accountNumber} : <strong>{bankAccountNumber}</strong></div>}
            {bankAccountHolder && <div>{t.accountName} : <strong>{bankAccountHolder}</strong></div>}
          </div>
        </div>

        {footerNote && <div className="tpl2-footnote">{footerNote}</div>}
        </div>
      </div>
    </div>
  );
}
