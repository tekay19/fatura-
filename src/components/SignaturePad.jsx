import React, { useRef, useState, useEffect } from "react";
import { PenTool, Type, Trash2 } from "lucide-react";

export default function SignaturePad({ value, onChange, t }) {
  const [mode, setMode] = useState("draw"); // "draw" or "type"
  const [typedName, setTypedName] = useState("");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize Canvas context
  const getContext = () => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "rgba(15, 23, 42, 0.9)"; // dark slate ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = getContext();
    if (!ctx) return;

    let x, y;
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      // Prevent scrolling on touch devices
      e.preventDefault();
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = getContext();
    if (!ctx) return;

    let x, y;
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      e.preventDefault();
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasData();
  };

  const saveCanvasData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Check if canvas is empty
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      onChange(null); // Empty signature
    } else {
      onChange(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setTypedName(val);
    if (val.trim() === "") {
      onChange(null);
    } else {
      // Create a base64 image from typed text to render nicely in PDF export
      const textCanvas = document.createElement("canvas");
      textCanvas.width = 400;
      textCanvas.height = 120;
      const ctx = textCanvas.getContext("2d");
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, 400, 120);
      
      // Draw signature font style
      ctx.font = "italic 40px 'Caveat', 'Great Vibes', 'Brush Script MT', cursive";
      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(val, 200, 60);

      onChange(textCanvas.toDataURL());
    }
  };

  // Adjust canvas resolution for crisp lines
  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      if (value && value.startsWith("data:image")) {
        // Restore signature if drawing existed
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = value;
      }
    }
  }, [mode]);

  return (
    <div className="signature-pad-container">
      <div className="signature-pad-tabs">
        <button
          type="button"
          className={`sig-tab-btn ${mode === "draw" ? "active" : ""}`}
          onClick={() => {
            setMode("draw");
            onChange(null);
          }}
        >
          <PenTool size={16} />
          {t.drawSignature}
        </button>
        <button
          type="button"
          className={`sig-tab-btn ${mode === "type" ? "active" : ""}`}
          onClick={() => {
            setMode("type");
            setTypedName("");
            onChange(null);
          }}
        >
          <Type size={16} />
          {t.typeSignature}
        </button>
      </div>

      {mode === "draw" ? (
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="signature-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            placeholder={t.signaturePlaceholder}
          />
          {value && (
            <button
              type="button"
              onClick={clearCanvas}
              className="clear-sig-btn"
              title={t.clearSignature}
            >
              <Trash2 size={14} />
              {t.clearSignature}
            </button>
          )}
        </div>
      ) : (
        <div className="type-sig-wrapper">
          <input
            type="text"
            className="type-sig-input"
            value={typedName}
            onChange={handleTypeChange}
            placeholder={t.signatureFontPlaceholder}
            maxLength={30}
          />
          {typedName && (
            <div className="type-sig-preview" style={{ fontFamily: "'Caveat', cursive" }}>
              {typedName}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
