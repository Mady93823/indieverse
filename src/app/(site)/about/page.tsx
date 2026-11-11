import { StaticPage, staticPageMetadata } from "@/components/site/static-page";

export const generateMetadata = () => staticPageMetadata("about");

export default function AboutPage() {
  return <StaticPage slug="about" />;
}
