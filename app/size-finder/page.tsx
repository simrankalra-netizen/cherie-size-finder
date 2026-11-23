import type { Metadata } from "next";
import SizeFinder from "../../components/SizeFinder";

export const metadata: Metadata = { title: "Find your size" };

export default function SizeFinderPage() {
  return <SizeFinder />;
}
