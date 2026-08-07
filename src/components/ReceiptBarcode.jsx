const buildBars = (value) => {
  const source = String(value || "8691234567890");
  const bars = [2, 1, 2, 1, 1, 2];

  for (const char of source) {
    const code = char.charCodeAt(0);
    for (let bit = 0; bit < 7; bit += 1) {
      bars.push(((code >> bit) & 1) ? 3 : 1);
      bars.push(bit % 3 === 0 ? 2 : 1);
    }
  }

  bars.push(2, 1, 1, 2, 2, 1);
  return bars;
};

export default function ReceiptBarcode({ value }) {
  const bars = buildBars(value);
  const positionedBars = bars.reduce((result, width, index) => {
    const previous = result[result.length - 1];
    const x = previous ? previous.x + previous.width : 0;
    return [...result, { width, index, x }];
  }, []);

  return (
    <div className="receipt-barcode" aria-label={`Barkod ${value}`}>
      <svg viewBox={`0 0 ${bars.reduce((sum, width) => sum + width, 0)} 56`} role="img">
        {positionedBars.map(({ width, index, x }) => {
          if (index % 2 !== 0) return null;
          return <rect key={`${x}-${width}`} x={x} y="0" width={width} height={index < 6 || index > bars.length - 7 ? 51 : 45} />;
        })}
      </svg>
      <span>{value || "8691234567890"}</span>
    </div>
  );
}
