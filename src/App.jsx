import { useState, useEffect, useRef } from "react";
import { Download, Receipt, History, FileText, Plus, Save, Trash2, FolderOpen } from "lucide-react";
import { translations } from "./components/translations";
import InvoiceForm from "./components/InvoiceForm";
import InvoicePreview from "./components/InvoicePreview";
import StripeCheckout from "./components/StripeCheckout";
import { calculateTotals, getCurrencySymbol } from "./utils/calculations";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// html2canvas can collapse ordinary U+0020 spaces in Safari/WebKit and some
// font configurations. Keep the visual space as NBSP while adding <wbr> so
// long notes and addresses can still wrap naturally in the export clone.
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
        fragment.appendChild(doc.createTextNode("\u00a0"));
        fragment.appendChild(doc.createElement("wbr"));
      }
    });

    node.parentNode?.replaceChild(fragment, node);
  });
};

// Helper to get default editable values per language (including yasal compliance defaults)
const getLanguageDefaults = (lang) => {
  switch (lang) {
    case "tr":
      return {
        title: "Fatura",
        fromName: "Semih Yazılım",
        fromEmail: "info@semihsoftware.com",
        fromAddress: "New York / ABD",
        fromWebsite: "www.semihsoftware.com",
        fromPhone: "+90 555 555 55 55",
        toName: "ABC Fitness LLC",
        toEmail: "john@abcfitness.com",
        toAddress: "Miami, Florida",
        notes: "İş ortaklığınız için teşekkür ederiz.",
        terms: "Ödeme fatura tarihinden itibaren 30 gün içinde yapılmalıdır.",
        currency: "TRY",
        footerNote: "*Tüm gümrük vergileri, harçlar ve işlem ücretleri, ithalatçı adına taşıyıcı firma tarafından önceden tahsil edilmiştir.",
        // TR Compliance
        fromVatId: "3240892018",
        fromRegNo: "389201",
        fromTaxOffice: "New York Vergi Dairesi",
        fromMersis: "0324-0892-0180-0012",
        toVatId: "4791028374",
        toRegNo: "",
        bankName: "Garanti BBVA",
        bankAccountHolder: "Semih Yazılım ve Danışmanlık",
        bankIban: "TR56 0006 2000 0001 2345 6789 01",
        bankBic: ""
      };
    case "de":
      return {
        title: "Rechnung",
        fromName: "Semih Software GmbH",
        fromEmail: "info@semihsoftware.com",
        fromAddress: "New York / USA",
        fromWebsite: "www.semihsoftware.com",
        fromPhone: "+90 555 555 55 55",
        toName: "ABC Fitness GmbH",
        toEmail: "john@abcfitness.com",
        toAddress: "München, Deutschland",
        notes: "Vielen Dank für Ihre geschätzte Zusammenarbeit.",
        terms: "Zahlbar innerhalb von 30 Tagen ohne Abzug.",
        currency: "EUR",
        footerNote: "*Alle Einfuhrzölle, Steuern und Abfertigungsgebühren wurden im Namen des Importeurs vom Frachtführer vorab erhoben.",
        // DE Compliance
        fromVatId: "DE324089201",
        fromRegNo: "HRB 10293 B",
        fromTaxOffice: "Finanzamt Berlin-Mitte",
        fromJurisdiction: "Amtsgericht Berlin",
        fromDirector: "John Doe",
        toVatId: "DE749102837",
        toRegNo: "HRB 9912",
        bankName: "Deutsche Bank",
        bankAccountHolder: "Semih Software GmbH",
        bankIban: "DE89 3704 0044 0532 0130 00",
        bankBic: "DEUTDEDDFXX"
      };
    case "de-AT":
      return {
        title: "Rechnung",
        fromName: "Semih Software GmbH",
        fromEmail: "info@semihsoftware.com",
        fromAddress: "New York / USA",
        fromWebsite: "www.semihsoftware.com",
        fromPhone: "+90 555 555 55 55",
        toName: "ABC Fitness GmbH",
        toEmail: "john@abcfitness.com",
        toAddress: "Wien, Österreich",
        notes: "Vielen Dank für Ihren Auftrag.",
        terms: "Zahlungsziel 30 Tage ab Rechnungsdatum.",
        currency: "EUR",
        footerNote: "*Alle Einfuhrzölle, Steuern und Abfertigungsgebühren wurden im Namen des Importeurs vom Frachtführer vorab erhoben.",
        // AT Compliance
        fromVatId: "ATU76543210",
        fromRegNo: "FN 987654 y",
        fromTaxOffice: "Finanzamt Österreich",
        fromJurisdiction: "Handelsgericht Wien",
        fromDirector: "Dr. Johann Schmidt",
        toVatId: "ATU12345678",
        toRegNo: "FN 112233 t",
        bankName: "Erste Bank",
        bankAccountHolder: "Semih Software GmbH",
        bankIban: "AT12 2011 1000 1234 5678",
        bankBic: "EBANKATWWXXX"
      };
    case "da":
      return {
        title: "Faktura",
        fromName: "Semih Software ApS",
        fromEmail: "info@semihsoftware.com",
        fromAddress: "New York / USA",
        fromWebsite: "www.semihsoftware.com",
        fromPhone: "+90 555 555 55 55",
        toName: "ABC Fitness ApS",
        toEmail: "john@abcfitness.com",
        toAddress: "København, Danmark",
        notes: "Mange tak for din bestilling og dit samarbejde.",
        terms: "Betalingsbetingelser: Netto 30 dage.",
        currency: "DKK",
        footerNote: "*Al importtold, alle afgifter og fortoldningsgebyrer er forudbetalt og opkrævet af fragtføreren på vegne af importøren.",
        // DK Compliance
        fromVatId: "DK12345678",
        fromRegNo: "CVR 12345678",
        fromDirector: "Lars Nielsen",
        toVatId: "DK87654321",
        toRegNo: "CVR 87654321",
        bankName: "Danske Bank",
        bankAccountHolder: "Semih Software ApS",
        bankIban: "DK45 3000 1234 5678 90",
        bankBic: "DANSKDK22XXX"
      };
    case "it":
      return {
        title: "Fattura",
        fromName: "Semih Software S.r.l.",
        fromEmail: "info@semihsoftware.com",
        fromAddress: "New York / USA",
        fromWebsite: "www.semihsoftware.com",
        fromPhone: "+90 555 555 55 55",
        toName: "ABC Fitness S.r.l.",
        toEmail: "john@abcfitness.com",
        toAddress: "Milano, Italia",
        notes: "Grazie per la vostra collaborazione.",
        terms: "Pagamento entro 30 giorni data fattura.",
        currency: "EUR",
        footerNote: "*Tutti i dazi d'importazione, le imposte e le spese di sdoganamento sono stati prepagati e riscossi dal vettore per conto dell'importatore.",
        // IT Compliance
        fromVatId: "IT12345678901",
        fromRegNo: "12345678901",
        fromTaxOffice: "Agenzia delle Entrate",
        fromDirector: "Dr. Rossi",
        toVatId: "IT98765432109",
        toRegNo: "98765432109",
        bankName: "UniCredit",
        bankAccountHolder: "Semih Software S.r.l.",
        bankIban: "IT99 C123 4567 8901 2345 6789 012",
        bankBic: "UNCRITM1XXX"
      };
    case "pt":
      return {
        title: "Fatura",
        fromName: "Semih Software Lda",
        fromEmail: "info@semihsoftware.com",
        fromAddress: "New York / EUA",
        fromWebsite: "www.semihsoftware.com",
        fromPhone: "+90 555 555 55 55",
        toName: "ABC Fitness Lda",
        toEmail: "john@abcfitness.com",
        toAddress: "Lisboa, Portugal",
        notes: "Agradecemos a sua preferência.",
        terms: "Pagamento até 30 dias após a data da fatura.",
        currency: "EUR",
        footerNote: "*Todos os direitos de importação, impostos e taxas de desalfandegamento foram pré-pagos e cobrados pelo transportador em nome do importador.",
        // PT Compliance
        fromVatId: "PT509876543",
        fromRegNo: "509876543",
        fromDirector: "Manuel Silva",
        toVatId: "PT512345678",
        toRegNo: "512345678",
        bankName: "Banco BPI",
        bankAccountHolder: "Semih Software Lda",
        bankIban: "PT50 0010 0000 1234 5678 9012 3",
        bankBic: "BPIOPTPLXXX"
      };
    case "en":
    default:
      return {
        title: "Invoice",
        fromName: "Semih Software Ltd",
        fromEmail: "info@semihsoftware.com",
        fromAddress: "New York / USA",
        fromWebsite: "www.semihsoftware.com",
        fromPhone: "+90 555 555 55 55",
        toName: "ABC Fitness LLC",
        toEmail: "john@abcfitness.com",
        toAddress: "Miami, Florida",
        notes: "Thank you for your business.",
        terms: "Payment due within 30 days.",
        currency: "USD",
        footerNote: "*All import duties, taxes, and clearance fees have been prepaid and collected by the carrier on behalf of the importer.",
        // EN Compliance
        fromVatId: "GB987654321",
        fromRegNo: "09876543",
        fromDirector: "John Doe",
        toVatId: "US1234567",
        toRegNo: "",
        bankName: "HSBC Bank",
        bankAccountHolder: "Semih Software Ltd",
        bankIban: "GB29 HSBC 4005 1512 3456 78",
        bankBic: "HSBCHGB22XXX"
      };
  }
};

