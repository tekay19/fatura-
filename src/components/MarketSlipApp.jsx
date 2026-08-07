import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Printer, Save, Plus, Trash2, Store, ReceiptText, Globe2, Barcode, Image, Sparkles } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import PaperTexture from "./templates/PaperTexture";
import ReceiptBarcode from "./ReceiptBarcode";

const COUNTRIES = {
  TR: { name: "Türkiye", locale: "tr-TR", currency: "TRY", tax: "KDV" },
  US: { name: "Amerika Birleşik Devletleri", locale: "en-US", currency: "USD", tax: "Sales Tax" },
  GB: { name: "Birleşik Krallık", locale: "en-GB", currency: "GBP", tax: "VAT" },
  DE: { name: "Almanya", locale: "de-DE", currency: "EUR", tax: "MwSt" },
  AT: { name: "Avusturya", locale: "de-AT", currency: "EUR", tax: "USt" },
  FR: { name: "Fransa", locale: "fr-FR", currency: "EUR", tax: "TVA" },
  IT: { name: "İtalya", locale: "it-IT", currency: "EUR", tax: "IVA" },
  ES: { name: "İspanya", locale: "es-ES", currency: "EUR", tax: "IVA" },
  PT: { name: "Portekiz", locale: "pt-PT", currency: "EUR", tax: "IVA" },
  NL: { name: "Hollanda", locale: "nl-NL", currency: "EUR", tax: "BTW" },
  BE: { name: "Belçika", locale: "nl-BE", currency: "EUR", tax: "BTW" },
  DK: { name: "Danimarka", locale: "da-DK", currency: "DKK", tax: "MOMS" },
  SE: { name: "İsveç", locale: "sv-SE", currency: "SEK", tax: "MOMS" }
};

const SLIP_COPY = {
  tr: { locale: "tr-TR", receiptNo: "Fiş no", date: "Tarih", cashier: "Kasa", item: "Ürün", qty: "Adet", amount: "Tutar", subtotal: "Ara toplam", discount: "İndirim", total: "Toplam", payment: "Ödeme", thankYou: "Bizi tercih ettiğiniz için teşekkür ederiz.", thankYouShopping: "Alışverişiniz için teşekkür ederiz" },
  en: { locale: "en-US", receiptNo: "Receipt no", date: "Date", cashier: "Register", item: "Item", qty: "Qty", amount: "Amount", subtotal: "Subtotal", discount: "Discount", total: "Total", payment: "Payment", thankYou: "Thank you for choosing us.", thankYouShopping: "Thank you for shopping" },
  de: { locale: "de-DE", receiptNo: "Belegnr.", date: "Datum", cashier: "Kasse", item: "Artikel", qty: "Menge", amount: "Betrag", subtotal: "Zwischensumme", discount: "Rabatt", total: "Gesamt", payment: "Zahlung", thankYou: "Vielen Dank für Ihren Einkauf.", thankYouShopping: "Vielen Dank für Ihren Einkauf" },
  fr: { locale: "fr-FR", receiptNo: "N° ticket", date: "Date", cashier: "Caisse", item: "Article", qty: "Qté", amount: "Montant", subtotal: "Sous-total", discount: "Remise", total: "Total", payment: "Paiement", thankYou: "Merci de votre confiance.", thankYouShopping: "Merci pour votre achat" },
  it: { locale: "it-IT", receiptNo: "N. ricevuta", date: "Data", cashier: "Cassa", item: "Articolo", qty: "Qtà", amount: "Importo", subtotal: "Subtotale", discount: "Sconto", total: "Totale", payment: "Pagamento", thankYou: "Grazie per averci scelto.", thankYouShopping: "Grazie per il tuo acquisto" },
  es: { locale: "es-ES", receiptNo: "N.º recibo", date: "Fecha", cashier: "Caja", item: "Artículo", qty: "Cant.", amount: "Importe", subtotal: "Subtotal", discount: "Descuento", total: "Total", payment: "Pago", thankYou: "Gracias por elegirnos.", thankYouShopping: "Gracias por su compra" },
  pt: { locale: "pt-PT", receiptNo: "N.º recibo", date: "Data", cashier: "Caixa", item: "Artigo", qty: "Qtd.", amount: "Montante", subtotal: "Subtotal", discount: "Desconto", total: "Total", payment: "Pagamento", thankYou: "Obrigado pela sua preferência.", thankYouShopping: "Obrigado pela sua compra" },
  nl: { locale: "nl-NL", receiptNo: "Bonnummer", date: "Datum", cashier: "Kassa", item: "Artikel", qty: "Aantal", amount: "Bedrag", subtotal: "Subtotaal", discount: "Korting", total: "Totaal", payment: "Betaling", thankYou: "Bedankt dat u voor ons koos.", thankYouShopping: "Bedankt voor uw aankoop" },
  da: { locale: "da-DK", receiptNo: "Kvitteringsnr.", date: "Dato", cashier: "Kasse", item: "Vare", qty: "Antal", amount: "Beløb", subtotal: "Subtotal", discount: "Rabat", total: "I alt", payment: "Betaling", thankYou: "Tak fordi du valgte os.", thankYouShopping: "Tak for dit køb" },
  sv: { locale: "sv-SE", receiptNo: "Kvittonr.", date: "Datum", cashier: "Kassa", item: "Artikel", qty: "Antal", amount: "Belopp", subtotal: "Delsumma", discount: "Rabatt", total: "Totalt", payment: "Betalning", thankYou: "Tack för att du valde oss.", thankYouShopping: "Tack för ditt köp" }
};

