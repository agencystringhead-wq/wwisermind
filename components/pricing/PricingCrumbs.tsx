import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { SERVICE_PATHS, routes, type ServiceKey } from '@/lib/routes';
import { getService } from '@/lib/services';

/** The breadcrumb row under a pricing page's hero: Home, Pricing, this page. When the page
    prices a service that has its own page, the row also links there, by the service's name. */
export default function PricingCrumbs({
  label,
  path,
  service,
}: {
  /** This page's name in the trail. */
  label: string;
  path: string;
  /** The service this page prices, if it has a page of its own. */
  service?: ServiceKey;
}) {
  const found = service ? getService(service) : undefined;

  return (
    <Breadcrumbs
      trail={[
        { label: 'Home', href: routes.home },
        { label: 'Pricing', href: routes.pricing.hub },
        { label, href: path },
      ]}
      related={
        service && found
          ? { label: `How ${found.name} works`, href: SERVICE_PATHS[service] }
          : undefined
      }
    />
  );
}
