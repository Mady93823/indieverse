import { StaticPage, staticPageMetadata } from "@/components/site/static-page";

export const generateMetadata = () => staticPageMetadata("privacy");

export default function PrivacyPage() {
  return <StaticPage slug="privacy" />;
}
