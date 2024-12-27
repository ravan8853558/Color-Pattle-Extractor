const imageInput = document.getElementById("imageInput");
const palettePreview = document.getElementById("palettePreview");
const hiddenCanvas = document.getElementById("hiddenCanvas");
const loader = document.getElementById("loader");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const img = new Image();
  const ctx = hiddenCanvas.getContext("2d");
  const reader = new FileReader();

  loader.classList.remove("hidden");
  palettePreview.innerHTML = "";

  reader.onload = () => {
    img.src = reader.result;
    img.onload = () => {
      hiddenCanvas.width = img.width;
      hiddenCanvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
      const colorMap = new Map();

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const rgbColor = `rgb(${r}, ${g}, ${b})`;
        const hexColor = rgbToHex(r, g, b);

        if (!colorMap.has(hexColor)) {
          colorMap.set(hexColor, { rgb: rgbColor, count: 1 });
        } else {
          colorMap.get(hexColor).count += 1;
        }
      }

      const sortedColors = [...colorMap.entries()]
        .sort((a, b) => b[1].count - a[1].count) // Sort by frequency
        .map(([hex, data]) => ({ hex, rgb: data.rgb }));

      loader.classList.add("hidden");

      sortedColors.forEach(({ hex, rgb }) => {
        const colorBlock = document.createElement("div");
        colorBlock.classList.add("color-block");

        const colorSample = document.createElement("div");
        colorSample.classList.add("color-sample");
        colorSample.style.backgroundColor = rgb;

        const colorCode = document.createElement("span");
        colorCode.innerHTML = `<b>${hex}</b><br>(${rgb})`;

        colorBlock.appendChild(colorSample);
        colorBlock.appendChild(colorCode);
        palettePreview.appendChild(colorBlock);
      });
    };
  };

  reader.readAsDataURL(file);
});

// Helper function to convert RGB to Hex
function rgbToHex(r, g, b) {
  const toHex = (component) => component.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
