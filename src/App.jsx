import { useState, useEffect, useRef } from "react";
import { Download, Receipt, History, FileText, Plus, Save, Trash2, FolderOpen, ArrowLeft, Printer, Shuffle } from "lucide-react";
import { translations } from "./components/translations";
import InvoiceForm from "./components/InvoiceForm";
import InvoicePreview from "./components/InvoicePreview";
import MarketSlipApp from "./components/MarketSlipApp";
import ToolLauncher from "./components/ToolLauncher";
import { calculateTotals, getCurrencySymbol } from "./utils/calculations";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const initialInvoiceDate = new Date();
const INITIAL_INVOICE_DATE = initialInvoiceDate.toISOString().split("T")[0];

const RANDOM_CUSTOMERS = [
  { name: "Northstar Commerce LLC", email: "accounts@northstarcommerce.com", address: "Austin, Texas, USA" },
  { name: "Mavi Rota Teknoloji A.Ş.", email: "muhasebe@mavirota.com", address: "Kadıköy, İstanbul, Türkiye" },
  { name: "Berlin Creative GmbH", email: "finance@berlincreative.de", address: "Berlin, Deutschland" },
  { name: "Nordic Supply ApS", email: "billing@nordicsupply.dk", address: "København, Danmark" },
  { name: "Lusitana Digital Lda", email: "contas@lusitanadigital.pt", address: "Lisboa, Portugal" },
  { name: "Milano Retail S.r.l.", email: "amministrazione@milanoretail.it", address: "Milano, Italia" }
];

const RANDOM_PRODUCTS = [
  { description: "E-commerce Store Setup", rate: 780 },
  { description: "Marketplace Account Management", rate: 425 },
  { description: "Premium Technical Support", rate: 190 },
  { description: "Product Photography Package", rate: 340 },
  { description: "Cloud Hosting & Maintenance", rate: 125 },
  { description: "Custom Integration Service", rate: 560 },
  { description: "SEO Audit and Optimization", rate: 275 },
  { description: "WordPress Recovery Service", rate: 500 }
];

const randomInteger = (min, max) => {
  const values = new Uint32Array(1);
  globalThis.crypto?.getRandomValues?.(values);
  const ratio = globalThis.crypto?.getRandomValues ? values[0] / 4294967296 : Math.random();
  return Math.floor(ratio * (max - min + 1)) + min;
};

const randomFrom = (values) => values[randomInteger(0, values.length - 1)];

// Safari/WebKit can discard the width of ordinary spaces while html2canvas
// measures text. Give every word gap a real inline-box width in the export
// clone; <wbr> keeps notes and addresses free to wrap at those gaps.
const preserveCanvasSpaces = (root) => {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue?.includes(" ") && node.nodeValue.trim()) {
      textNodes.push(node);
    }
  }

  textNodes.forEach((node) => {
    const parts = node.nodeValue.split(" ");
    const fragment = doc.createDocumentFragment();

    parts.forEach((part, index) => {
      if (part) fragment.appendChild(doc.createTextNode(part));
      if (index < parts.length - 1) {
        const spacer = doc.createElement("i");
        spacer.className = "pdf-word-space";
        spacer.setAttribute("aria-hidden", "true");
        fragment.appendChild(spacer);
        fragment.appendChild(doc.createElement("wbr"));
      }
    });

    node.parentNode?.replaceChild(fragment, node);
  });
};

