import React from "react";
import { ImageFormats, ImageInputSettings } from "~/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { motion } from "framer-motion";

type ImageInputControlProps = {
  imageSettings: ImageInputSettings;
  onImageSettingsChange: (value: ImageInputSettings) => void;
  disable: boolean;
  currentFileFormat?: string;
};

export const ImageInputControl = ({
  imageSettings,
  onImageSettingsChange,
  disable,
  currentFileFormat,
}: ImageInputControlProps) => {
  const isCompressMode = imageSettings.mode === "compress";
  const isLossyFormat = ["webp", "jpg", "jpeg", "avif"].includes(
    isCompressMode && currentFileFormat
      ? currentFileFormat.toLowerCase()
      : imageSettings.imageType.toLowerCase()
  );
  const isLosslessFormat = ["png", "gif"].includes(
    isCompressMode && currentFileFormat
      ? currentFileFormat.toLowerCase()
      : imageSettings.imageType.toLowerCase()
  );

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "tween" }}
      key="input"
      className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 h-fit"
    >
      <div className="text-sm">
        <div className="flex justify-between items-center border-b mb-2 pb-2">
          <p>Mode</p>
          <Select
            disabled={disable}
            value={imageSettings.mode}
            onValueChange={(value: "convert" | "compress") => {
              onImageSettingsChange({ ...imageSettings, mode: value });
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="convert">Convert</SelectItem>
                <SelectItem value="compress">Compress</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {!isCompressMode && (
          <div className="flex justify-between items-center border-b mb-2 pb-2">
            <p>Output Format</p>
            <Select
              disabled={disable}
              value={imageSettings.imageType}
              onValueChange={(value: string) => {
                const imageType = value as ImageFormats;
                onImageSettingsChange({ ...imageSettings, imageType });
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {formats.map(({ label, value }) => (
                    <SelectItem value={value} key={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {(isCompressMode || imageSettings.imageType === ImageFormats.WEBP) && (
          <div className="flex justify-between items-center">
            <p>
              {isLossyFormat
                ? "Quality (0-100)"
                : isLosslessFormat
                ? "Compression Level (0-100)"
                : "Quality (0-100)"}
            </p>
            <Select
              disabled={disable}
              value={imageSettings.quality?.toString() || "80"}
              onValueChange={(value: string) => {
                onImageSettingsChange({
                  ...imageSettings,
                  quality: parseInt(value, 10),
                });
              }}
            >
              <SelectTrigger className="w-[100px] text-sm">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {qualityOptions.map(({ label, value }) => (
                    <SelectItem value={value.toString()} key={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const formats: { label: string; value: ImageFormats }[] = [
  { label: "WebP (.webp)", value: ImageFormats.WEBP },
  { label: "PNG (.png)", value: ImageFormats.PNG },
  { label: "JPG (.jpg)", value: ImageFormats.JPG },
  { label: "JPEG (.jpeg)", value: ImageFormats.JPEG },
  { label: "GIF (.gif)", value: ImageFormats.GIF },
  { label: "BMP (.bmp)", value: ImageFormats.BMP },
  { label: "AVIF (.avif)", value: ImageFormats.AVIF },
];

const qualityOptions: { label: string; value: number }[] = [
  { label: "High (90)", value: 90 },
  { label: "Medium (80)", value: 80 },
  { label: "Low (70)", value: 70 },
  { label: "Custom (50)", value: 50 },
];

