export const BRANDS = [
  {
    id: "honda",
    name: "HONDA",
    slug: "honda",
    image: "https://images.unsplash.com/photo-1741295017671-c0a4be2db1af?w=600&q=80",
    color: "#E40521",
    models: [
      { id: "honda-pcx125-1517", name: "PCX 125", year_range: "2015-2017", full_name: "HONDA PCX 125 (15-17)", slug: "pcx-125-15-17" },
      { id: "honda-pcx125-1820", name: "PCX 125", year_range: "2018-2020", full_name: "HONDA PCX 125 (18-20)", slug: "pcx-125-18-20" },
      { id: "honda-pcx125-2124", name: "PCX 125", year_range: "2021-2024", full_name: "HONDA PCX 125 (21-24)", slug: "pcx-125-21-24" },
      { id: "honda-dio110-2124", name: "DIO 110", year_range: "2021-2024", full_name: "HONDA DIO 110 (21-24)", slug: "dio-110-21-24" },
      { id: "honda-cbf150", name: "CBF 150", year_range: "", full_name: "HONDA CBF 150", slug: "cbf-150" },
      { id: "honda-forza250", name: "FORZA 250", year_range: "", full_name: "HONDA FORZA 250", slug: "forza-250" },
      { id: "honda-activa125", name: "ACTIVA 125", year_range: "", full_name: "HONDA ACTIVA 125", slug: "activa-125" },
    ]
  },
  {
    id: "yamaha",
    name: "YAMAHA",
    slug: "yamaha",
    image: "https://images.unsplash.com/photo-1659023408350-ab0624a70482?w=600&q=80",
    color: "#003087",
    models: [
      { id: "yamaha-nmax125", name: "NMAX 125", year_range: "", full_name: "YAMAHA NMAX 125", slug: "nmax-125" },
      { id: "yamaha-nmax155", name: "NMAX 155", year_range: "", full_name: "YAMAHA NMAX 155", slug: "nmax-155" },
      { id: "yamaha-xmax250", name: "XMAX 250", year_range: "", full_name: "YAMAHA XMAX 250", slug: "xmax-250" },
    ]
  },
  {
    id: "cfmoto",
    name: "CF MOTO",
    slug: "cfmoto",
    image: "https://images.unsplash.com/photo-1741295017671-c0a4be2db1af?w=600&q=80",
    color: "#FF6B00",
    models: [
      { id: "cfmoto-nk250", name: "NK250", year_range: "", full_name: "CFMOTO NK250", slug: "nk-250" },
      { id: "cfmoto-250sr", name: "250SR", year_range: "", full_name: "CFMOTO 250SR", slug: "250-sr" },
    ]
  },
  {
    id: "bajaj",
    name: "BAJAJ",
    slug: "bajaj",
    image: "https://images.unsplash.com/photo-1659023408350-ab0624a70482?w=600&q=80",
    color: "#1A1A2E",
    models: [
      { id: "bajaj-ns200", name: "NS200", year_range: "", full_name: "BAJAJ NS200", slug: "ns-200" },
    ]
  },
];

export const PARTS_CATEGORIES = [
  "Fren Sistemi",
  "Motor & Şanzıman",
  "Filtreler",
  "Elektrik & Aydınlatma",
  "Süspansiyon",
  "Aksesuar",
  "Egzoz",
  "Aktarma Organları",
  "Kaporta & Plastik",
  "Yakıt Sistemi",
];

export const getBrandBySlug = (slug) => BRANDS.find(b => b.slug === slug);

export const getModelBySlug = (brandSlug, modelSlug) => {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return null;
  return brand.models.find(m => m.slug === modelSlug);
};
