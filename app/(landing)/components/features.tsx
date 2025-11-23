import {
  Film,
  FlipVertical2,
  GitPullRequestArrow,
  Image as ImageIcon,
  ScissorsLineDashed,
  Tangent,
  Users,
  WifiOff,
} from "lucide-react";
import React from "react";

const Features = () => (
  <div
    className="grid md:grid-cols-2  lg:grid-cols-3 gap-x-4 gap-y-20 mx-auto px-6 lg:px-0"
    id="features"
  >
    {features.map(({ description, title, icon }) => (
      <div
        key={description}
        className="text-center flex justify-center items-center flex-col gap-8"
      >
        {icon}
        <div>
          <p className="font-medium pb-4">{title}</p>
          <p className="text-gray-500 text-balance max-w-sm">{description}</p>
        </div>
      </div>
    ))}
  </div>
);

const features = [
  {
    icon: (
      <WifiOff className="bg-gray-200/50 p-3 rounded-lg text-gray-900 w-12 h-12" />
    ),
    title: "Offline Processing",
    description:
      "Compress videos and convert images anytime, anywhere, even without an internet connection. Maintain complete privacy with your files kept entirely offline.",
  },
  {
    icon: (
      <FlipVertical2 className="bg-gray-200/50 p-3 rounded-lg text-gray-900 w-12 h-12" />
    ),
    title: "Lossless Compression",
    description:
      "Shrink video sizes by up to 90% and compress images while preserving pristine quality. Enjoy smaller files without sacrificing visual fidelity.",
  },
  {
    icon: (
      <Film className="bg-gray-200/50 p-3 rounded-lg text-gray-900 w-12 h-12" />
    ),
    title: "Versatile Format Support",
    description:
      "Work with popular video formats like MP4 and WebM, and convert images between PNG, WebP, JPG, GIF, BMP, and AVIF formats.",
  },
  {
    icon: (
      <ImageIcon className="bg-gray-200/50 p-3 rounded-lg text-gray-900 w-12 h-12" />
    ),
    title: "Image Conversion",
    description:
      "Convert images between multiple formats including PNG, WebP, JPG, JPEG, GIF, BMP, and AVIF. Perfect for web optimization and compatibility.",
  },
  {
    icon: (
      <ScissorsLineDashed className="bg-gray-200/50 p-3 rounded-lg text-gray-900 w-12 h-12" />
    ),
    title: "Trim Video",
    description:
      "Eliminate undesired segments by choosing the video's starting and ending points, and the tool will automatically trim the video on your behalf.",
  },
  {
    icon: (
      <GitPullRequestArrow className="bg-gray-200/50 p-3 rounded-lg text-gray-900 w-12 h-12" />
    ),
    title: "Unleash Your Creativity",
    description:
      "Free and open-source software empowers you to customize the code, integrate the tool into your workflow, and contribute to its development.",
  },
  {
    icon: (
      <Tangent className="bg-gray-200/50 p-3 rounded-lg text-gray-900 w-12 h-12" />
    ),
    title: "Intuitive Interface",
    description:
      "Enjoy a user-friendly experience with a straightforward design, making video compression and image conversion effortless for everyone, regardless of technical expertise.",
  },
];

export default Features;
