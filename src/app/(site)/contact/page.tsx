import { StaticPage, staticPageMetadata } from "@/components/site/static-page";

export const generateMetadata = () => staticPageMetadata("contact");

export default function ContactPage() {
  return <StaticPage slug="contact" />;
}
