const input = document.getElementById("inputText");
const result = document.getElementById("result");
const downloadBtn = document.getElementById("downloadBtn");
const colorPicker = document.getElementById("colorPicker");
const sizeRange = document.getElementById("sizeRange");
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

let currentCanvas = null;

document.getElementById("generateBarcode").addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return alert("Digite algo para gerar o código!");
  result.innerHTML = `<svg id="barcode"></svg>`;
  JsBarcode("#barcode", text, {
    lineColor: colorPicker.value,
    width: 2,
    height: sizeRange.value,
    displayValue: true,
    background: "transparent",
  });
  downloadBtn.classList.remove("hidden");
  currentCanvas = convertSvgToCanvas(document.querySelector("#barcode"));
});

document.getElementById("generateQR").addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return alert("Digite algo para gerar o código!");
  result.innerHTML = `<div id="qrcode"></div>`;
  new QRCode(document.getElementById("qrcode"), {
    text: text,
    width: sizeRange.value,
    height: sizeRange.value,
    colorDark: colorPicker.value,
    colorLight: "transparent",
  });
  downloadBtn.classList.remove("hidden");
  currentCanvas = document.querySelector("#qrcode canvas");
});

downloadBtn.addEventListener("click", () => {
  if (!currentCanvas) return;
  const link = document.createElement("a");
  link.download = "codigo.png";
  link.href = currentCanvas.toDataURL("image/png");
  link.click();
});

// Alternar Tema
themeToggle.addEventListener("click", () => {
  body.classList.toggle("light");
  themeToggle.textContent = body.classList.contains("light") ? "☀️" : "🌙";
});

// Converter SVG (barcode) para Canvas
function convertSvgToCanvas(svg) {
  const canvas = document.createElement("canvas");
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
  };
  img.src = "data:image/svg+xml;base64," + btoa(svgData);
  return canvas;
}