const SLIP_LANGUAGES = [
  ["tr", "Türkçe"], ["en", "English"], ["de", "Deutsch"], ["fr", "Français"],
  ["it", "Italiano"], ["es", "Español"], ["pt", "Português"], ["nl", "Nederlands"],
  ["da", "Dansk"], ["sv", "Svenska"]
];

const DEFAULT_SLIP = {
  template: "classic",
  language: "tr",
  country: "TR",
  storeName: "Atlas Market",
  storeAddress: "Bağdat Caddesi No: 128, İstanbul",
  phone: "+90 212 555 24 80",
  taxNumber: "Vergi No: 324 089 2018",
  receiptNumber: "004281",
  cashier: "KASA 03",
  date: new Date().toISOString().split("T")[0],
  time: "16:12",
  paymentMethod: "Kredi Kartı",
  barcode: "8693240892018",
  footer: "",
  logo: null,
  taxRate: 20,
  discount: 0,
  paperTexture: true,
  paperStrength: "soft",
  paperEffectVersion: 2,
  languageVersion: 1,
  items: [
    { description: "Filtre kahve 250 g", quantity: 1, rate: 189.9 },
    { description: "Organik süt 1 L", quantity: 2, rate: 54.5 },
    { description: "Bez alışveriş çantası", quantity: 1, rate: 29.9 }
  ]
};

const readSavedSlip = () => {
  try {
    const savedDraft = localStorage.getItem("market_slip_draft");
    if (!savedDraft) return DEFAULT_SLIP;

    const saved = JSON.parse(savedDraft);
    return {
      ...DEFAULT_SLIP,
      ...saved,
      footer: saved.languageVersion === 1 ? saved.footer : "",
      paperStrength: saved.paperEffectVersion === 2 ? saved.paperStrength : "soft",
      paperEffectVersion: 2,
      languageVersion: 1
    };
  } catch {
    return DEFAULT_SLIP;
  }
};

