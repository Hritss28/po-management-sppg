export enum POStatus {
  VALID = "VALID",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  INVOICED = "INVOICED",
}

export interface POItem {
  id: string;
  nama_barang: string;
  qty: number;
  grade: 'A' | 'B' | 'C';
  harga: number;
  satuan: string;
  request?: string;
  supplier?: string;
  invoiced?: boolean;
}

export const SUPPLIERS = [
  'DUNIA BUMBU MOJOKERTO',
  'NUTRIVA FOODS',
  'VIALA PANGAN'
] as const;

export type SupplierType = typeof SUPPLIERS[number];

export const SUPPLIER_DETAILS: Record<SupplierType, { address: string; logoUrl?: string; stampUrl?: string; themeColor: string; banks: { bank: string; account: string; owner: string }[] }> = {
  'NUTRIVA FOODS': {
    address: '01/01 Pesanan Bicak Trowulan',
    logoUrl: '/logo-nutrifa.jpeg',
    stampUrl: '/stamp-nutriva.jpeg',
    themeColor: '#ea580c', // orange-600
    banks: [
      { bank: 'MANDIRI', account: '1420015180150', owner: 'ARIF RAKHMAN HADI' },
    ]
  },
  'VIALA PANGAN': {
    address: 'Perum Graha Majapahit Jl Village Ave 89',
    logoUrl: '/logo-viala.jpeg',
    stampUrl: '/stamp-viala.jpeg',
    themeColor: '#2563eb', // blue-600
    banks: [
      { bank: 'MANDIRI', account: '1420015180150', owner: 'ARIF RAKHMAN HADI' },
    ]
  },
  'DUNIA BUMBU MOJOKERTO': {
    address: 'GPM Bypass B1 No 4 Kota Mojokerto',
    logoUrl: '/logo-duniabumbu.jpeg',
    stampUrl: '/stamp-duniabumbu.jpeg',
    themeColor: '#16a34a', // green-600
    banks: [
      { bank: 'MANDIRI', account: '1420015180150', owner: 'ARIF RAKHMAN HADI' },
    ]
  }
};

export interface DeliveryInfo {
  suratJalanNo: string;
  supplier?: string;
  photoUrl?: string;
  notes: string;
  deliveryDate: string;
  deliveredBy: string;
  itemPhotos?: Record<string, string>;
  kepada?: string;
  kd_sppg?: string;
  nama_sppg?: string;
  pj_sppg?: string;
  no_wa?: string;
}

export interface InvoiceInfo {
  invoiceNo: string;
  invoiceDate: string;
  totalAmount: number;
  status: 'PAID' | 'UNPAID';
  supplier: string;
  pdfUrl?: string;
  kepada?: string;
  kd_sppg?: string;
  nama_sppg?: string;
  pj_sppg?: string;
  no_wa?: string;
  no_rek?: string;
  rek?: string;
  stamp_ttd?: string;
  items?: {
    nama_barang: string;
    qty: number;
    harga: number;
    satuan: string;
    grade: string;
    total: number;
  }[];
}

export interface PiutangInfo {
  id: string;
  kd_piutang: string;
  originalInvoiceNo: string;
  no_po: string;
  nama_barang: string;
  qty: number;
  harga: number;
  satuan: string;
  totalAmount: number;
  supplier: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  bankDetails?: { bank: string; account: string; owner: string };
}

export interface StockItem {
  id: string;
  nama_barang: string;
  satuan: string;
}

export const INITIAL_STOCK: StockItem[] = [
  { id: '1', nama_barang: 'AYAM FILET', satuan: 'kg' },
  { id: '2', nama_barang: 'AYAM FILET', satuan: 'kg' },
  { id: '3', nama_barang: 'telur ayam', satuan: 'butir' },
  { id: '4', nama_barang: 'daging', satuan: 'kg' },
  { id: '5', nama_barang: 'roti burger', satuan: 'pcs' },
];

export interface PurchaseOrder {
  id: string;
  no: number;
  no_po: string;
  tanggal_po: string;
  po_by: string;
  sppg: string;
  droping_time: string;
  droping_date: string;
  status: POStatus;
  items: POItem[];
  delivery?: DeliveryInfo;
  invoices?: InvoiceInfo[];
  piutang?: PiutangInfo[];
  invoice?: InvoiceInfo; // Keep for backward compatibility/migration if needed, but we'll use invoices
  createdAt: string;
}
