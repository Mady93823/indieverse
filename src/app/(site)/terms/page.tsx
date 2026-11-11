import { StaticPage, staticPageMetadata } from "@/components/site/static-page";

export const generateMetadata = () => staticPageMetadata("terms");

export default function TermsPage() {
  return <StaticPage slug="terms" />;
}
