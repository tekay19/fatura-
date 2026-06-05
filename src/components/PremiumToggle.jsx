import React from "react";
import { CreditCard, Lock, ShieldCheck, AlertCircle, Landmark } from "lucide-react";

export default function PremiumToggle({ invoiceData, onChange, t, lang }) {
  const isTurkey = lang === "tr";

  const handleFieldChange = (field, value) => {
    onChange({ ...invoiceData, [field]: value });
  };

  return (
    <div className="premium-toggle-card">
      <div className="premium-toggle-header">
        <div className="premium-toggle-title-area">
          <CreditCard className="card-icon" size={20} />
          <h4>{t.acceptCard}</h4>
          <span className="premium-badge" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <ShieldCheck size={12} /> {t.locked}
          </span>
        </div>
        
        {!isTurkey && (
          <label className="switch-container">
            <input
              type="checkbox"
              checked={invoiceData.acceptStripe || false}
              onChange={(e) => handleFieldChange("acceptStripe", e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        )}
      </div>

      {isTurkey ? (
        <div className="compliance-warning-box" style={{ 
          backgroundColor: "rgba(239, 68, 68, 0.08)", 
          borderLeft: "4px solid #ef4444", 
          padding: "1rem", 
          borderRadius: "0.375rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
          marginTop: "0.5rem"
        }}>
          <AlertCircle className="warning-icon" size={20} style={{ color: "#ef4444", flexShrink: 0, marginTop: "0.1rem" }} />
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 600, marginBottom: "0.25rem" }}>
              Türkiye Düzenlemeleri (BDDK)
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
              {t.stripeDisabledTR}
            </p>
          </div>
        </div>
      ) : (
        <p className="premium-toggle-description">{t.premiumText}</p>
      )}

      {/* Stripe Credentials Form (Active when Accept Stripe is checked and not Turkey) */}
      {!isTurkey && invoiceData.acceptStripe && (
        <div className="stripe-credentials-form" style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          backgroundColor: "var(--bg-input)", 
          borderRadius: "0.5rem",
          border: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          animation: "modalFadeIn 0.2s ease"
        }}>
          <div className="form-group">
            <label htmlFor="stripe-email">{t.stripeEmail} *</label>
            <input
              id="stripe-email"
              type="email"
              className="form-control"
              value={invoiceData.stripeEmail || ""}
              onChange={(e) => handleFieldChange("stripeEmail", e.target.value)}
              placeholder="stripe@semihsoftware.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="stripe-link">{t.stripeLink}</label>
            <input
              id="stripe-link"
              type="url"
              className="form-control"
              value={invoiceData.stripeLink || ""}
              onChange={(e) => handleFieldChange("stripeLink", e.target.value)}
              placeholder="https://buy.stripe.com/abc123xyz"
            />
          </div>
          <div className="payment-icons-row" style={{ marginTop: "0.25rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "0.5rem", display: "flex", alignItems: "center" }}>
              {t.cardAcceptedText}
            </span>
          </div>
        </div>
      )}

      {/* Bank Details Area - Always available, but styled nicely */}
      <div className="bank-details-card" style={{ 
        marginTop: "1rem", 
        borderTop: "1px solid var(--border-color)", 
        paddingTop: "1rem" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Landmark size={18} className="brand-icon" />
          <h5 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{t.bankDetails}</h5>
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
              placeholder="Ziraat Bankası / Deutsche Bank"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bank-holder">{t.bankAccountHolder}</label>
            <input
              id="bank-holder"
              type="text"
              className="form-control"
              value={invoiceData.bankAccountHolder || ""}
              onChange={(e) => handleFieldChange("bankAccountHolder", e.target.value)}
              placeholder="Semih Yazılım"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bank-iban">{t.iban}</label>
            <input
              id="bank-iban"
              type="text"
              className="form-control"
              value={invoiceData.bankIban || ""}
              onChange={(e) => handleFieldChange("bankIban", e.target.value)}
              placeholder="TR00 0000 0000..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="bank-bic">{t.bic}</label>
            <input
              id="bank-bic"
              type="text"
              className="form-control"
              value={invoiceData.bankBic || ""}
              onChange={(e) => handleFieldChange("bankBic", e.target.value)}
              placeholder="DEUTDEDDFXX"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
