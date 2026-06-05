import React, { useState } from "react";
import { Lock, ShieldCheck, Check, Loader2, CreditCard } from "lucide-react";

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

export default function StripeCheckout({ invoiceData, onClose, onPaymentSuccess, t }) {
  const { total, currency, fromName, invoiceNumber } = invoiceData;
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const symbol = getCurrencySymbol(currency);

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    if (currency === "DKK") {
      return `${num.toFixed(2)} ${symbol}`;
    }
    return `${symbol}${num.toFixed(2)}`;
  };

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.substring(0, 16);
    let formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Format expiry with slash
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      setExpiry(val.substring(0, 2) + "/" + val.substring(2));
    } else {
      setExpiry(val);
    }
  };

  const handleCvcChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 3) val = val.substring(0, 3);
    setCvc(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || cardNumber.replace(/\s/g, "").length < 16 || expiry.length < 5 || cvc.length < 3) {
      alert("Lütfen tüm alanları doğru şekilde doldurun.");
      return;
    }

    setIsProcessing(true);

    // Simulate network delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Callback to parent to update state
      onPaymentSuccess();
    }, 2200);
  };

  return (
    <div className="premium-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="premium-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
        
        {/* Success Screen */}
        {isSuccess ? (
          <div className="checkout-success-view" style={{ 
            textAlign: "center", 
            padding: "2rem 0", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: "1.25rem",
            animation: "modalFadeIn 0.3s ease"
          }}>
            <div className="success-badge-circle" style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#d1fae5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 8px #ecfdf5"
            }}>
              <Check size={36} />
            </div>
            
            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-main)" }}>
              {t.paymentSuccess}
            </h3>
            
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              {t.paymentSuccessDetail}
            </p>

            <button
              type="button"
              className="premium-btn-primary"
              onClick={onClose}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              {t.close}
            </button>
          </div>
        ) : (
          /* Payment Form Screen */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Logo/Title Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ backgroundColor: "#6366f1", color: "white", padding: "0.35rem", borderRadius: "0.375rem" }}>
                  <CreditCard size={16} />
                </div>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                  Stripe Checkout
                </span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Lock size={12} style={{ color: "#10b981" }} /> Secure
              </span>
            </div>

            {/* Invoice Summary Card */}
            <div className="checkout-summary-card" style={{ 
              backgroundColor: "var(--bg-input)", 
              padding: "1rem", 
              borderRadius: "0.5rem", 
              border: "1px solid var(--border-color)", 
              textAlign: "center"
            }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBlockEnd: "0.25rem" }}>
                {fromName || "Company Name"}
              </p>
              <h4 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-main)" }}>
                {formatCurrency(total)}
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBlockStart: "0.25rem" }}>
                {t.invoice} #{invoiceNumber}
              </p>
            </div>

            {/* Test card banner */}
            <div style={{ 
              backgroundColor: "rgba(99, 102, 241, 0.08)", 
              border: "1px dashed rgba(99, 102, 241, 0.4)", 
              padding: "0.75rem", 
              borderRadius: "0.375rem",
              fontSize: "0.80rem",
              color: "var(--text-muted)",
              lineHeight: 1.4
            }}>
              💡 <strong>Test Modu:</strong> Ödemeyi simüle etmek için kart numarası olarak <strong>4242 4242 4242 4242</strong> girin (AA/YY ve CVC rastgele olabilir).
            </div>

            {/* Cardholder Name */}
            <div className="form-group">
              <label htmlFor="card-name">Kart Sahibi Adı</label>
              <input
                id="card-name"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Semih Software"
                required
                disabled={isProcessing}
                autoComplete="cc-name"
              />
            </div>

            {/* Card Number */}
            <div className="form-group">
              <label htmlFor="card-number">{t.cardNumber}</label>
              <input
                id="card-number"
                type="text"
                className="form-control"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
                required
                disabled={isProcessing}
                autoComplete="cc-number"
              />
            </div>

            {/* Expiry & CVC Grid */}
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="card-expiry">{t.expiryDate}</label>
                <input
                  id="card-expiry"
                  type="text"
                  className="form-control"
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="12/30"
                  required
                  disabled={isProcessing}
                  autoComplete="cc-exp"
                />
              </div>
              <div className="form-group">
                <label htmlFor="card-cvc">{t.cvc}</label>
                <input
                  id="card-cvc"
                  type="password"
                  className="form-control"
                  value={cvc}
                  onChange={handleCvcChange}
                  placeholder="123"
                  required
                  disabled={isProcessing}
                  autoComplete="cc-csc"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                className="premium-btn-primary"
                disabled={isProcessing}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="spinner-icon" style={{ animation: "spin 1s linear infinite" }} />
                    {t.processingPayment}
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    {t.payAmount} ({formatCurrency(total)})
                  </>
                )}
              </button>
              
              <button
                type="button"
                className="premium-btn-secondary"
                onClick={onClose}
                disabled={isProcessing}
              >
                {t.close}
              </button>
            </div>
            
          </form>
        )}

      </div>
    </div>
  );
}