function ReceiptPreview({ data }) {
  const country = COUNTRIES[data.country] || COUNTRIES.TR;
  const copy = SLIP_COPY[data.language] || SLIP_COPY.tr;
  const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  const discount = Number(data.discount) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * ((Number(data.taxRate) || 0) / 100);
  const total = taxable + tax;
  const money = (value) => new Intl.NumberFormat(country.locale, { style: "currency", currency: country.currency }).format(value || 0);
  const formattedDate = (() => {
    const parsedDate = new Date(`${data.date}T12:00:00`);
    return Number.isNaN(parsedDate.getTime()) ? data.date : new Intl.DateTimeFormat(copy.locale).format(parsedDate);
  })();
  const countryName = (() => {
    try {
      return new Intl.DisplayNames([copy.locale], { type: "region" }).of(data.country);
    } catch {
      return country.name;
    }
  })();

  return (
    <article
      id="receipt-capture-area"
      className={`receipt-sheet receipt-template-${data.template}${data.paperTexture ? ` paper-crumpled slip-crumple-${data.paperStrength}` : ""}`}
    >
      {data.paperTexture && <PaperTexture />}
      <div className="receipt-content">
        <header className="receipt-header">
          {data.logo ? <img src={data.logo} alt={`${data.storeName} logosu`} /> : <div className="receipt-store-symbol"><Store size={22} /></div>}
          <h1>{data.storeName || "Market"}</h1>
          <p>{data.storeAddress}</p>
          <p>{data.phone}</p>
          <p>{data.taxNumber}</p>
        </header>

        <div className="receipt-rule" />
        <dl className="receipt-meta">
          <div><dt>{copy.receiptNo}</dt><dd>{data.receiptNumber}</dd></div>
          <div><dt>{copy.date}</dt><dd>{formattedDate} · {data.time}</dd></div>
          <div><dt>{copy.cashier}</dt><dd>{data.cashier}</dd></div>
        </dl>
        <div className="receipt-rule receipt-rule-dashed" />

        <table className="receipt-items">
          <thead><tr><th>{copy.item}</th><th>{copy.qty}</th><th>{copy.amount}</th></tr></thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={`${item.description}-${index}`}>
                <td>{item.description || "Ürün"}<small>{money(Number(item.rate) || 0)}</small></td>
                <td>{Number(item.quantity) || 0}</td>
                <td>{money((Number(item.quantity) || 0) * (Number(item.rate) || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-rule receipt-rule-dashed" />
        <div className="receipt-totals">
          <div><span>{copy.subtotal}</span><strong>{money(subtotal)}</strong></div>
          {discount > 0 && <div><span>{copy.discount}</span><strong>-{money(discount)}</strong></div>}
          <div><span>{country.tax} %{data.taxRate || 0}</span><strong>{money(tax)}</strong></div>
          <div className="receipt-grand-total"><span>{copy.total}</span><strong>{money(total)}</strong></div>
          <div><span>{copy.payment}</span><strong>{data.paymentMethod}</strong></div>
        </div>

        <div className="receipt-rule" />
        <ReceiptBarcode value={data.barcode} />
        <footer className="receipt-footer">
          <strong>{data.template === "sporting" ? copy.thankYouShopping : (data.footer || copy.thankYou)}</strong>
          <span>{countryName} · {data.receiptNumber}</span>
        </footer>
      </div>
    </article>
  );
}

export default function MarketSlipApp({ onBack }) {
  const [data, setData] = useState(readSavedSlip);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveState, setSaveState] = useState("");
  const fileInputRef = useRef(null);

  const update = (field, value) => setData((previous) => ({ ...previous, [field]: value }));
  const updateItem = (index, field, value) => setData((previous) => ({
    ...previous,
    items: previous.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
  }));
  const totals = useMemo(() => {
    const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
    const taxable = Math.max(0, subtotal - (Number(data.discount) || 0));
    return taxable + taxable * ((Number(data.taxRate) || 0) / 100);
  }, [data.items, data.discount, data.taxRate]);

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("logo", reader.result);
    reader.readAsDataURL(file);
  };

  const saveSlip = () => {
    localStorage.setItem("market_slip_draft", JSON.stringify(data));
    setSaveState("Slip kaydedildi");
    window.setTimeout(() => setSaveState(""), 2200);
  };

  const printSlip = () => window.print();

  const downloadSlip = async () => {
    const element = document.getElementById("receipt-capture-area");
    if (!element) return;
    setIsGenerating(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const heightMm = Math.max(120, (canvas.height / canvas.width) * 80);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, heightMm], compress: true });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.97), "JPEG", 0, 0, 80, heightMm, undefined, "FAST");
      pdf.setProperties({ title: `${data.storeName} ${data.receiptNumber}`, creator: "Invoice Studio" });
      pdf.save(`Slip_${data.receiptNumber || "0001"}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="slip-app">
      <header className="app-header slip-app-header">
        <div className="brand-section">
          <button type="button" className="workspace-back-btn" onClick={onBack}><ArrowLeft size={17} /> Menü</button>
          <ReceiptText className="brand-icon" size={27} />
          <h1 className="brand-title">Market Slip</h1>
        </div>
        <div className="slip-header-controls">
          <label className="slip-language-control">
            <span>Slip Dili:</span>
            <select value={data.language || "tr"} onChange={(event) => update("language", event.target.value)}>
              {SLIP_LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <div className="slip-actions">
            <button type="button" onClick={downloadSlip} disabled={isGenerating}><Download size={17} /> {isGenerating ? "Hazırlanıyor" : "PDF"}</button>
            <button type="button" onClick={printSlip}><Printer size={17} /> Yazdır</button>
            <button type="button" onClick={saveSlip}><Save size={17} /> Kaydet</button>
          </div>
        </div>
      </header>

      <main className="slip-workspace">
      <aside className="slip-editor">
        <div className="editor-tabs slip-editor-tabs">
          <div className="editor-tab-btn active"><ReceiptText size={16} /> Slip Düzenle</div>
        </div>
        {saveState && <div className="slip-save-state" role="status">{saveState}</div>}

        <div className="slip-editor-scroll">
          <section className="slip-panel slip-template-panel">
            <div className="slip-panel-title"><ReceiptText size={17} /><strong>Şablon</strong></div>
            <div className="slip-template-options">
              <button type="button" className={data.template === "classic" ? "active" : ""} onClick={() => update("template", "classic")}>Klasik market</button>
              <button type="button" className={data.template === "sporting" ? "active" : ""} onClick={() => update("template", "sporting")}>Sporting</button>
            </div>
          </section>

          <details className="slip-panel" open>
            <summary><Store size={17} /> Mağaza bilgileri</summary>
            <div className="slip-panel-content">
              <label>Mağaza adı<input value={data.storeName} onChange={(e) => update("storeName", e.target.value)} /></label>
              <label>Adres<textarea value={data.storeAddress} onChange={(e) => update("storeAddress", e.target.value)} /></label>
              <div className="slip-field-row">
                <label>Telefon<input value={data.phone} onChange={(e) => update("phone", e.target.value)} /></label>
                <label>Vergi bilgisi<input value={data.taxNumber} onChange={(e) => update("taxNumber", e.target.value)} /></label>
              </div>
              <button type="button" className="slip-upload" onClick={() => fileInputRef.current?.click()}><Image size={16} /> Logo yükle</button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogo} />
            </div>
          </details>

          <details className="slip-panel" open>
            <summary><Globe2 size={17} /> Ülke ve fiş bilgileri</summary>
            <div className="slip-panel-content">
              <label>Ülke<select value={data.country} onChange={(e) => update("country", e.target.value)}>{Object.entries(COUNTRIES).map(([code, country]) => <option key={code} value={code}>{country.name}</option>)}</select></label>
              <div className="slip-field-row">
                <label>Fiş no<input value={data.receiptNumber} onChange={(e) => update("receiptNumber", e.target.value)} /></label>
                <label>Kasa<input value={data.cashier} onChange={(e) => update("cashier", e.target.value)} /></label>
              </div>
              <div className="slip-field-row">
                <label>Tarih<input type="date" value={data.date} onChange={(e) => update("date", e.target.value)} /></label>
                <label>Saat<input type="time" value={data.time} onChange={(e) => update("time", e.target.value)} /></label>
              </div>
            </div>
          </details>

          <details className="slip-panel" open>
            <summary><ReceiptText size={17} /> Ürünler</summary>
            <div className="slip-panel-content slip-items-editor">
              {data.items.map((item, index) => (
                <div className="slip-item-row" key={index}>
                  <input aria-label={`${index + 1}. ürün`} value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} />
                  <input aria-label={`${index + 1}. ürün adedi`} type="number" min="0" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} />
                  <input aria-label={`${index + 1}. ürün fiyatı`} type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} />
                  <button type="button" aria-label="Ürünü sil" onClick={() => setData((previous) => ({ ...previous, items: previous.items.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={15} /></button>
                </div>
              ))}
              <button type="button" className="slip-add-item" onClick={() => setData((previous) => ({ ...previous, items: [...previous.items, { description: "", quantity: 1, rate: 0 }] }))}><Plus size={15} /> Ürün ekle</button>
            </div>
          </details>

          <details className="slip-panel" open>
            <summary><Barcode size={17} /> Toplam ve barkod</summary>
            <div className="slip-panel-content">
              <div className="slip-field-row">
                <label>Vergi %<input type="number" min="0" value={data.taxRate} onChange={(e) => update("taxRate", e.target.value)} /></label>
                <label>İndirim<input type="number" min="0" step="0.01" value={data.discount} onChange={(e) => update("discount", e.target.value)} /></label>
              </div>
              <label>Ödeme yöntemi<input value={data.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)} /></label>
              <label>Barkod<input inputMode="numeric" value={data.barcode} onChange={(e) => update("barcode", e.target.value.replace(/\D/g, "").slice(0, 18))} /></label>
              <div className="slip-live-total"><span>Canlı toplam</span><strong>{new Intl.NumberFormat(COUNTRIES[data.country].locale, { style: "currency", currency: COUNTRIES[data.country].currency }).format(totals)}</strong></div>
            </div>
          </details>

          <details className="slip-panel slip-paper-panel" open>
            <summary><Sparkles size={17} /> Kâğıt dokusu</summary>
            <div className="slip-panel-content">
              <label className="slip-check"><input type="checkbox" checked={data.paperTexture} onChange={(e) => update("paperTexture", e.target.checked)} /> Doğal kâğıt efektini uygula</label>
              <label>Efekt yoğunluğu<select value={data.paperStrength} onChange={(e) => update("paperStrength", e.target.value)} disabled={!data.paperTexture}><option value="soft">Hafif</option><option value="natural">Doğal</option><option value="strong">Belirgin</option></select></label>
              <p>Bu ayar yalnızca bu slip çıktısına uygulanır.</p>
            </div>
          </details>
        </div>
      </aside>

      <section className="slip-preview-stage">
        <div className="slip-preview-label"><span>Canlı önizleme</span><strong>80 mm termal slip</strong></div>
        <ReceiptPreview data={data} />
      </section>
      </main>
    </div>
  );
}
