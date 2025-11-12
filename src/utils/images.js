// Carga dinámica de imágenes locales ubicadas en src/assets/products/*
// Permite colocar imágenes como 1.jpg, 1.png, 1.webp o slug-nombre.jpg
// Uso: const url = getLocalProductImage(product);

const productImages = import.meta.glob("../assets/products/*", {
  eager: true,
  import: "default",
});

function normalizeName(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getLocalProductImage(product) {
  if (!product) return null;
  const id = product.id != null ? String(product.id) : "";
  const slug = normalizeName(product.nombre);
  // buscar por id.*
  const byId = Object.entries(productImages).find(([path]) =>
    new RegExp(`/(?:${id})\\.(?:png|jpg|jpeg|webp|gif)$`, "i").test(path)
  );
  if (byId) return byId[1];
  // buscar por slug.*
  const bySlug = Object.entries(productImages).find(([path]) =>
    new RegExp(`/(?:${slug})\\.(?:png|jpg|jpeg|webp|gif)$`, "i").test(path)
  );
  if (bySlug) return bySlug[1];
  return null;
}

export function getQrImage() {
  const qr = import.meta.glob("../assets/qr.*", { eager: true, import: "default" });
  const first = Object.values(qr)[0];
  if (first) return first;
  // Fallback: data URI SVG simple con texto
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>
      <rect width='100%' height='100%' fill='white'/>
      <rect x='20' y='20' width='560' height='560' fill='none' stroke='black' stroke-width='8'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='Arial' fill='black'>
        Coloca tu QR en src/assets/qr.png
      </text>
    </svg>`
  );
  return `data:image/svg+xml;charset=UTF-8,${svg}`;
}


