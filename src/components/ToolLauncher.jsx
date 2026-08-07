import { FileText, ReceiptText, Barcode, Palette, Globe2, ArrowRight } from "lucide-react";

export default function ToolLauncher({ onSelect }) {
  return (
    <main className="tool-launcher">
      <div className="launcher-grain" aria-hidden="true" />
      <section className="launcher-shell" aria-labelledby="launcher-title">
        <div className="launcher-brand">
          <span className="launcher-brand-mark">I</span>
          <div>
            <strong>Invoice Studio</strong>
            <span>Fatura ve slip araçları</span>
          </div>
        </div>

        <div className="launcher-heading">
          <span className="launcher-kicker">Çalışma alanı</span>
          <h1 id="launcher-title">Hangi belgeyi hazırlayacaksınız?</h1>
          <p>Kurumsal faturaları ve market sliplerini ayrı araçlarda, aynı PDF kalitesiyle oluşturun.</p>
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

        <footer className="launcher-footer">Yerel çalışır · Veriler tarayıcınızda kalır</footer>
      </section>
    </main>
  );
}
