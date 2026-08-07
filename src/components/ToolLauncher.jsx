import { FileText, ReceiptText, Barcode, Palette, Globe2, ArrowRight } from "lucide-react";

export default function ToolLauncher({ onSelect }) {
  return (
    <main className="tool-launcher">
      <div className="launcher-grain" aria-hidden="true" />
      <section className="launcher-shell" aria-labelledby="launcher-title">
        <div className="launcher-brand">
          <span className="launcher-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="presentation">
              <path className="launcher-logo-sheet" d="M11 7.5h18l8 8V39a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V7.5Z" />
              <path className="launcher-logo-fold" d="M29 7.5v8h8" />
              <path className="launcher-logo-line" d="M17 20h12M17 25h14" />
              <path className="launcher-logo-receipt" d="M17 30h14v10l-2.3-1.6-2.35 1.6L24 38.4 21.65 40l-2.35-1.6L17 40V30Z" />
            </svg>
          </span>
          <div>
            <strong>Invoice Studio</strong>
            <span>Fatura ve slip araçları</span>
          </div>
        </div>

        <div className="launcher-heading">
          <h1 id="launcher-title">Hangi belgeyi hazırlayacaksınız?</h1>
        </div>

        <div className="launcher-tools">
          <button type="button" className="launcher-tool launcher-tool-invoice" onClick={() => onSelect("invoice")}>
            <span className="launcher-tool-icon"><FileText size={27} /></span>
            <span className="launcher-tool-copy">
              <strong>Fatura oluşturucu</strong>
              <small>A4 PDF, altı görünüm, logo, ASIN aracı, kargo ve ödeme detayları</small>
            </span>
            <span className="launcher-tags" aria-label="Özellikler">
              <span><Palette size={13} /> 6 görünüm</span>
              <span><Globe2 size={13} /> 7 dil</span>
            </span>
            <ArrowRight className="launcher-arrow" size={22} aria-hidden="true" />
          </button>

          <button type="button" className="launcher-tool launcher-tool-slip" onClick={() => onSelect("slip")}>
            <span className="launcher-tool-icon"><ReceiptText size={27} /></span>
            <span className="launcher-tool-copy">
              <strong>Market slip</strong>
              <small>Kasa fişi, ülkeye özel vergi, barkod ve doğal buruşuk kâğıt</small>
            </span>
            <span className="launcher-tags" aria-label="Özellikler">
              <span><Barcode size={13} /> Barkod</span>
              <span><Globe2 size={13} /> 13 ülke</span>
            </span>
            <ArrowRight className="launcher-arrow" size={22} aria-hidden="true" />
          </button>
        </div>

      </section>
    </main>
  );
}
