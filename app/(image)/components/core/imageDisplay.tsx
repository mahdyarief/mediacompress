import Image from "next/image";
import React from "react";

type ImageDisplayProps = {
  imageUrls: string[];
};

export const ImageDisplay = ({ imageUrls }: ImageDisplayProps) => {
  if (imageUrls.length === 1) {
    return (
      <div className="h-full w-full rounded-3xl flex items-center justify-center p-4 relative">
        <Image
          src={imageUrls[0]}
          alt="Preview"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="rounded-lg object-contain"
          unoptimized
          priority
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-3xl p-4 overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {imageUrls.map((url, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
          >
            <Image
              src={url}
              alt={`Preview ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
              unoptimized
            />
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

