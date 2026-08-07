import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Printer, Save, Plus, Trash2, Store, ReceiptText, Globe2, Barcode, Image, Sparkles, RefreshCw, Search, Type, CreditCard } from "lucide-react";
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

const AMAZON_MARKETS = {
  US: { label: "USA", domain: "amazon.com" },
  GB: { label: "United Kingdom", domain: "amazon.co.uk" },
  DE: { label: "Deutschland", domain: "amazon.de" },
  FR: { label: "France", domain: "amazon.fr" },
  IT: { label: "Italia", domain: "amazon.it" },
  ES: { label: "España", domain: "amazon.es" },
  TR: { label: "Türkiye", domain: "amazon.com.tr" }
};

const RECEIPT_DETAIL_COPY = {
  tr: { store: "Mağaza", customerCopy: "Müşteri nüshası", register: "Kasa", order: "Sipariş", items: "Ürün sayısı", transaction: "İşlem", authCode: "Onay kodu", status: "Durum", changeDue: "Para üstü" },
  en: { store: "Store", customerCopy: "Customer copy", register: "Reg", order: "Order", items: "Items", transaction: "Transaction", authCode: "Auth code", status: "Status", changeDue: "Change due" }
};

const randomDigits = (length) => {
  const bytes = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
  }
  return Array.from(bytes, (byte) => String(byte % 10)).join("");
};

const ean13CheckDigit = (firstTwelve) => {
  const sum = firstTwelve.split("").reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);
  return String((10 - (sum % 10)) % 10);
};

