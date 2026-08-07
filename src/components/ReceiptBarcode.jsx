const LEFT_ODD = {
  0: "0001101", 1: "0011001", 2: "0010011", 3: "0111101", 4: "0100011",
  5: "0110001", 6: "0101111", 7: "0111011", 8: "0110111", 9: "0001011"
};

const LEFT_EVEN = {
  0: "0100111", 1: "0110011", 2: "0011011", 3: "0100001", 4: "0011101",
  5: "0111001", 6: "0000101", 7: "0010001", 8: "0001001", 9: "0010111"
};

const RIGHT = {
  0: "1110010", 1: "1100110", 2: "1101100", 3: "1000010", 4: "1011100",
  5: "1001110", 6: "1010000", 7: "1000100", 8: "1001000", 9: "1110100"
};

const PARITY = {
  0: "OOOOOO", 1: "OOEOEE", 2: "OOEEOE", 3: "OOEEEO", 4: "OEOOEE",
  5: "OEEOOE", 6: "OEEEOO", 7: "OEOEOE", 8: "OEOEEO", 9: "OEEOEO"
};

const checkDigit = (firstTwelve) => {
  const sum = firstTwelve.split("").reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);
  return String((10 - (sum % 10)) % 10);
};

const normalizeEan13 = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  const firstTwelve = (digits || "869123456789").padEnd(12, "0").slice(0, 12);
  return `${firstTwelve}${checkDigit(firstTwelve)}`;
};

const encodeEan13 = (value) => {
  const digits = normalizeEan13(value);
  const parity = PARITY[digits[0]];
  let modules = "101";

  for (let index = 1; index <= 6; index += 1) {
    modules += parity[index - 1] === "O" ? LEFT_ODD[digits[index]] : LEFT_EVEN[digits[index]];
  }

  modules += "01010";

  for (let index = 7; index <= 12; index += 1) {
    modules += RIGHT[digits[index]];
  }

  return { digits, modules: `${modules}101` };
};

export default function ReceiptBarcode({ value }) {
  const { digits, modules } = encodeEan13(value);
  const guardModules = new Set([0, 2, 46, 48, 92, 94]);

  return (
    <div className="receipt-barcode" aria-label={`EAN-13 barcode ${digits}`}>
      <svg viewBox="0 0 95 58" role="img" aria-hidden="true">
        {Array.from(modules, (module, index) => module === "1" && (
          <rect key={index} x={index} y="0" width="1" height={guardModules.has(index) ? 54 : 47} />
        ))}
      </svg>
      <span>{`${digits[0]} ${digits.slice(1, 7)} ${digits.slice(7)}`}</span>
    </div>
  );
}