// Only fields rendered by the current commerce invoice are localized here.
const getLanguageDefaults = (lang) => {
  switch (lang) {
    case "tr":
      return {
        title: "Fatura",
        toName: "ABC Fitness LLC",
        toEmail: "john@abcfitness.com",
        toAddress: "Miami, Florida",
        notes: "İş ortaklığınız için teşekkür ederiz.",
        currency: "TRY",
        footerNote: "*Tüm gümrük vergileri, harçlar ve işlem ücretleri, ithalatçı adına taşıyıcı firma tarafından önceden tahsil edilmiştir.",
        bankName: "Garanti BBVA",
        bankAccountHolder: "Atlas Teknoloji ve Danışmanlık",
        customerServicePhone: "+90 555 555 55 55"
      };
    case "de":
      return {
        title: "Rechnung",
        toName: "ABC Fitness GmbH",
        toEmail: "john@abcfitness.com",
        toAddress: "München, Deutschland",
        notes: "Vielen Dank für Ihre geschätzte Zusammenarbeit.",
        currency: "EUR",
        footerNote: "*Alle Einfuhrzölle, Steuern und Abfertigungsgebühren wurden im Namen des Importeurs vom Frachtführer vorab erhoben.",
        bankName: "Deutsche Bank",
        bankAccountHolder: "Atlas Software GmbH",
        customerServicePhone: "+49 30 555555"
      };
    case "de-AT":
      return {
        title: "Rechnung",
        toName: "ABC Fitness GmbH",
        toEmail: "john@abcfitness.com",
        toAddress: "Wien, Österreich",
        notes: "Vielen Dank für Ihren Auftrag.",
        currency: "EUR",
        footerNote: "*Alle Einfuhrzölle, Steuern und Abfertigungsgebühren wurden im Namen des Importeurs vom Frachtführer vorab erhoben.",
        bankName: "Erste Bank",
        bankAccountHolder: "Atlas Software GmbH",
        customerServicePhone: "+43 1 555555"
      };
    case "da":
      return {
        title: "Faktura",
        toName: "ABC Fitness ApS",
        toEmail: "john@abcfitness.com",
        toAddress: "København, Danmark",
        notes: "Mange tak for din bestilling og dit samarbejde.",
        currency: "DKK",
        footerNote: "*Al importtold, alle afgifter og fortoldningsgebyrer er forudbetalt og opkrævet af fragtføreren på vegne af importøren.",
        bankName: "Danske Bank",
        bankAccountHolder: "Atlas Software ApS",
        customerServicePhone: "+45 70 55 55 55"
      };
    case "it":
      return {
        title: "Fattura",
        toName: "ABC Fitness S.r.l.",
        toEmail: "john@abcfitness.com",
        toAddress: "Milano, Italia",
        notes: "Grazie per la vostra collaborazione.",
        currency: "EUR",
        footerNote: "*Tutti i dazi d'importazione, le imposte e le spese di sdoganamento sono stati prepagati e riscossi dal vettore per conto dell'importatore.",
        bankName: "UniCredit",
        bankAccountHolder: "Atlas Software S.r.l.",
        customerServicePhone: "+39 02 555555"
      };
    case "pt":
      return {
        title: "Fatura",
        toName: "ABC Fitness Lda",
        toEmail: "john@abcfitness.com",
        toAddress: "Lisboa, Portugal",
        notes: "Agradecemos a sua preferência.",
        currency: "EUR",
        footerNote: "*Todos os direitos de importação, impostos e taxas de desalfandegamento foram pré-pagos e cobrados pelo transportador em nome do importador.",
        bankName: "Banco BPI",
        bankAccountHolder: "Atlas Software Lda",
        customerServicePhone: "+351 21 555555"
      };
    case "en":
    default:
      return {
        title: "Invoice",
        toName: "ABC Fitness LLC",
        toEmail: "john@abcfitness.com",
        toAddress: "Miami, Florida",
        notes: "Thank you for your business.",
        currency: "USD",
        footerNote: "*All import duties, taxes, and clearance fees have been prepaid and collected by the carrier on behalf of the importer.",
        bankName: "HSBC Bank",
        bankAccountHolder: "Atlas Software Ltd",
        customerServicePhone: "+1 800 777 5706"
      };
  }
};

