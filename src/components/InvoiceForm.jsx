import React, { useRef } from "react";
import { Plus, Trash2, Image, X, Settings, User, FileText, CheckCircle, Shield } from "lucide-react";
import SignaturePad from "./SignaturePad";
import PremiumToggle from "./PremiumToggle";

export default function InvoiceForm({ invoiceData, onChange, t, lang }) {
  const fileInputRef = useRef(null);
  const isTurkey = lang === "tr";
  const isGermanic = lang === "de" || lang === "de-AT";
  const isDanish = lang === "da";
  const isEnglish = lang === "en";

  // Field change helper
  const handleFieldChange = (field, value) => {
    const newData = { ...invoiceData, [field]: value };

    // Auto-calculate Due Date if Invoice Date or Payment Terms changes
    if (field === "invoiceDate" || field === "paymentTerms") {
      const dateStr = field === "invoiceDate" ? value : invoiceData.invoiceDate;
      const terms = field === "paymentTerms" ? value : invoiceData.paymentTerms;
      
      if (dateStr && terms !== "custom") {
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
          if (terms === "30") {
            dateObj.setDate(dateObj.getDate() + 30);
            newData.dueDate = dateObj.toISOString().split("T")[0];
          } else if (terms === "60") {
            dateObj.setDate(dateObj.getDate() + 60);
            newData.dueDate = dateObj.toISOString().split("T")[0];
          } else if (terms === "receipt") {
            newData.dueDate = dateStr;
          }
        }
      }
    }

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

  return (
    <div className="editor-pane">
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
            <input
              id="invoice-number"
              type="text"
              className="form-control"
              value={invoiceData.invoiceNumber}
              onChange={(e) => handleFieldChange("invoiceNumber", e.target.value)}
              placeholder="INV-2026-001"
            />
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

      {/* 2. Dates & Terms */}
      <div className="form-card">
        <h3>
          <Settings size={18} className="brand-icon" />
          {t.invoiceDate} & {t.dueDate}
        </h3>
        
        <div className="form-grid-3">
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

          <div className="form-group">
            <label htmlFor="payment-terms">{t.paymentTerms}</label>
            <select
              id="payment-terms"
              className="form-control"
              value={invoiceData.paymentTerms}
              onChange={(e) => handleFieldChange("paymentTerms", e.target.value)}
            >
              <option value="receipt">{t.dueOnReceipt}</option>
              <option value="30">30 {t.days}</option>
              <option value="60">60 {t.days}</option>
              <option value="custom">{t.custom}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="due-date">{t.dueDate}</label>
            <input
              id="due-date"
              type="date"
              className="form-control"
              value={invoiceData.dueDate}
              onChange={(e) => handleFieldChange("dueDate", e.target.value)}
              disabled={invoiceData.paymentTerms !== "custom"}
            />
          </div>
        </div>
      </div>

      {/* 3. Credit Card Accept (Stripe) & Bank Details */}
      <PremiumToggle invoiceData={invoiceData} onChange={onChange} t={t} lang={lang} />

      {/* 4. Sender Details (From) */}
      <div className="form-card">
        <h3>
          <User size={18} className="brand-icon" />
          {t.from}
        </h3>
        
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="from-name">{t.companyName}</label>
            <input
              id="from-name"
              type="text"
              className="form-control"
              value={invoiceData.fromName}
              onChange={(e) => handleFieldChange("fromName", e.target.value)}
              placeholder="Semih Software"
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="from-email">{t.email}</label>
            <input
              id="from-email"
              type="email"
              className="form-control"
              value={invoiceData.fromEmail}
              onChange={(e) => handleFieldChange("fromEmail", e.target.value)}
              placeholder="info@semihsoftware.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="from-address">{t.address}</label>
          <textarea
            id="from-address"
            className="form-control"
            value={invoiceData.fromAddress}
            onChange={(e) => handleFieldChange("fromAddress", e.target.value)}
            placeholder="Aksaray / Türkiye"
            autoComplete="street-address"
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="from-website">{t.website}</label>
            <input
              id="from-website"
              type="url"
              className="form-control"
              value={invoiceData.fromWebsite}
              onChange={(e) => handleFieldChange("fromWebsite", e.target.value)}
              placeholder="www.semihsoftware.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="from-phone">{t.phone}</label>
            <input
              id="from-phone"
              type="tel"
              className="form-control"
              value={invoiceData.fromPhone}
              onChange={(e) => handleFieldChange("fromPhone", e.target.value)}
              placeholder="+90 555 555 55 55"
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Dynamic Compliance Fields (From) */}
        <div className="compliance-fields-area" style={{ 
          borderTop: "1px dashed var(--border-color)", 
          paddingTop: "1rem", 
          marginTop: "0.5rem" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem", color: "var(--text-muted)" }}>
            <Shield size={14} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t.legalNotice}
            </span>
          </div>

          <div className="form-grid-2">
            {/* Tax Number / VAT ID */}
            <div className="form-group">
              <label htmlFor="from-vatid">{t.vatId}</label>
              <input
                id="from-vatid"
                type="text"
                className="form-control"
                value={invoiceData.fromVatId || ""}
                onChange={(e) => handleFieldChange("fromVatId", e.target.value)}
                placeholder={isTurkey ? "Vergi/TCKN No" : "ATU12345678 / DE123456789 / DK12345678"}
              />
            </div>

            {/* Registration Number */}
            <div className="form-group">
              <label htmlFor="from-regno">{t.companyRegNo}</label>
              <input
                id="from-regno"
                type="text"
                className="form-control"
                value={invoiceData.fromRegNo || ""}
                onChange={(e) => handleFieldChange("fromRegNo", e.target.value)}
                placeholder={isTurkey ? "Ticaret Sicil No" : "FN 123456 x / HRB 1234"}
              />
            </div>

            {/* Turkey specific: Tax Office / MERSIS */}
            {isTurkey && (
              <>
                <div className="form-group">
                  <label htmlFor="from-taxoffice">{t.taxOffice}</label>
                  <input
                    id="from-taxoffice"
                    type="text"
                    className="form-control"
                    value={invoiceData.fromTaxOffice || ""}
                    onChange={(e) => handleFieldChange("fromTaxOffice", e.target.value)}
                    placeholder="Aksaray Vergi Dairesi"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="from-mersis">{t.mersisNo}</label>
                  <input
                    id="from-mersis"
                    type="text"
                    className="form-control"
                    value={invoiceData.fromMersis || ""}
                    onChange={(e) => handleFieldChange("fromMersis", e.target.value)}
                    placeholder="0123-4567-8901-2345"
                  />
                </div>
              </>
            )}

            {/* Germanic specific: Tax Office / Jurisdiction */}
            {isGermanic && (
              <>
                <div className="form-group">
                  <label htmlFor="from-taxoffice">{t.taxOffice}</label>
                  <input
                    id="from-taxoffice"
                    type="text"
                    className="form-control"
                    value={invoiceData.fromTaxOffice || ""}
                    onChange={(e) => handleFieldChange("fromTaxOffice", e.target.value)}
                    placeholder="Finanzamt Wien / Berlin"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="from-jurisdiction">Gerichtsstand (Jurisdiction Court)</label>
                  <input
                    id="from-jurisdiction"
                    type="text"
                    className="form-control"
                    value={invoiceData.fromJurisdiction || ""}
                    onChange={(e) => handleFieldChange("fromJurisdiction", e.target.value)}
                    placeholder="Handelsgericht Wien"
                  />
                </div>
              </>
            )}

            {/* Managing Director for EU/International (legally required for companies) */}
            {!isTurkey && (
              <div className="form-group">
                <label htmlFor="from-director">{t.managingDirector}</label>
                <input
                  id="from-director"
                  type="text"
                  className="form-control"
                  value={invoiceData.fromDirector || ""}
                  onChange={(e) => handleFieldChange("fromDirector", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            )}
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

        {/* Dynamic Compliance Fields (To) */}
        <div className="compliance-fields-area" style={{ 
          borderTop: "1px dashed var(--border-color)", 
          paddingTop: "1rem", 
          marginTop: "0.5rem" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem", color: "var(--text-muted)" }}>
            <Shield size={14} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t.billTo} {t.legalNotice}
            </span>
          </div>

          <div className="form-grid-2">
            {/* Recipient VAT ID / Tax Number */}
            <div className="form-group">
              <label htmlFor="to-vatid">{t.vatId} ({t.billTo})</label>
              <input
                id="to-vatid"
                type="text"
                className="form-control"
                value={invoiceData.toVatId || ""}
                onChange={(e) => handleFieldChange("toVatId", e.target.value)}
                placeholder={isTurkey ? "Vergi/TCKN No" : "KDV No / VAT ID"}
              />
            </div>
            
            {/* Recipient Reg Number / CVR */}
            {!isTurkey && (
              <div className="form-group">
                <label htmlFor="to-regno">{t.companyRegNo} ({t.billTo})</label>
                <input
                  id="to-regno"
                  type="text"
                  className="form-control"
                  value={invoiceData.toRegNo || ""}
                  onChange={(e) => handleFieldChange("toRegNo", e.target.value)}
                  placeholder="Registration Number"
                />
              </div>
            )}
          </div>
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

      {/* 8. Signature Pad */}
      <div className="form-card">
        <h3>
          <CheckCircle size={18} className="brand-icon" />
          {t.signature}
        </h3>
        <SignaturePad
          value={invoiceData.signature}
          onChange={(sig) => handleFieldChange("signature", sig)}
          t={t}
        />
      </div>

      {/* 9. Notes & Terms */}
      <div className="form-card">
        <h3>
          <FileText size={18} className="brand-icon" />
          {t.notes} & {t.terms}
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

        <div className="form-group">
          <label htmlFor="terms-area">{t.terms}</label>
          <textarea
            id="terms-area"
            className="form-control"
            value={invoiceData.terms}
            onChange={(e) => handleFieldChange("terms", e.target.value)}
            placeholder="Payment due within 30 days."
          />
        </div>
      </div>
    </div>
  );
}
