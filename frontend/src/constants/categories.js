export const BRANDS = [
  {
    id: "honda",
    name: "HONDA",
    slug: "honda",
    image: "https://images.unsplash.com/photo-1628798211398-29d5c9773fbd?w=1200&q=80",
    color: "#E40521",
    models: [
      {
        id: "honda-pcx125-1517", name: "PCX 125", year_range: "2015-2017",
        full_name: "HONDA PCX 125 (15-17)", slug: "pcx-125-15-17",
        image: "https://images.unsplash.com/photo-1628798211398-29d5c9773fbd?w=1400&q=85",
        description: "2015-2017 model yılları için orijinal kalite yedek parçalar"
      },
      {
        id: "honda-pcx125-1820", name: "PCX 125", year_range: "2018-2020",
        full_name: "HONDA PCX 125 (18-20)", slug: "pcx-125-18-20",
        image: "https://images.unsplash.com/photo-1674891683524-480b82e9eb67?w=1400&q=85",
        description: "2018-2020 model yılları için orijinal kalite yedek parçalar"
      },
      {
        id: "honda-pcx125-2124", name: "PCX 125", year_range: "2021-2024",
        full_name: "HONDA PCX 125 (21-24)", slug: "pcx-125-21-24",
        image: "https://images.unsplash.com/photo-1628798211398-29d5c9773fbd?w=1400&q=85",
        description: "2021-2024 model yılları için orijinal kalite yedek parçalar"
      },
      {
        id: "honda-dio110-2124", name: "DIO 110", year_range: "2021-2024",
        full_name: "HONDA DIO 110 (21-24)", slug: "dio-110-21-24",
        image: "https://images.unsplash.com/photo-1572283046480-e990be92d301?w=1400&q=85",
        description: "Honda DIO 110 için 2021-2024 arası orijinal yedek parçalar"
      },
      {
        id: "honda-cbf150", name: "CBF 150", year_range: "",
        full_name: "HONDA CBF 150", slug: "cbf-150",
        image: "https://images.unsplash.com/photo-1687265769434-6930a0dc08ef?w=1400&q=85",
        description: "Honda CBF 150 için orijinal kalite yedek parçalar"
      },
      {
        id: "honda-forza250", name: "FORZA 250", year_range: "",
        full_name: "HONDA FORZA 250", slug: "forza-250",
        image: "https://images.unsplash.com/photo-1697450964169-c32b21b550ae?w=1400&q=85",
        description: "Honda FORZA 250 için premium yedek parçalar"
      },
      {
        id: "honda-activa125", name: "ACTIVA 125", year_range: "",
        full_name: "HONDA ACTIVA 125", slug: "activa-125",
        image: "https://images.unsplash.com/photo-1674891683524-480b82e9eb67?w=1400&q=85",
        description: "Honda ACTIVA 125 için orijinal yedek parçalar"
      },
    ]
  },
  {
    id: "yamaha",
    name: "YAMAHA",
    slug: "yamaha",
    image: "https://images.unsplash.com/photo-1594332966028-62ec2fb8908e?w=1200&q=80",
    color: "#003087",
    models: [
      {
        id: "yamaha-nmax125", name: "NMAX 125", year_range: "",
        full_name: "YAMAHA NMAX 125", slug: "nmax-125",
        image: "https://images.unsplash.com/photo-1594332966028-62ec2fb8908e?w=1400&q=85",
        description: "Yamaha NMAX 125 için orijinal kalite yedek parçalar"
      },
      {
        id: "yamaha-nmax155", name: "NMAX 155", year_range: "",
        full_name: "YAMAHA NMAX 155", slug: "nmax-155",
        image: "https://images.unsplash.com/photo-1624950207310-a0d766111a24?w=1400&q=85",
        description: "Yamaha NMAX 155 için orijinal kalite yedek parçalar"
      },
      {
        id: "yamaha-xmax250", name: "XMAX 250", year_range: "",
        full_name: "YAMAHA XMAX 250", slug: "xmax-250",
        image: "https://images.unsplash.com/photo-1697450964169-c32b21b550ae?w=1400&q=85",
        description: "Yamaha XMAX 250 için premium yedek parçalar"
      },
    ]
  },
  {
    id: "cfmoto",
    name: "CF MOTO",
    slug: "cfmoto",
    image: "https://images.unsplash.com/photo-1644879796743-32f929189b81?w=1200&q=80",
    color: "#FF6B00",
    models: [
      {
        id: "cfmoto-nk250", name: "NK250", year_range: "",
        full_name: "CFMOTO NK250", slug: "nk-250",
        image: "https://images.unsplash.com/photo-1644879796743-32f929189b81?w=1400&q=85",
        description: "CFMoto NK250 naked bike için orijinal yedek parçalar"
      },
      {
        id: "cfmoto-250sr", name: "250SR", year_range: "",
        full_name: "CFMOTO 250SR", slug: "250-sr",
        image: "https://images.unsplash.com/photo-1644879796656-94f5d2bf1b95?w=1400&q=85",
        description: "CFMoto 250SR süper spor için orijinal yedek parçalar"
      },
    ]
  },
  {
    id: "bajaj",
    name: "BAJAJ",
    slug: "bajaj",
    image: "https://images.unsplash.com/photo-1644879796656-94f5d2bf1b95?w=1200&q=80",
    color: "#1A1A2E",
    models: [
      {
        id: "bajaj-ns200", name: "NS200", year_range: "",
        full_name: "BAJAJ NS200", slug: "ns-200",
        image: "https://images.unsplash.com/photo-1644879796656-94f5d2bf1b95?w=1400&q=85",
        description: "Bajaj NS200 naked sport için orijinal yedek parçalar"
      },
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