export default function App() {
  const [activeTool, setActiveTool] = useState(null);
  const [lang, setLang] = useState("tr");
  const [isGenerating, setIsGenerating] = useState(false);
  // Responsive Scale Calculations for A4 Live Preview
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const scaleWrapperRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const fitPreview = () => {
      const styles = window.getComputedStyle(container);
      const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const availableWidth = Math.max(1, container.clientWidth - horizontalPadding);
      setScale(Math.min(1, Math.max(0.25, availableWidth / 794)));
    };

    fitPreview();
    const resizeObserver = new ResizeObserver(fitPreview);
    resizeObserver.observe(container);
    window.addEventListener("resize", fitPreview);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", fitPreview);
    };
  }, [activeTool]);

  // Saved Invoices from LocalStorage
  const [savedInvoices, setSavedInvoices] = useState(() => {
    try {
      const stored = localStorage.getItem("saved_invoices");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse saved invoices", e);
      return [];
    }
  });

  // Active Tab state ("edit" or "history")
  const [activeTab, setActiveTab] = useState("edit");

  // Sync saved invoices with localStorage
  useEffect(() => {
    localStorage.setItem("saved_invoices", JSON.stringify(savedInvoices));
  }, [savedInvoices]);

  // Initialize invoice data with Turkish defaults
  const defaults = getLanguageDefaults("tr");
  const [invoiceData, setInvoiceData] = useState({
    id: "initial-id",
    visualTheme: "modern",
    paperYellowing: false,
    paperCrumple: false,
    paperStrength: "soft",
    title: defaults.title,
    logo: null,
    invoiceNumber: "INV-2026-001",
    invoiceDate: INITIAL_INVOICE_DATE,
    toName: defaults.toName,
    toEmail: defaults.toEmail,
    toAddress: defaults.toAddress,
    items: [
      { description: "WordPress Recovery Service", quantity: 1, rate: 500 }
    ],
    notes: defaults.notes,
    currency: defaults.currency,
    discount: 0,
    discountType: "percent",
    tax: 20,
    addTax: 0,
    shipping: 0,
    clearanceFee: 0,
    amountPaid: 300,
    isPaid: false,
    bankName: defaults.bankName,
    bankAccountHolder: defaults.bankAccountHolder,
    // Shipping template fields
    shippingCarrier: "UPS WORLDWIDE EXPRESS",
    shippingName: "",
    shippingAddress: "",
    cardBrand: "VISA",
    cardLast4: "1550",
    customerServicePhone: defaults.customerServicePhone,
    bankAccountNumber: "028 009 592",
    footerNote: defaults.footerNote
  });

  const uiT = translations["tr"]; // UI is always in Turkish
  const pdfT = translations[lang]; // PDF output matches the selected language

  // Enforce light mode only
  useEffect(() => {
    document.body.classList.remove("dark-theme");
  }, []);

  // Handle language switch
  const handleLangChange = (newLang) => {
    setLang(newLang);
    const newDefaults = getLanguageDefaults(newLang);
    
    // Automatically update fields if they were untouched/still at previous defaults
    setInvoiceData((prev) => {
      const prevDefaults = getLanguageDefaults(lang);
      
      const updateIfDefault = (currentVal, prevDef, newDef) => {
        return currentVal === prevDef ? newDef : currentVal;
      };

      return {
        ...prev,
        title: updateIfDefault(prev.title, prevDefaults.title, newDefaults.title),
        toName: updateIfDefault(prev.toName, prevDefaults.toName, newDefaults.toName),
        toEmail: updateIfDefault(prev.toEmail, prevDefaults.toEmail, newDefaults.toEmail),
        toAddress: updateIfDefault(prev.toAddress, prevDefaults.toAddress, newDefaults.toAddress),
        notes: updateIfDefault(prev.notes, prevDefaults.notes, newDefaults.notes),
        currency: updateIfDefault(prev.currency, prevDefaults.currency, newDefaults.currency),
        footerNote: updateIfDefault(prev.footerNote, prevDefaults.footerNote, newDefaults.footerNote),
        
        bankName: updateIfDefault(prev.bankName, prevDefaults.bankName || "", newDefaults.bankName || ""),
        bankAccountHolder: updateIfDefault(prev.bankAccountHolder, prevDefaults.bankAccountHolder || "", newDefaults.bankAccountHolder || ""),
        customerServicePhone: updateIfDefault(prev.customerServicePhone, prevDefaults.customerServicePhone, newDefaults.customerServicePhone)
      };
    });
  };

  const saveCurrentInvoice = () => {
    const invoiceId = invoiceData.id || Date.now().toString();
    const invoiceToSave = { ...invoiceData, id: invoiceId };
    
    const existingIndex = savedInvoices.findIndex(
      (inv) => inv.id === invoiceId || (inv.invoiceNumber === invoiceData.invoiceNumber && inv.invoiceNumber !== "")
    );

    let updatedList;
    if (existingIndex > -1) {
      updatedList = [...savedInvoices];
      updatedList[existingIndex] = invoiceToSave;
    } else {
      updatedList = [invoiceToSave, ...savedInvoices];
    }
    
    setSavedInvoices(updatedList);
    setInvoiceData(invoiceToSave);
    alert(uiT.saveSuccess);
  };

  const loadInvoice = (invoice) => {
    setInvoiceData(invoice);
    setActiveTab("edit");
  };

  const deleteInvoice = (id, e) => {
    e.stopPropagation();
    if (confirm("Bu faturayı geçmişten silmek istediğinize emin misiniz?")) {
      const updated = savedInvoices.filter((inv) => inv.id !== id);
      setSavedInvoices(updated);
    }
  };

  const createNewInvoice = () => {
    const defaults = getLanguageDefaults("tr");
    setInvoiceData({
      id: Date.now().toString(),
      visualTheme: invoiceData.visualTheme || "modern",
      paperYellowing: false,
      paperCrumple: false,
      paperStrength: invoiceData.paperStrength || "soft",
      title: defaults.title,
      logo: null,
      invoiceNumber: "INV-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      invoiceDate: new Date().toISOString().split("T")[0],
      toName: defaults.toName,
      toEmail: defaults.toEmail,
      toAddress: defaults.toAddress,
      items: [
        { description: "WordPress Recovery Service", quantity: 1, rate: 500 }
      ],
      notes: defaults.notes,
      currency: defaults.currency,
      discount: 0,
      discountType: "percent",
      tax: 20,
      addTax: 0,
      shipping: 0,
      clearanceFee: 0,
      amountPaid: 300,
      isPaid: false,
      bankName: defaults.bankName,
      bankAccountHolder: defaults.bankAccountHolder,
      shippingCarrier: invoiceData.shippingCarrier || "UPS WORLDWIDE EXPRESS",
      shippingName: "",
      shippingAddress: "",
      cardBrand: invoiceData.cardBrand || "",
      cardLast4: "",
      customerServicePhone: invoiceData.customerServicePhone || defaults.customerServicePhone,
      bankAccountNumber: invoiceData.bankAccountNumber || "028 009 592",
      footerNote: defaults.footerNote
    });
    setActiveTab("edit");
  };

  const createRandomInvoice = () => {
    const languageDefaults = getLanguageDefaults(lang);
    const customer = randomFrom(RANDOM_CUSTOMERS);
    const productPool = [...RANDOM_PRODUCTS];
    const itemCount = randomInteger(1, 4);
    const items = Array.from({ length: itemCount }, () => {
      const productIndex = randomInteger(0, productPool.length - 1);
      const [product] = productPool.splice(productIndex, 1);
      return {
        description: product.description,
        quantity: randomInteger(1, 3),
        rate: product.rate + randomInteger(-25, 60)
      };
    });
    const invoiceDate = new Date();
    invoiceDate.setDate(invoiceDate.getDate() - randomInteger(0, 45));
    const taxByLanguage = { tr: 20, en: 8, de: 19, "de-AT": 20, da: 25, it: 22, pt: 23 };

    const randomInvoice = {
      id: `${Date.now()}-${randomInteger(100, 999)}`,
      visualTheme: invoiceData.visualTheme || "modern",
      paperYellowing: Boolean(invoiceData.paperYellowing),
      paperCrumple: Boolean(invoiceData.paperCrumple),
      paperStrength: invoiceData.paperStrength || "soft",
      title: languageDefaults.title,
      logo: invoiceData.logo || null,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(randomInteger(1, 999999)).padStart(6, "0")}`,
      invoiceDate: invoiceDate.toISOString().split("T")[0],
      toName: customer.name,
      toEmail: customer.email,
      toAddress: customer.address,
      items,
      notes: languageDefaults.notes,
      currency: languageDefaults.currency,
      discount: randomFrom([0, 0, 5, 10, 15]),
      discountType: "percent",
      tax: taxByLanguage[lang] ?? 20,
      addTax: 0,
      shipping: randomFrom([0, 0, 25, 40, 75]),
      clearanceFee: randomFrom([0, 0, 0, 35, 65]),
      amountPaid: 0,
      isPaid: false,
      bankName: languageDefaults.bankName,
      bankAccountHolder: languageDefaults.bankAccountHolder,
      shippingCarrier: randomFrom(["UPS WORLDWIDE EXPRESS", "DHL EXPRESS", "FEDEX INTERNATIONAL", "DPD CLASSIC"]),
      shippingName: customer.name,
      shippingAddress: customer.address,
      cardBrand: randomFrom(["VISA", "MASTERCARD", "AMEX"]),
      cardLast4: String(randomInteger(0, 9999)).padStart(4, "0"),
      customerServicePhone: languageDefaults.customerServicePhone,
      bankAccountNumber: `${String(randomInteger(10, 99))} ${String(randomInteger(100, 999))} ${String(randomInteger(100, 999))}`,
      footerNote: languageDefaults.footerNote
    };

    const { total } = calculateTotals(randomInvoice);
    const paymentMode = randomFrom(["unpaid", "partial", "paid"]);
    randomInvoice.amountPaid = paymentMode === "paid"
      ? Number(total.toFixed(2))
      : paymentMode === "partial"
        ? Number((total * 0.5).toFixed(2))
        : 0;
    randomInvoice.isPaid = paymentMode === "paid";

    setInvoiceData(randomInvoice);
    setActiveTab("edit");
  };

  // Generate and download an A4 PDF of the live preview.
  const downloadPdf = async () => {
    const element = document.getElementById("invoice-capture-area");
    if (!element) return;

    setIsGenerating(true);
    let exportHost = null;

    try {
      // Inter is a webfont; capturing before it resolves makes html2canvas
      // measure with the fallback face, which drops spaces and clips words.
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Build a detached A4 clone at 1:1. This removes the responsive preview
      // transform from the capture path entirely, so Safari and Chromium both
      // export the full sheet rather than the scaled on-screen preview.
      exportHost = document.createElement("div");
      Object.assign(exportHost.style, {
        position: "fixed",
        inset: "0 auto auto 0",
        width: "794px",
        height: "1123px",
        zIndex: "-1",
        overflow: "hidden",
        pointerEvents: "none",
        background: "#ffffff"
      });

      const exportSheet = element.cloneNode(true);
      exportSheet.id = "invoice-export-sheet";
      exportSheet.classList.add("pdf-export-mode");
      Object.assign(exportSheet.style, {
        width: "794px",
        height: "1123px",
        minWidth: "794px",
        minHeight: "1123px",
        maxWidth: "none",
        transform: "none",
        transformOrigin: "top left"
      });
      preserveCanvasSpaces(exportSheet);
      exportHost.appendChild(exportSheet);
      document.body.appendChild(exportHost);

      await Promise.all(
        Array.from(exportSheet.querySelectorAll("img")).map((image) => (
          image.decode ? image.decode().catch(() => undefined) : Promise.resolve()
        ))
      );
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const canvas = await html2canvas(exportSheet, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        onclone: async (doc) => {
          const clonedSheet = doc.getElementById("invoice-export-sheet");
          clonedSheet?.classList.add("pdf-export-mode");
          if (doc.fonts?.ready) await doc.fonts.ready;
        }
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.98),
        "JPEG",
        0,
        0,
        210,
        297,
        undefined,
        "FAST"
      );
      pdf.setProperties({
        title: `${invoiceData.title || "Fatura"} ${invoiceData.invoiceNumber || "INV-001"}`,
        creator: "Smart Invoice"
      });
      pdf.save(`${invoiceData.title || "Fatura"}_${invoiceData.invoiceNumber || "INV-001"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      exportHost?.remove();
      setIsGenerating(false);
    }
  };

  if (!activeTool) {
    return <ToolLauncher onSelect={setActiveTool} />;
  }

  if (activeTool === "slip") {
    return <MarketSlipApp onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="app-container">
      {/* Header controls */}
      <header className="app-header invoice-command-bar">
        <div className="brand-section invoice-command-brand">
          <button type="button" className="workspace-back-btn" onClick={() => setActiveTool(null)} aria-label="Araç menüsüne dön">
            <ArrowLeft size={17} />
            <span>Menü</span>
          </button>
          <span className="invoice-command-separator" aria-hidden="true" />
          <span className="invoice-brand-mark" aria-hidden="true"><Receipt size={21} /></span>
          <div className="invoice-brand-copy">
            <h1 className="brand-title">Fatura oluşturucu</h1>
            <span>Belge çalışma alanı</span>
          </div>
        </div>
        
        <div className="header-controls invoice-command-controls">
          <label className="invoice-language-control">
            <span>PDF dili</span>
            <select
              className="select-lang"
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
              aria-label="PDF dili"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
              <option value="de">Deutsch (DE)</option>
              <option value="de-AT">Deutsch (AT - Avusturya)</option>
              <option value="da">Dansk (Danca)</option>
              <option value="it">Italiano (İtalyanca)</option>
              <option value="pt">Português (Portekizce)</option>
            </select>
          </label>

          <nav className="invoice-create-actions" aria-label="Fatura oluşturma işlemleri">
            <button type="button" className="invoice-command-button" onClick={createNewInvoice}>
              <Plus size={16} />
              <span className="pdf-no-print">{uiT.newInvoice}</span>
            </button>
            <button type="button" className="invoice-command-button invoice-random-button" onClick={createRandomInvoice}>
              <Shuffle size={16} />
              <span className="pdf-no-print">Rastgele</span>
            </button>
          </nav>

          <nav className="invoice-output-actions" aria-label="Fatura çıktı işlemleri">
            <button type="button" className="invoice-save-button" onClick={saveCurrentInvoice}>
              <Save size={16} />
              <span className="pdf-no-print">Kaydet</span>
            </button>
            <button type="button" className="invoice-pdf-button" onClick={downloadPdf} disabled={isGenerating}>
              <Download size={17} />
              <span>{isGenerating ? "Hazırlanıyor" : "PDF indir"}</span>
            </button>
            <button type="button" className="invoice-print-button" onClick={() => window.print()} aria-label="Yazdır" title="Yazdır">
              <Printer size={17} />
            </button>
          </nav>
        </div>
      </header>

      {/* Split screen content */}
      <main className="main-layout">
        <div className="editor-sidebar">
          {/* Tab switcher */}
          <div className="editor-tabs">
            <button
              type="button"
              className={`editor-tab-btn editor-tab-icon-only ${activeTab === "edit" ? "active" : ""}`}
              onClick={() => setActiveTab("edit")}
              aria-label="Fatura düzenleyiciye dön"
            >
              <FileText size={16} />
            </button>
            <button
              type="button"
              className={`editor-tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <History size={16} />
              {uiT.historyTab} ({savedInvoices.length})
            </button>
          </div>

          {activeTab === "edit" ? (
            <InvoiceForm
              invoiceData={invoiceData}
              onChange={setInvoiceData}
              t={uiT}
            />
          ) : (
            <div className="editor-pane">
              <div className="history-pane">
                {savedInvoices.length === 0 ? (
                  <div className="history-empty">
                    <History size={40} style={{ opacity: 0.5 }} />
                    <div className="history-empty-title">{uiT.noInvoices}</div>
                  </div>
                ) : (
                  <div className="history-list">
                    {savedInvoices.map((inv) => {
                      const invTotal = calculateTotals(inv).total;

                      return (
                        <div
                          key={inv.id}
                          className="history-card"
                          onClick={() => loadInvoice(inv)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="history-card-header">
                            <span className="history-card-number">
                              {inv.invoiceNumber || "No Number"}
                            </span>
                            <span className={`history-card-badge ${inv.isPaid ? "paid" : "unpaid"}`}>
                              {inv.isPaid ? uiT.paid : uiT.unpaid}
                            </span>
                          </div>
                          <div className="history-card-details">
                            <div><strong>Müşteri:</strong> {inv.toName || "Belirtilmedi"}</div>
                            <div><strong>Tarih:</strong> {inv.invoiceDate || "Belirtilmedi"}</div>
                          </div>
                          <div className="history-card-total">
                            {getCurrencySymbol(inv.currency)}
                            {invTotal.toFixed(2)}
                          </div>
                          <div className="history-card-actions">
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                loadInvoice(inv);
                              }}
                            >
                              <FolderOpen size={12} />
                              {uiT.loadInvoice}
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                              onClick={(e) => deleteInvoice(inv.id, e)}
                            >
                              <Trash2 size={12} />
                              {uiT.deleteInvoice}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="preview-pane" ref={containerRef}>
          <div ref={scaleWrapperRef} style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            width: "794px",
            height: "1123px",
            marginBottom: `calc(1123px * (${scale} - 1))`,
            flexShrink: 0
          }}>
            <InvoicePreview
              invoiceData={invoiceData}
              t={pdfT}
              lang={lang}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