const generateEan13 = (countryCode = "TR") => {
  const prefix = countryCode === "TR" ? "869" : countryCode === "US" ? "0" : "2";
  const firstTwelve = `${prefix}${randomDigits(12 - prefix.length)}`;
  return `${firstTwelve}${ean13CheckDigit(firstTwelve)}`;
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

const SLIP_UI = {
  tr: {
    menu: "Menü", language: "Slip dili", preparing: "Hazırlanıyor", print: "Yazdır", save: "Kaydet", saved: "Slip kaydedildi",
    template: "Şablon", classicMarket: "Klasik market", storeInfo: "Mağaza bilgileri", storeName: "Mağaza adı", address: "Adres",
    phone: "Telefon", taxInfo: "Vergi bilgisi", uploadLogo: "Logo yükle", countryReceipt: "Ülke ve fiş bilgileri", country: "Ülke",
    receiptNo: "Fiş no", cashier: "Kasa", date: "Tarih", time: "Saat", products: "Ürünler", product: "ürün",
    productQty: "ürün adedi", productPrice: "ürün fiyatı", deleteProduct: "Ürünü sil", addProduct: "Ürün ekle",
    totalsBarcode: "Toplam ve barkod", tax: "Vergi %", discount: "İndirim", paymentMethod: "Ödeme yöntemi", barcode: "Barkod",
    liveTotal: "Canlı toplam", paperTexture: "Kâğıt dokusu", yellowing: "Sarartı", crumpling: "Buruşukluk",
    crumpleStrength: "Buruşukluk yoğunluğu", soft: "Hafif", natural: "Doğal", strong: "Belirgin",
    independentEffects: "İki efekti birbirinden bağımsız kullanabilirsin.", livePreview: "Canlı önizleme", thermalSlip: "80 mm termal slip",
    refresh: "Yenile", resetConfirm: "Slipteki tüm alanlar varsayılan değerlere dönsün mü?", resetDone: "Yeni slip numaraları ve barkod üretildi",
    font: "Yazı fontu", courier: "Courier (Klasik fiş)", arial: "Arial (Orijinal)", ocr: "OCR Terminal", dicks: "Dick's", walmart: "Walmart",
    asinLookup: "ASIN ile mağaza bul", apiKey: "Anthropic API anahtarı", apiKeyPlaceholder: "sk-ant-…", asin: "ASIN", search: "Ara",
    asinRequired: "Geçerli, 10 karakterli bir ASIN gir.", asinOpened: "Amazon ürün sayfası açıldı.", storeNumber: "Mağaza numarası",
    registerNumber: "Kasa numarası", orderNumber: "Sipariş numarası", customerCopy: "Nüsha başlığı", itemSku: "SKU / ürün kodu",
    paymentDetails: "Ödeme ve işlem bilgileri", cardNetwork: "Kart türü", cardLast4: "Kartın son 4 hanesi", transaction: "İşlem numarası",
    authCode: "Onay kodu", status: "Durum", changeDue: "Para üstü", generate: "Üret", footerDetails: "Alt bilgi", footerLine1: "Birinci satır",
    footerLine2: "İkinci satır", footerLine3: "Üçüncü satır", website: "Web sitesi"
  },
  en: {
    menu: "Menu", language: "Slip language", preparing: "Preparing", print: "Print", save: "Save", saved: "Slip saved",
    template: "Template", classicMarket: "Classic market", storeInfo: "Store information", storeName: "Store name", address: "Address",
    phone: "Phone", taxInfo: "Tax information", uploadLogo: "Upload logo", countryReceipt: "Country and receipt", country: "Country",
    receiptNo: "Receipt no", cashier: "Register", date: "Date", time: "Time", products: "Products", product: "product",
    productQty: "product quantity", productPrice: "product price", deleteProduct: "Delete product", addProduct: "Add product",
    totalsBarcode: "Totals and barcode", tax: "Tax %", discount: "Discount", paymentMethod: "Payment method", barcode: "Barcode",
    liveTotal: "Live total", paperTexture: "Paper texture", yellowing: "Yellowing", crumpling: "Crumpling",
    crumpleStrength: "Crumple intensity", soft: "Light", natural: "Natural", strong: "Pronounced",
    independentEffects: "Yellowing and crumpling can be used independently.", livePreview: "Live preview", thermalSlip: "80 mm thermal slip",
    refresh: "Refresh", resetConfirm: "Reset every slip field to its default value?", resetDone: "New slip identifiers and barcode generated",
    font: "Receipt font", courier: "Courier (Classic receipt)", arial: "Arial (Original)", ocr: "OCR Terminal", dicks: "Dick's", walmart: "Walmart",
    asinLookup: "Find store with ASIN", apiKey: "Anthropic API key", apiKeyPlaceholder: "sk-ant-…", asin: "ASIN", search: "Search",
    asinRequired: "Enter a valid 10-character ASIN.", asinOpened: "Amazon product page opened.", storeNumber: "Store number",
    registerNumber: "Register number", orderNumber: "Order number", customerCopy: "Copy heading", itemSku: "SKU / product code",
    paymentDetails: "Payment and transaction", cardNetwork: "Card network", cardLast4: "Last 4 digits", transaction: "Transaction number",
    authCode: "Authorization code", status: "Status", changeDue: "Change due", generate: "Generate", footerDetails: "Footer", footerLine1: "First line",
    footerLine2: "Second line", footerLine3: "Third line", website: "Website"
  }
};

const SAMPLE_CONTENT = {
  tr: {
    storeAddress: "Bağdat Caddesi No: 128, İstanbul",
    taxNumber: "Vergi No: 324 089 2018",
    cashier: "KASA 03",
    paymentMethod: "Kredi Kartı",
    paymentStatus: "ONAYLANDI ✓",
    footerSecondary: "TEKRAR BEKLERİZ",
    footerTertiary: "İYİ GÜNLER!",
    items: ["Filtre kahve 250 g", "Organik süt 1 L", "Bez alışveriş çantası"]
  },
  en: {
    storeAddress: "128 Bagdat Avenue, Istanbul",
    taxNumber: "Tax No: 324 089 2018",
    cashier: "REGISTER 03",
    paymentMethod: "Credit Card",
    paymentStatus: "APPROVED ✓",
    footerSecondary: "VISIT AGAIN SOON",
    footerTertiary: "HAVE A GREAT DAY!",
    items: ["Filter coffee 250 g", "Organic milk 1 L", "Reusable shopping bag"]
  }
};

const DEFAULT_SLIP = {
  template: "classic",
  fontStyle: "courier",
  language: "tr",
  country: "TR",
  storeName: "Atlas Market",
  storeAddress: "Bağdat Caddesi No: 128, İstanbul",
  phone: "+90 212 555 24 80",
  taxNumber: "Vergi No: 324 089 2018",
  storeNumber: "8331",
  customerCopy: "",
  receiptNumber: "004281",
  registerNumber: "REG-14",
  orderNumber: "600731",
  cashier: "KASA 03",
  date: new Date().toISOString().split("T")[0],
  time: "16:12",
  paymentMethod: "Kredi Kartı",
  cardNetwork: "VISA",
  cardLast4: "1550",
  transactionNumber: "926365429",
  authCode: "754110",
  paymentStatus: "ONAYLANDI ✓",
  changeDue: 0,
  barcode: "8693240892018",
  footer: "",
  footerSecondary: "TEKRAR BEKLERİZ",
  footerTertiary: "İYİ GÜNLER!",
  website: "https://example.com",
  logo: null,
  taxRate: 20,
  discount: 0,
  paperYellowing: true,
  paperCrumple: true,
  paperStrength: "soft",
  paperEffectVersion: 2,
  languageVersion: 1,
  items: [
    { sku: "8693240892", description: "Filtre kahve 250 g", quantity: 1, rate: 189.9 },
    { sku: "8693240893", description: "Organik süt 1 L", quantity: 2, rate: 54.5 },
    { sku: "8693240894", description: "Bez alışveriş çantası", quantity: 1, rate: 29.9 }
  ]
};

const readSavedSlip = () => {
  try {
    const savedDraft = localStorage.getItem("market_slip_draft");
    if (!savedDraft) return DEFAULT_SLIP;

    const saved = JSON.parse(savedDraft);
    const legacyPaperEffect = Boolean(saved.paperTexture);
    return {
      ...DEFAULT_SLIP,
      ...saved,
      footer: saved.languageVersion === 1 ? saved.footer : "",
      paperYellowing: saved.paperYellowing ?? legacyPaperEffect,
      paperCrumple: saved.paperCrumple ?? legacyPaperEffect,
      paperStrength: saved.paperEffectVersion === 2 ? saved.paperStrength : "soft",
      paperEffectVersion: 2,
      languageVersion: 1,
      paymentStatus: saved.paymentStatus ?? (saved.language === "tr" ? SAMPLE_CONTENT.tr.paymentStatus : SAMPLE_CONTENT.en.paymentStatus),
      footerSecondary: saved.footerSecondary ?? (saved.language === "tr" ? SAMPLE_CONTENT.tr.footerSecondary : SAMPLE_CONTENT.en.footerSecondary),
      footerTertiary: saved.footerTertiary ?? (saved.language === "tr" ? SAMPLE_CONTENT.tr.footerTertiary : SAMPLE_CONTENT.en.footerTertiary),
      items: Array.isArray(saved.items)
        ? saved.items.map((item, index) => ({ sku: DEFAULT_SLIP.items[index]?.sku || "", ...item }))
        : DEFAULT_SLIP.items
    };
  } catch {
    return DEFAULT_SLIP;
  }
};

function ReceiptPreview({ data }) {
  const country = COUNTRIES[data.country] || COUNTRIES.TR;
  const copy = SLIP_COPY[data.language] || SLIP_COPY.tr;
  const detailCopy = data.language === "tr" ? RECEIPT_DETAIL_COPY.tr : RECEIPT_DETAIL_COPY.en;
  const subtotal = data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  const itemCount = data.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const discount = Number(data.discount) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * ((Number(data.taxRate) || 0) / 100);
  const total = taxable + tax;
  const money = (value) => new Intl.NumberFormat(country.locale, { style: "currency", currency: country.currency }).format(value || 0);
  const formattedDate = (() => {
    const parsedDate = new Date(`${data.date}T12:00:00`);
    return Number.isNaN(parsedDate.getTime()) ? data.date : new Intl.DateTimeFormat(copy.locale).format(parsedDate);
  })();
  const yellowingEnabled = Boolean(data.paperYellowing ?? data.paperTexture);
  const crumpleEnabled = Boolean(data.paperCrumple ?? data.paperTexture);
  const marketplaceBrand = {
    trendyol: "trendyol",
    hepsiburada: "hepsiburada",
    shopify: "shopify",
    amazon: "amazon"
  }[data.template];
  const usesShoppingFooter = ["sporting", "walmart", "trendyol", "hepsiburada", "shopify", "amazon"].includes(data.template);

  return (
    <article
      id="receipt-capture-area"
      className={`receipt-sheet receipt-template-${data.template} receipt-font-${data.fontStyle || "courier"}${yellowingEnabled ? " paper-yellowed" : ""}${crumpleEnabled ? ` paper-crumpled slip-crumple-${data.paperStrength}` : ""}`}
    >
      {(yellowingEnabled || crumpleEnabled) && <PaperTexture yellowing={yellowingEnabled} crumpled={crumpleEnabled} />}
      <div className="receipt-content">
        <header className="receipt-header">
          {data.logo && <img src={data.logo} alt={`${data.storeName} logo`} />}
          {marketplaceBrand && <div className="receipt-marketplace-brand">{marketplaceBrand}</div>}
          <h1>{data.storeName || "Market"}</h1>
          <p>{data.storeAddress}</p>
          <p>{data.phone}</p>
          {data.storeNumber && <p>{detailCopy.store} #{data.storeNumber}</p>}
          <p>{data.date || formattedDate} · {data.time}</p>
          <strong className="receipt-copy-heading">{data.customerCopy || detailCopy.customerCopy}</strong>
        </header>

        <div className="receipt-rule" />
        <dl className="receipt-reference-meta">
          <div><dt>{copy.receiptNo}</dt><dd>{data.receiptNumber}</dd></div>
          <div><dt>{detailCopy.register}</dt><dd>{data.registerNumber}</dd></div>
          <div><dt>{detailCopy.order}</dt><dd>{data.orderNumber}</dd></div>
          <div><dt>{copy.cashier}</dt><dd>{data.cashier}</dd></div>
        </dl>
        <div className="receipt-rule" />

        <div className="receipt-product-list">
          {data.items.map((item, index) => {
            const quantity = Number(item.quantity) || 0;
            const rate = Number(item.rate) || 0;
            return (
              <article className="receipt-product" key={`${item.description}-${index}`}>
                <div className="receipt-product-code"><span>{item.sku || "—"}</span><strong>{money(rate)}</strong></div>
                <div className="receipt-product-name">{item.description || copy.item}</div>
                <div className="receipt-product-price"><span>{quantity} × {money(rate)}</span><strong>{money(quantity * rate)}</strong></div>
              </article>
            );
          })}
        </div>

        <div className="receipt-rule" />
        <div className="receipt-totals">
          <div><span>{detailCopy.items}</span><strong>{itemCount}</strong></div>
          <div><span>{copy.subtotal}</span><strong>{money(subtotal)}</strong></div>
          {discount > 0 && <div><span>{copy.discount}</span><strong>-{money(discount)}</strong></div>}
          <div><span>{country.tax} %{data.taxRate || 0}</span><strong>{money(tax)}</strong></div>
          <div className="receipt-grand-total"><span>{copy.total}</span><strong>{money(total)}</strong></div>
        </div>

        <div className="receipt-payment-details">
          <div><span>{copy.payment}:</span><strong>{data.paymentMethod}</strong></div>
          <div><span>{data.cardNetwork}</span><strong>{data.cardLast4 ? `•••••••• ${data.cardLast4}` : ""}</strong></div>
          <div><span>{detailCopy.transaction}:</span><strong>{data.transactionNumber}</strong></div>
          <div><span>{detailCopy.authCode}:</span><strong>{data.authCode}</strong></div>
          <div><span>{detailCopy.status}:</span><strong>{data.paymentStatus}</strong></div>
          <div><span>{detailCopy.changeDue}:</span><strong>{money(Number(data.changeDue) || 0)}</strong></div>
        </div>

        <ReceiptBarcode value={data.barcode} />
        <footer className="receipt-footer">
          <div className="receipt-footer-rule" />
          <strong>{usesShoppingFooter ? (data.footer || copy.thankYouShopping) : (data.footer || copy.thankYou)}</strong>
          {data.footerSecondary && <strong>{data.footerSecondary}</strong>}
          {data.footerTertiary && <strong>{data.footerTertiary}</strong>}
          {data.website && <span>{data.website}</span>}
        </footer>
      </div>
    </article>
  );
}

export default function MarketSlipApp({ onBack }) {
  const [data, setData] = useState(readSavedSlip);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveState, setSaveState] = useState("");
  const [asinApiKey, setAsinApiKey] = useState("");
  const [asinMarket, setAsinMarket] = useState("US");
  const [asinValue, setAsinValue] = useState("");
  const [asinState, setAsinState] = useState("");
  const fileInputRef = useRef(null);
  const ui = data.language === "tr" ? SLIP_UI.tr : SLIP_UI.en;
  const activeCopy = SLIP_COPY[data.language] || SLIP_COPY.en;

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

  const handleLanguageChange = (language) => {
    setData((previous) => {
      const nextSample = language === "tr" ? SAMPLE_CONTENT.tr : SAMPLE_CONTENT.en;
      const knownSamples = Object.values(SAMPLE_CONTENT);
      const isKnownValue = (field, value) => knownSamples.some((sample) => sample[field] === value);

      return {
        ...previous,
        language,
        storeAddress: isKnownValue("storeAddress", previous.storeAddress) ? nextSample.storeAddress : previous.storeAddress,
        taxNumber: isKnownValue("taxNumber", previous.taxNumber) ? nextSample.taxNumber : previous.taxNumber,
        cashier: isKnownValue("cashier", previous.cashier) ? nextSample.cashier : previous.cashier,
        paymentMethod: isKnownValue("paymentMethod", previous.paymentMethod) ? nextSample.paymentMethod : previous.paymentMethod,
        paymentStatus: isKnownValue("paymentStatus", previous.paymentStatus) ? nextSample.paymentStatus : previous.paymentStatus,
        footerSecondary: isKnownValue("footerSecondary", previous.footerSecondary) ? nextSample.footerSecondary : previous.footerSecondary,
        footerTertiary: isKnownValue("footerTertiary", previous.footerTertiary) ? nextSample.footerTertiary : previous.footerTertiary,
        items: previous.items.map((item, index) => {
          const descriptionIsSample = knownSamples.some((sample) => sample.items[index] === item.description);
          return descriptionIsSample && nextSample.items[index]
            ? { ...item, description: nextSample.items[index] }
            : item;
        })
      };
    });
  };

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("logo", reader.result);
    reader.readAsDataURL(file);
  };

  const saveSlip = () => {
    localStorage.setItem("market_slip_draft", JSON.stringify(data));
    setSaveState(ui.saved);
    window.setTimeout(() => setSaveState(""), 2200);
  };

  const refreshSlip = () => {
    const now = new Date();
    setData((previous) => ({
      ...previous,
      receiptNumber: randomDigits(6),
      orderNumber: randomDigits(6),
      transactionNumber: randomDigits(9),
      authCode: randomDigits(6),
      barcode: generateEan13(previous.country),
      items: previous.items.map((item) => ({ ...item, sku: randomDigits(10) })),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    }));
    setSaveState(ui.resetDone);
    window.setTimeout(() => setSaveState(""), 2200);
  };

  const searchAsin = () => {
    const asin = asinValue.trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      setAsinState(ui.asinRequired);
      return;
    }

    const market = AMAZON_MARKETS[asinMarket] || AMAZON_MARKETS.US;
    window.open(`https://www.${market.domain}/dp/${asin}`, "_blank", "noopener,noreferrer");
    setAsinValue(asin);
    setAsinState(ui.asinOpened);
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

  const countryLabel = (code, country) => {
    try {
      return new Intl.DisplayNames([activeCopy.locale], { type: "region" }).of(code);
    } catch {
      return country.name;
    }
  };

  return (
    <div className="slip-app">
      <header className="app-header slip-app-header">
        <div className="brand-section">
          <button type="button" className="workspace-back-btn" onClick={onBack}><ArrowLeft size={17} /> {ui.menu}</button>
          <ReceiptText className="brand-icon" size={27} />
          <h1 className="brand-title">Market Slip</h1>
        </div>
        <div className="slip-header-controls">
          <label className="slip-language-control">
            <span>{ui.language}:</span>
            <select value={data.language || "tr"} onChange={(event) => handleLanguageChange(event.target.value)}>
              {SLIP_LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <div className="slip-actions">
            <button type="button" onClick={downloadSlip} disabled={isGenerating}><Download size={17} /> {isGenerating ? ui.preparing : "PDF"}</button>
            <button type="button" onClick={printSlip}><Printer size={17} /> {ui.print}</button>
            <button type="button" className="slip-save-action" onClick={saveSlip}><Save size={17} /> {ui.save}</button>
            <button type="button" className="slip-refresh-action" onClick={refreshSlip}><RefreshCw size={17} /> {ui.refresh}</button>
          </div>
        </div>
      </header>

      <main className="slip-workspace">
      <aside className="slip-editor">
        {saveState && <div className="slip-save-state" role="status">{saveState}</div>}

        <div className="slip-editor-scroll">
          <section className="slip-panel slip-template-panel">
            <div className="slip-panel-title"><ReceiptText size={17} /><strong>{ui.template}</strong></div>
            <div className="slip-template-options">
              <button type="button" className={data.template === "classic" ? "active" : ""} onClick={() => update("template", "classic")}>{ui.classicMarket}</button>
              <button type="button" className={data.template === "sporting" ? "active" : ""} onClick={() => update("template", "sporting")}>{ui.dicks}</button>
              <button type="button" className={data.template === "walmart" ? "active" : ""} onClick={() => update("template", "walmart")}>{ui.walmart}</button>
              <button type="button" className={data.template === "trendyol" ? "active" : ""} onClick={() => update("template", "trendyol")}>Trendyol</button>
              <button type="button" className={data.template === "hepsiburada" ? "active" : ""} onClick={() => update("template", "hepsiburada")}>Hepsiburada</button>
              <button type="button" className={data.template === "shopify" ? "active" : ""} onClick={() => update("template", "shopify")}>Shopify</button>
              <button type="button" className={data.template === "amazon" ? "active" : ""} onClick={() => update("template", "amazon")}>Amazon</button>
            </div>
          </section>

          <section className="slip-panel slip-template-panel">
            <div className="slip-panel-title"><Type size={17} /><strong>{ui.font}</strong></div>
            <div className="slip-template-options slip-font-options">
              <button type="button" className={data.fontStyle === "courier" ? "active" : ""} onClick={() => update("fontStyle", "courier")}>{ui.courier}</button>
              <button type="button" className={data.fontStyle === "arial" ? "active" : ""} onClick={() => update("fontStyle", "arial")}>{ui.arial}</button>
              <button type="button" className={data.fontStyle === "ocr" ? "active" : ""} onClick={() => update("fontStyle", "ocr")}>{ui.ocr}</button>
            </div>
          </section>

          <details className="slip-panel" open>
            <summary><Search size={17} /> {ui.asinLookup}</summary>
            <div className="slip-panel-content">
              <label>{ui.apiKey}<input type="password" autoComplete="off" value={asinApiKey} placeholder={ui.apiKeyPlaceholder} onChange={(event) => setAsinApiKey(event.target.value)} /></label>
              <label>{ui.country}<select value={asinMarket} onChange={(event) => setAsinMarket(event.target.value)}>{Object.entries(AMAZON_MARKETS).map(([code, market]) => <option key={code} value={code}>{market.label}</option>)}</select></label>
              <div className="slip-asin-row">
                <label>{ui.asin}<input value={asinValue} maxLength={10} placeholder="B08N5WRWNW" onChange={(event) => setAsinValue(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} onKeyDown={(event) => event.key === "Enter" && searchAsin()} /></label>
                <button type="button" onClick={searchAsin}><Search size={15} /> {ui.search}</button>
              </div>
              {asinState && <p className="slip-tool-state" role="status">{asinState}</p>}
            </div>
          </details>

          <details className="slip-panel" open>
            <summary><Store size={17} /> {ui.storeInfo}</summary>
            <div className="slip-panel-content">
              <label>{ui.storeName}<input value={data.storeName} onChange={(e) => update("storeName", e.target.value)} /></label>
              <label>{ui.address}<textarea value={data.storeAddress} onChange={(e) => update("storeAddress", e.target.value)} /></label>
              <div className="slip-field-row">
                <label>{ui.phone}<input value={data.phone} onChange={(e) => update("phone", e.target.value)} /></label>
                <label>{ui.taxInfo}<input value={data.taxNumber} onChange={(e) => update("taxNumber", e.target.value)} /></label>
              </div>
              <label>{ui.storeNumber}<input value={data.storeNumber} onChange={(e) => update("storeNumber", e.target.value)} /></label>
              <button type="button" className="slip-upload" onClick={() => fileInputRef.current?.click()}><Image size={16} /> {ui.uploadLogo}</button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogo} />
            </div>
          </details>

          <details className="slip-panel" open>
            <summary><Globe2 size={17} /> {ui.countryReceipt}</summary>
            <div className="slip-panel-content">
              <label>{ui.country}<select value={data.country} onChange={(e) => update("country", e.target.value)}>{Object.entries(COUNTRIES).map(([code, country]) => <option key={code} value={code}>{countryLabel(code, country)}</option>)}</select></label>
              <div className="slip-field-row">
                <label>{ui.receiptNo}<input value={data.receiptNumber} onChange={(e) => update("receiptNumber", e.target.value)} /></label>
                <label>{ui.registerNumber}<input value={data.registerNumber} onChange={(e) => update("registerNumber", e.target.value)} /></label>
              </div>
              <div className="slip-field-row">
                <label>{ui.orderNumber}<input value={data.orderNumber} onChange={(e) => update("orderNumber", e.target.value)} /></label>
                <label>{ui.cashier}<input value={data.cashier} onChange={(e) => update("cashier", e.target.value)} /></label>
              </div>
              <div className="slip-field-row">
                <label>{ui.date}<input type="date" value={data.date} onChange={(e) => update("date", e.target.value)} /></label>
                <label>{ui.time}<input type="time" value={data.time} onChange={(e) => update("time", e.target.value)} /></label>
              </div>
              <label>{ui.customerCopy}<input value={data.customerCopy} placeholder={data.language === "tr" ? RECEIPT_DETAIL_COPY.tr.customerCopy : RECEIPT_DETAIL_COPY.en.customerCopy} onChange={(e) => update("customerCopy", e.target.value)} /></label>
            </div>
          </details>

          <details className="slip-panel" open>
            <summary><ReceiptText size={17} /> {ui.products}</summary>
            <div className="slip-panel-content slip-items-editor">
              {data.items.map((item, index) => (
                <div className="slip-item-row" key={index}>
                  <div className="slip-item-main">
                    <input aria-label={`${index + 1}. ${ui.itemSku}`} value={item.sku || ""} placeholder={ui.itemSku} onChange={(e) => updateItem(index, "sku", e.target.value)} />
                    <input aria-label={`${index + 1}. ${ui.product}`} value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} />
                  </div>
                  <input aria-label={`${index + 1}. ${ui.productQty}`} type="number" min="0" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} />
                  <input aria-label={`${index + 1}. ${ui.productPrice}`} type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} />
                  <button type="button" aria-label={ui.deleteProduct} onClick={() => setData((previous) => ({ ...previous, items: previous.items.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 size={15} /></button>
                </div>
              ))}
              <button type="button" className="slip-add-item" onClick={() => setData((previous) => ({ ...previous, items: [...previous.items, { sku: "", description: "", quantity: 1, rate: 0 }] }))}><Plus size={15} /> {ui.addProduct}</button>
            </div>
          </details>

          <details className="slip-panel" open>
            <summary><Barcode size={17} /> {ui.totalsBarcode}</summary>
            <div className="slip-panel-content">
              <div className="slip-field-row">
                <label>{ui.tax}<input type="number" min="0" value={data.taxRate} onChange={(e) => update("taxRate", e.target.value)} /></label>
                <label>{ui.discount}<input type="number" min="0" step="0.01" value={data.discount} onChange={(e) => update("discount", e.target.value)} /></label>
              </div>
              <div className="slip-input-action">
                <label>{ui.barcode}<input inputMode="numeric" value={data.barcode} onChange={(e) => update("barcode", e.target.value.replace(/\D/g, "").slice(0, 13))} /></label>
                <button type="button" onClick={() => update("barcode", generateEan13(data.country))}><RefreshCw size={14} /> {ui.generate}</button>
              </div>
              <div className="slip-live-total"><span>{ui.liveTotal}</span><strong>{new Intl.NumberFormat(COUNTRIES[data.country].locale, { style: "currency", currency: COUNTRIES[data.country].currency }).format(totals)}</strong></div>
            </div>
          </details>

          <details className="slip-panel" open>
            <summary><CreditCard size={17} /> {ui.paymentDetails}</summary>
            <div className="slip-panel-content">
              <label>{ui.paymentMethod}<input value={data.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)} /></label>
              <div className="slip-field-row">
                <label>{ui.cardNetwork}<input value={data.cardNetwork} onChange={(e) => update("cardNetwork", e.target.value)} /></label>
                <label>{ui.cardLast4}<input inputMode="numeric" maxLength={4} value={data.cardLast4} onChange={(e) => update("cardLast4", e.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
              </div>
              <div className="slip-field-row">
                <label>{ui.transaction}<input value={data.transactionNumber} onChange={(e) => update("transactionNumber", e.target.value)} /></label>
                <label>{ui.authCode}<input value={data.authCode} onChange={(e) => update("authCode", e.target.value)} /></label>
              </div>
              <div className="slip-field-row">
                <label>{ui.status}<input value={data.paymentStatus} onChange={(e) => update("paymentStatus", e.target.value)} /></label>
                <label>{ui.changeDue}<input type="number" min="0" step="0.01" value={data.changeDue} onChange={(e) => update("changeDue", e.target.value)} /></label>
              </div>
            </div>
          </details>

          <details className="slip-panel">
            <summary><ReceiptText size={17} /> {ui.footerDetails}</summary>
            <div className="slip-panel-content">
              <label>{ui.footerLine1}<input value={data.footer} onChange={(e) => update("footer", e.target.value)} /></label>
              <label>{ui.footerLine2}<input value={data.footerSecondary} onChange={(e) => update("footerSecondary", e.target.value)} /></label>
              <label>{ui.footerLine3}<input value={data.footerTertiary} onChange={(e) => update("footerTertiary", e.target.value)} /></label>
              <label>{ui.website}<input type="url" value={data.website} onChange={(e) => update("website", e.target.value)} /></label>
            </div>
          </details>

          <details className="slip-panel slip-paper-panel" open>
            <summary><Sparkles size={17} /> {ui.paperTexture}</summary>
            <div className="slip-panel-content">
              <div className="paper-effect-buttons" aria-label={ui.paperTexture}>
                <button type="button" className={data.paperYellowing ? "active" : ""} onClick={() => update("paperYellowing", !data.paperYellowing)} aria-pressed={Boolean(data.paperYellowing)}>{ui.yellowing}</button>
                <button type="button" className={data.paperCrumple ? "active" : ""} onClick={() => update("paperCrumple", !data.paperCrumple)} aria-pressed={Boolean(data.paperCrumple)}>{ui.crumpling}</button>
              </div>
              <label>{ui.crumpleStrength}<select value={data.paperStrength} onChange={(e) => update("paperStrength", e.target.value)} disabled={!data.paperCrumple}><option value="soft">{ui.soft}</option><option value="natural">{ui.natural}</option><option value="strong">{ui.strong}</option></select></label>
              <p>{ui.independentEffects}</p>
            </div>
          </details>
        </div>
      </aside>

      <section className="slip-preview-stage">
        <div className="slip-preview-label"><span>{ui.livePreview}</span><strong>{ui.thermalSlip}</strong></div>
        <ReceiptPreview data={data} />
      </section>
      </main>
    </div>
  );
}
