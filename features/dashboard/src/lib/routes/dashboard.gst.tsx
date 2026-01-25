import { GstTaxFiling } from '@inventory-platform/gst';

export function meta() {
  return [
    { title: 'GST Tax Filing - StockKart' },
    {
      name: 'description',
      content: 'Generate and manage GSTR-1 and GSTR-3B returns for GST compliance',
    },
  ];
}

export const gstMeta = meta;

export default function GstPage() {
  return <GstTaxFiling />;
}

