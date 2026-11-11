import { StaticPage, staticPageMetadata } from "@/components/site/static-page";

export const generateMetadata = () => staticPageMetadata("copyright");

export default function CopyrightPage() {
  return <StaticPage slug="copyright" />;
}
