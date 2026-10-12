import { formatPrice, type PricingEntry } from '@/lib/pricing';

/** "From $X one-time", or "Price on request" while the entry has no number. One place
    decides, so no card can print a figure the data does not hold. */
export default function PricingLine({
  entry,
  className,
}: {
  entry: PricingEntry;
  className: string;
}) {
  const price = formatPrice(entry);

  return (
    <p className={className}>
      {price ? (
        <>
          <span>Starting at {price}</span>
          <small>{entry.priceUnit}</small>
        </>
      ) : (
        <span>Price on request</span>
      )}
    </p>
  );
}
