import { Metadata } from "next";
import dynamic from "next/dynamic";
import { getBaseUrl } from "~/lib/utils";
const ConvertImage = dynamic(() => import("../components/convert"), {
  ssr: false,
});

export const metadata: Metadata = {
  alternates: {
    canonical: "/image",
    languages: {
      "en-US": "/en-US",
    },
  },
  title:
    "Convert Images - PNG to WebP and More - Free, High-Quality Online Tool",
  description:
    "Convert images effortlessly with our free online tool. Convert PNG to WebP, JPG, JPEG, GIF, BMP, and AVIF formats. Enjoy high-quality results without sacrificing clarity, perfect for web optimization and sharing.",
  keywords: [
    "Image Converter",
    "PNG to WebP",
    "Image Format Converter",
    "Convert Images Online",
    "WebP Converter",
    "Free Image Converter",
    "Image Compression Tool",
    "Convert PNG to JPG",
  ],
  robots: "index, follow",
  openGraph: {
    title:
      "Convert Images - PNG to WebP and More - Free, High-Quality Online Tool",
    description:
      "Convert images effortlessly with our free online tool. Convert PNG to WebP, JPG, JPEG, GIF, BMP, and AVIF formats. Enjoy high-quality results without sacrificing clarity, perfect for web optimization and sharing.",
    url: `${getBaseUrl()}/image`,
    type: "website",
    images: "/og-image.png",
    siteName: "Image Converter Hub",
  },
  twitter: {
    card: "summary_large_image",
    site: "@mahdyarief",
    creator: "@mahdyarief",
  },
};

const Page = () => {
  return (
    <div className="max-w-5xl mx-auto pt-32">
      <div className="lg:grid lg:grid-cols-8 gap-10 lg:h-[calc(100dvh-130px)] pb-10 px-6 lg:px-0 flex flex-col">
        <ConvertImage />
      </div>
    </div>
  );
};

export default Page;