export default function App() {
  const [lang, setLang] = useState("tr");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  // Responsive Scale Calculations for A4 Live Preview
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const scaleWrapperRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const padding = window.innerWidth <= 640 ? 24 : 32;
        if (containerWidth < 794 + padding) {
          setScale((containerWidth - padding) / 794);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    template: "classic",
    paperTexture: false,
    title: defaults.title,
    logo: null,
    invoiceNumber: "INV-2026-001",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentTerms: "30",
    fromName: defaults.fromName,
    fromEmail: defaults.fromEmail,
    fromAddress: defaults.fromAddress,
    fromWebsite: defaults.fromWebsite,
    fromPhone: defaults.fromPhone,
    // Compliance values
    fromVatId: defaults.fromVatId,
    fromRegNo: defaults.fromRegNo,
    fromTaxOffice: defaults.fromTaxOffice,
    fromMersis: defaults.fromMersis,
    fromJurisdiction: "",
    fromDirector: "",
    toName: defaults.toName,
    toEmail: defaults.toEmail,
    toAddress: defaults.toAddress,
    toVatId: defaults.toVatId,
    toRegNo: defaults.toRegNo,
    items: [
      { description: "WordPress Recovery Service", quantity: 1, rate: 500 }
    ],
    notes: defaults.notes,
    terms: defaults.terms,
    signature: null,
    currency: defaults.currency,
    discount: 0,
    discountType: "percent",
    tax: 20,
    addTax: 0,
    shipping: 0,
    clearanceFee: 0,
    amountPaid: 300,
    isPaid: false,
    // Stripe settings
    acceptStripe: false,
    stripeEmail: "",
    stripeLink: "",
    // Bank details
    bankName: defaults.bankName,
    bankAccountHolder: defaults.bankAccountHolder,
    bankIban: defaults.bankIban,
    bankBic: defaults.bankBic,
    // Shipping template fields
    shippingCarrier: "UPS WORLDWIDE EXPRESS",
    shippingName: "",
    shippingAddress: "",
    cardBrand: "VISA",
    cardLast4: "1550",
    customerServicePhone: "",
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
      
      const updateIfDefault = (field, currentVal, prevDef, newDef) => {
        return currentVal === prevDef ? newDef : currentVal;
      };

      // Reset Stripe settings if shifting to Turkey since Stripe is disabled in TR
      const acceptStripeVal = newLang === "tr" ? false : prev.acceptStripe;

      return {
        ...prev,
        title: updateIfDefault("title", prev.title, prevDefaults.title, newDefaults.title),
        fromName: updateIfDefault("fromName", prev.fromName, prevDefaults.fromName, newDefaults.fromName),
        fromEmail: updateIfDefault("fromEmail", prev.fromEmail, prevDefaults.fromEmail, newDefaults.fromEmail),
        fromAddress: updateIfDefault("fromAddress", prev.fromAddress, prevDefaults.fromAddress, newDefaults.fromAddress),
        fromWebsite: updateIfDefault("fromWebsite", prev.fromWebsite, prevDefaults.fromWebsite, newDefaults.fromWebsite),
        fromPhone: updateIfDefault("fromPhone", prev.fromPhone, prevDefaults.fromPhone, newDefaults.fromPhone),
        // Legal compliance updates
        fromVatId: updateIfDefault("fromVatId", prev.fromVatId, prevDefaults.fromVatId, newDefaults.fromVatId),
        fromRegNo: updateIfDefault("fromRegNo", prev.fromRegNo, prevDefaults.fromRegNo, newDefaults.fromRegNo),
        fromTaxOffice: updateIfDefault("fromTaxOffice", prev.fromTaxOffice, prevDefaults.fromTaxOffice, newDefaults.fromTaxOffice),
        fromMersis: updateIfDefault("fromMersis", prev.fromMersis, prevDefaults.fromMersis, newDefaults.fromMersis),
        fromJurisdiction: updateIfDefault("fromJurisdiction", prev.fromJurisdiction, prevDefaults.fromJurisdiction || "", newDefaults.fromJurisdiction || ""),
        
        toName: updateIfDefault("toName", prev.toName, prevDefaults.toName, newDefaults.toName),
        toEmail: updateIfDefault("toEmail", prev.toEmail, prevDefaults.toEmail, newDefaults.toEmail),
        toAddress: updateIfDefault("toAddress", prev.toAddress, prevDefaults.toAddress, newDefaults.toAddress),
        toVatId: updateIfDefault("toVatId", prev.toVatId, prevDefaults.toVatId, newDefaults.toVatId),
        toRegNo: updateIfDefault("toRegNo", prev.toRegNo, prevDefaults.toRegNo || "", newDefaults.toRegNo || ""),
        
        notes: updateIfDefault("notes", prev.notes, prevDefaults.notes, newDefaults.notes),
        terms: updateIfDefault("terms", prev.terms, prevDefaults.terms, newDefaults.terms),
        currency: updateIfDefault("currency", prev.currency, prevDefaults.currency, newDefaults.currency),
        footerNote: updateIfDefault("footerNote", prev.footerNote, prevDefaults.footerNote, newDefaults.footerNote),
        
        // Bank details updates
        bankName: updateIfDefault("bankName", prev.bankName, prevDefaults.bankName || "", newDefaults.bankName || ""),
        bankAccountHolder: updateIfDefault("bankAccountHolder", prev.bankAccountHolder, prevDefaults.bankAccountHolder || "", newDefaults.bankAccountHolder || ""),
        bankIban: updateIfDefault("bankIban", prev.bankIban, prevDefaults.bankIban || "", newDefaults.bankIban || ""),
        
        acceptStripe: acceptStripeVal
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
      template: invoiceData.template || "classic",
      paperTexture: Boolean(invoiceData.paperTexture),
      title: defaults.title,
      logo: null,
      invoiceNumber: "INV-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      paymentTerms: "30",
      fromName: defaults.fromName,
      fromEmail: defaults.fromEmail,
      fromAddress: defaults.fromAddress,
      fromWebsite: defaults.fromWebsite,
      fromPhone: defaults.fromPhone,
      fromVatId: defaults.fromVatId,
      fromRegNo: defaults.fromRegNo,
      fromTaxOffice: defaults.fromTaxOffice,
      fromMersis: defaults.fromMersis,
      fromJurisdiction: "",
      fromDirector: "",
      toName: defaults.toName,
      toEmail: defaults.toEmail,
      toAddress: defaults.toAddress,
      toVatId: defaults.toVatId,
      toRegNo: defaults.toRegNo,
      items: [
        { description: "WordPress Recovery Service", quantity: 1, rate: 500 }
      ],
      notes: defaults.notes,
      terms: defaults.terms,
      signature: null,
      currency: defaults.currency,
      discount: 0,
      discountType: "percent",
      tax: 20,
      addTax: 0,
      shipping: 0,
      clearanceFee: 0,
      amountPaid: 300,
      isPaid: false,
      acceptStripe: false,
      stripeEmail: "",
      stripeLink: "",
      bankName: defaults.bankName,
      bankAccountHolder: defaults.bankAccountHolder,
      bankIban: defaults.bankIban,
      bankBic: defaults.bankBic,
      shippingCarrier: invoiceData.shippingCarrier || "UPS WORLDWIDE EXPRESS",
      shippingName: "",
      shippingAddress: "",
      cardBrand: invoiceData.cardBrand || "",
      cardLast4: "",
      customerServicePhone: invoiceData.customerServicePhone || "",
      bankAccountNumber: invoiceData.bankAccountNumber || "028 009 592",
      footerNote: defaults.footerNote
    });
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
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
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

  // Handle successful simulated card payment
  const handlePaymentSuccess = () => {
    setInvoiceData((prev) => ({
      ...prev,
      isPaid: true,
      amountPaid: calculateTotals(prev).total
    }));
  };

  return (
    <div className="app-container">
      {/* Header controls */}
      <header className="app-header">
        <div className="brand-section">
          <Receipt className="brand-icon" size={28} />
          <h1 className="brand-title">Smart Invoice</h1>
        </div>
        
        <div className="header-controls">
          {/* Language Selector */}
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>PDF Dili:</span>
          <select
            className="select-lang"
            value={lang}
            onChange={(e) => handleLangChange(e.target.value)}
            aria-label="Language Select"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
            <option value="de">Deutsch (DE)</option>
            <option value="de-AT">Deutsch (AT - Avusturya)</option>
            <option value="da">Dansk (Danca)</option>
            <option value="it">Italiano (İtalyanca)</option>
            <option value="pt">Português (Portekizce)</option>
          </select>

          {/* New Invoice Button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={createNewInvoice}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Plus size={16} />
            <span className="pdf-no-print">{uiT.newInvoice}</span>
          </button>

          {/* Save Invoice Button */}
          <button
            type="button"
            className="btn-primary"
            onClick={saveCurrentInvoice}
            style={{ backgroundColor: "var(--success-color)", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Save size={16} />
            <span className="pdf-no-print">{uiT.saveInvoice}</span>
          </button>

          {/* Download PDF button */}
          <button
            type="button"
            className="btn-primary"
            onClick={downloadPdf}
            disabled={isGenerating}
          >
            <Download size={18} />
            {isGenerating ? "..." : uiT.downloadPdf}
          </button>
        </div>
      </header>

      {/* Split screen content */}
      <main className="main-layout">
        <div className="editor-sidebar">
          {/* Tab switcher */}
          <div className="editor-tabs">
            <button
              type="button"
              className={`editor-tab-btn ${activeTab === "edit" ? "active" : ""}`}
              onClick={() => setActiveTab("edit")}
            >
              <FileText size={16} />
              {uiT.editTab}
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
              lang={lang}
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
              onPayClick={() => setShowCheckoutModal(true)}
              lang={lang}
            />
          </div>
        </div>
      </main>

      {/* Stripe Checkout Simulation Modal */}
      {showCheckoutModal && (
        <StripeCheckout
          invoiceData={invoiceData}
          onClose={() => setShowCheckoutModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          t={pdfT}
        />
      )}
    </div>
  );
}
