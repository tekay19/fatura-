import { useRef, useState } from "react";
import { Plus, Trash2, Image, X, Settings, User, FileText, Truck, Palette, Search, ExternalLink, RefreshCw } from "lucide-react";

const generateInvoiceNumber = () => {
  const randomValue = new Uint32Array(1);
  window.crypto.getRandomValues(randomValue);
  const suffix = String(randomValue[0] % 1000000).padStart(6, "0");
  return `INV-${new Date().getFullYear()}-${suffix}`;
};

export default function InvoiceForm({ invoiceData, onChange, t }) {
  const fileInputRef = useRef(null);
  const [asin, setAsin] = useState("");
  const [asinMarket, setAsinMarket] = useState("com");
  const [asinError, setAsinError] = useState("");
  const visualTheme = invoiceData.visualTheme || "modern";

  const invoiceThemes = [
    { id: "modern", label: "Modern Grid", color: "#259ac4" },
    { id: "dark", label: "Koyu başlık", color: "#172338" },
    { id: "purple", label: "Mor editoryal", color: "#7957c8" },
    { id: "green", label: "Yeşil kartlar", color: "#27845f" },
    { id: "minimal", label: "Minimal çizgi", color: "#7b8491" },
    { id: "red", label: "Güçlü kırmızı", color: "#ba3f45" }
  ];

  // Field change helper
  const handleFieldChange = (field, value) => {
    const newData = { ...invoiceData, [field]: value };

    onChange(newData);
  };

  // Logo uploader
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFieldChange("logo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoRemove = (e) => {
    e.stopPropagation();
    handleFieldChange("logo", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFieldChange("logo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Item list updates
  const handleItemChange = (index, field, value) => {
    const updatedItems = invoiceData.items.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    handleFieldChange("items", updatedItems);
  };

  const addItemRow = () => {
    const newItems = [
      ...invoiceData.items,
      { description: "", quantity: 1, rate: 0 }
    ];
    handleFieldChange("items", newItems);
  };

  const removeItemRow = (index) => {
    if (invoiceData.items.length <= 1) return; // Always keep at least 1 item
    const newItems = invoiceData.items.filter((_, idx) => idx !== index);
    handleFieldChange("items", newItems);
  };

  const openAsin = () => {
    const normalized = asin.trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(normalized)) {
      setAsinError("ASIN 10 harf/rakamdan oluşmalıdır.");
      return;
    }
    setAsinError("");
    const target = window.open(`https://www.amazon.${asinMarket}/dp/${normalized}`, "_blank", "noopener,noreferrer");
    if (target) target.opener = null;
  };

  return (
    <div className="editor-pane">
      {/* 0. Appearance settings — the invoice layout is fixed to commerce. */}
      <div className="form-card">
        <h3>
          <Palette size={18} className="brand-icon" />
          Fatura görünümü
        </h3>

        <div className="invoice-theme-block">
          <div className="invoice-theme-heading"><Palette size={16} /> Renk ve görünüm</div>
          <div className="invoice-theme-picker" aria-label="Fatura tasarımı">
            {invoiceThemes.map((themeOption) => (
              <button
                key={themeOption.id}
                type="button"
                className={visualTheme === themeOption.id ? "active" : ""}
                onClick={() => handleFieldChange("visualTheme", themeOption.id)}
                aria-pressed={visualTheme === themeOption.id}
              >
                <span style={{ "--theme-swatch": themeOption.color }} />
                {themeOption.label}
              </button>
            ))}
          </div>
        </div>

        <div className="invoice-paper-controls">
          <label className="invoice-paper-toggle">
            <input
              type="checkbox"
              checked={Boolean(invoiceData.paperTexture)}
              onChange={(event) => handleFieldChange("paperTexture", event.target.checked)}
            />
            <span>
              <strong>Hafif sarartı ve buruşukluk</strong>
              <small>A4 ve PDF sınırlarını değiştirmeden doğal kâğıt dokusu uygular.</small>
            </span>
          </label>
          <label className="invoice-paper-strength">
            Yoğunluk
            <select
              className="form-control"
              value={invoiceData.paperStrength || "soft"}
              onChange={(event) => handleFieldChange("paperStrength", event.target.value)}
              disabled={!invoiceData.paperTexture}
            >
              <option value="soft">Hafif</option>
              <option value="natural">Doğal</option>
              <option value="strong">Belirgin</option>
            </select>
          </label>
        </div>
      </div>

      <div className="form-card asin-tool-card">
        <h3><Search size={18} className="brand-icon" /> ASIN ürün araştırması</h3>
        <p>Amazon ürün sayfasını ASIN koduyla doğru ülke mağazasında açın.</p>
        <div className="asin-tool-row">
          <input
            type="text"
            className="form-control"
            value={asin}
            onChange={(event) => {
              setAsin(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10));
              setAsinError("");
            }}
            placeholder="Örn. B0D7Q9K2LM"
            aria-label="ASIN kodu"
          />
          <select className="form-control" value={asinMarket} onChange={(event) => setAsinMarket(event.target.value)} aria-label="Amazon mağazası">
            <option value="com">Amazon.com</option>
            <option value="com.tr">Amazon.com.tr</option>
            <option value="de">Amazon.de</option>
            <option value="co.uk">Amazon.co.uk</option>
            <option value="it">Amazon.it</option>
            <option value="es">Amazon.es</option>
          </select>
          <button type="button" className="asin-open-btn" onClick={openAsin}><ExternalLink size={16} /> Aç</button>
        </div>
        {asinError && <span className="asin-error" role="alert">{asinError}</span>}
      </div>

      {/* 0b. Shipping template specific fields */}
      <div className="form-card">
          <h3>
            <Truck size={18} className="brand-icon" />
            {t.shippingSection}
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="shipping-carrier">{t.shippingCarrier}</label>
              <input
                id="shipping-carrier"
                type="text"
                className="form-control"
                value={invoiceData.shippingCarrier || ""}
                onChange={(e) => handleFieldChange("shippingCarrier", e.target.value)}
                placeholder="UPS WORLDWIDE EXPRESS"
              />
            </div>
            <div className="form-group">
              <label htmlFor="shipping-recipient">{t.shippingRecipient}</label>
              <input
                id="shipping-recipient"
                type="text"
                className="form-control"
                value={invoiceData.shippingName || ""}
                onChange={(e) => handleFieldChange("shippingName", e.target.value)}
                placeholder="ABC Fitness LLC"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="shipping-address">{t.shippingAddressField}</label>
            <textarea
              id="shipping-address"
              className="form-control"
              value={invoiceData.shippingAddress || ""}
              onChange={(e) => handleFieldChange("shippingAddress", e.target.value)}
              placeholder="1200 Brickell Ave, Miami, FL 33131"
              autoComplete="shipping street-address"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="card-brand">{t.cardBrand}</label>
              <select
                id="card-brand"
                className="form-control"
                value={invoiceData.cardBrand || ""}
                onChange={(e) => handleFieldChange("cardBrand", e.target.value)}
              >
                <option value="">—</option>
                <option value="VISA">VISA</option>
                <option value="MASTERCARD">MASTERCARD</option>
                <option value="AMEX">AMEX</option>
                <option value="PAYPAL">PAYPAL</option>
                <option value="BANK TRANSFER">BANK TRANSFER</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="card-last4">{t.cardLast4}</label>
              <input
                id="card-last4"
                type="text"
                inputMode="numeric"
                maxLength={4}
                className="form-control"
                value={invoiceData.cardLast4 || ""}
                onChange={(e) => handleFieldChange("cardLast4", e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1550"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="cs-phone">{t.customerServicePhone}</label>
              <input
                id="cs-phone"
                type="tel"
                className="form-control"
                value={invoiceData.customerServicePhone || ""}
                onChange={(e) => handleFieldChange("customerServicePhone", e.target.value)}
                placeholder="1(800)-777-5706"
              />
            </div>
            <div className="form-group">
              <label htmlFor="bank-account-number">{t.bankAccountNumber}</label>
              <input
                id="bank-account-number"
                type="text"
                className="form-control"
                value={invoiceData.bankAccountNumber || ""}
                onChange={(e) => handleFieldChange("bankAccountNumber", e.target.value)}
                placeholder="028 009 592"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="bank-name">{t.bankName}</label>
              <input
                id="bank-name"
                type="text"
                className="form-control"
                value={invoiceData.bankName || ""}
                onChange={(e) => handleFieldChange("bankName", e.target.value)}
                placeholder="Bank of America"
              />
            </div>
            <div className="form-group">
              <label htmlFor="bank-account-holder">{t.bankAccountHolder}</label>
              <input
                id="bank-account-holder"
                type="text"
                className="form-control"
                value={invoiceData.bankAccountHolder || ""}
                onChange={(e) => handleFieldChange("bankAccountHolder", e.target.value)}
                placeholder="Atlas Teknoloji"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="footer-note">{t.footerNoteLabel}</label>
            <textarea
              id="footer-note"
              className="form-control"
              value={invoiceData.footerNote || ""}
              onChange={(e) => handleFieldChange("footerNote", e.target.value)}
              placeholder="*All import duties, taxes, and clearance fees have been prepaid..."
            />
          </div>
      </div>

      {/* 1. Header & Title Settings */}
      <div className="form-card">
        <h3>
          <FileText size={18} className="brand-icon" />
          {t.invoice} {t.currency}
        </h3>
        
        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="invoice-title">{t.invoice} / {t.estimate}</label>
            <select
              id="invoice-title"
              className="form-control"
              value={invoiceData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
            >
              <option value="Invoice">{t.invoice}</option>
              <option value="Proforma Invoice">{t.proforma}</option>
              <option value="Sales Invoice">{t.salesInvoice}</option>
              <option value="Estimate">{t.estimate}</option>
              <option value="Quote">{t.quote}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="currency-select">{t.currency}</label>
            <select
              id="currency-select"
              className="form-control"
              value={invoiceData.currency}
              onChange={(e) => handleFieldChange("currency", e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="TRY">TRY (₺)</option>
              <option value="DKK">DKK (kr.)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="invoice-number">{t.invoiceNumber}</label>
            <div className="invoice-number-control">
              <input
                id="invoice-number"
                type="text"
                className="form-control"
                value={invoiceData.invoiceNumber}
                onChange={(e) => handleFieldChange("invoiceNumber", e.target.value)}
                placeholder="INV-2026-001"
              />
              <button
                type="button"
                className="invoice-number-generate"
                onClick={() => handleFieldChange("invoiceNumber", generateInvoiceNumber())}
                title="Rastgele fatura numarası üret"
                aria-label="Rastgele fatura numarası üret"
              >
                <RefreshCw size={15} />
                Üret
              </button>
            </div>
          </div>
        </div>

        {/* Logo Drag & Drop Area */}
        <div className="form-group">
          <label>{t.placeholderLogo}</label>
          <div
            className="logo-upload-container"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleLogoUpload}
            />
            {invoiceData.logo ? (
              <div className="logo-preview-wrapper">
                <img
                  src={invoiceData.logo}
                  alt="Company Logo Preview"
                  className="logo-preview-image"
                />
                <button
                  type="button"
                  onClick={handleLogoRemove}
                  className="logo-remove-btn"
                  title="Remove Logo"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <Image size={24} className="brand-icon" style={{ opacity: 0.7 }} />
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  {t.placeholderLogo}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Invoice date */}
      <div className="form-card">
        <h3>
          <Settings size={18} className="brand-icon" />
          {t.invoiceDate}
        </h3>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="invoice-date">{t.invoiceDate}</label>
            <input
              id="invoice-date"
              type="date"
              className="form-control"
              value={invoiceData.invoiceDate}
              onChange={(e) => handleFieldChange("invoiceDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 5. Client Details (Bill To) */}
      <div className="form-card">
        <h3>
          <User size={18} className="brand-icon" />
          {t.billTo}
        </h3>
        
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="to-name">{t.companyName}</label>
            <input
              id="to-name"
              type="text"
              className="form-control"
              value={invoiceData.toName}
              onChange={(e) => handleFieldChange("toName", e.target.value)}
              placeholder="ABC Fitness LLC"
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="to-email">{t.email}</label>
            <input
              id="to-email"
              type="email"
              className="form-control"
              value={invoiceData.toEmail}
              onChange={(e) => handleFieldChange("toEmail", e.target.value)}
              placeholder="john@abcfitness.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="to-address">{t.address}</label>
          <textarea
            id="to-address"
            className="form-control"
            value={invoiceData.toAddress}
            onChange={(e) => handleFieldChange("toAddress", e.target.value)}
            placeholder="Miami, Florida"
            autoComplete="street-address"
          />
        </div>

      </div>

      {/* 6. Invoice Items Table */}
      <div className="form-card">
        <h3>
          <Settings size={18} className="brand-icon" />
          {t.item}
        </h3>
        
        <div className="items-table-container">
          <table className="items-form-table">
            <thead>
              <tr>
                <th style={{ width: "55%" }}>{t.item}</th>
                <th style={{ width: "15%" }}>{t.quantity}</th>
                <th style={{ width: "15%" }}>{t.rate}</th>
                <th style={{ width: "15%", textAlign: "right" }}>{t.amount}</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => {
                const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
                return (
                  <tr key={index}>
                    <td data-label={t.item}>
                      <input
                        type="text"
                        className="form-control"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="WordPress Recovery"
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td data-label={t.quantity}>
                      <input
                        type="number"
                        className="form-control"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        placeholder="1"
                        min="1"
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td data-label={t.rate}>
                      <input
                        type="number"
                        className="form-control"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                        placeholder="500"
                        min="0"
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td data-label={t.amount}>
                      <div className="item-row-amount">
                        <span>{amount.toFixed(2)}</span>
                        {invoiceData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="btn-danger"
                            title="Delete Row"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button type="button" onClick={addItemRow} className="btn-secondary">
          <Plus size={16} />
          {t.addItem}
        </button>
      </div>

      {/* 7. Calculations & Mark as Paid */}
      <div className="form-card">
        <h3>
          <Settings size={18} className="brand-icon" />
          {t.subtotal} & {t.discount}
        </h3>
        
        <div className="calc-fields-grid">
          <div className="form-group">
            <label htmlFor="discount-input">{t.discount}</label>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <input
                id="discount-input"
                type="number"
                className="form-control"
                value={invoiceData.discount}
                onChange={(e) => handleFieldChange("discount", e.target.value)}
                placeholder="0"
                min="0"
                style={{ flex: 1 }}
              />
              <select
                className="form-control"
                value={invoiceData.discountType}
                onChange={(e) => handleFieldChange("discountType", e.target.value)}
                style={{ width: "70px" }}
              >
                <option value="percent">%</option>
                <option value="flat">123</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tax-input">{t.tax} (%)</label>
            <input
              id="tax-input"
              type="number"
              className="form-control"
              value={invoiceData.tax}
              onChange={(e) => handleFieldChange("tax", e.target.value)}
              placeholder="20"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="addtax-input">{t.addTax} (%)</label>
            <input
              id="addtax-input"
              type="number"
              className="form-control"
              value={invoiceData.addTax}
              onChange={(e) => handleFieldChange("addTax", e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="shipping-input">{t.shipping}</label>
            <input
              id="shipping-input"
              type="number"
              className="form-control"
              value={invoiceData.shipping}
              onChange={(e) => handleFieldChange("shipping", e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="clearance-input">{t.clearanceFee}</label>
            <input
              id="clearance-input"
              type="number"
              className="form-control"
              value={invoiceData.clearanceFee ?? 0}
              onChange={(e) => handleFieldChange("clearanceFee", e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="paid-input">{t.amountPaid}</label>
            <input
              id="paid-input"
              type="number"
              className="form-control"
              value={invoiceData.isPaid ? "" : invoiceData.amountPaid}
              onChange={(e) => handleFieldChange("amountPaid", e.target.value)}
              placeholder={invoiceData.isPaid ? "Toplam Tutar" : "300"}
              disabled={invoiceData.isPaid}
              min="0"
            />
          </div>
        </div>

        <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input
            id="mark-paid-check"
            type="checkbox"
            checked={invoiceData.isPaid}
            onChange={(e) => handleFieldChange("isPaid", e.target.checked)}
            style={{ width: "20px", height: "20px", accentColor: "var(--accent-color)" }}
          />
          <label htmlFor="mark-paid-check" style={{ cursor: "pointer", color: "var(--text-main)", fontWeight: 600 }}>
            {t.markPaid}
          </label>
        </div>
      </div>

      {/* 8. Notes */}
      <div className="form-card">
        <h3>
          <FileText size={18} className="brand-icon" />
          {t.notes}
        </h3>
        
        <div className="form-group">
          <label htmlFor="notes-area">{t.notes}</label>
          <textarea
            id="notes-area"
            className="form-control"
            value={invoiceData.notes}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            placeholder="Thank you for your business."
          />
        </div>

      </div>
    </div>
  );
}
