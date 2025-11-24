import { BadgeCheck, Download } from "lucide-react";
import { FileActions, ImageInputSettings } from "~/types";
import {
  bytesToSize,
  calculateBlobSize,
  reduceSize,
} from "~/utils/bytesToSize";
import { formatTime } from "~/utils/convert";
import { motion } from "framer-motion";
import JSZip from "jszip";

type ImageOutputDetailsProps = {
  imageFiles: FileActions[];
  timeTaken?: number;
  imageSettings: ImageInputSettings;
};

export const ImageOutputDetails = ({
  imageFiles,
  timeTaken,
  imageSettings,
}: ImageOutputDetailsProps) => {
  const totalOriginalSize = imageFiles.reduce(
    (sum, file) => sum + file.fileSize,
    0
  );
  const totalOutputSize = imageFiles.reduce(
    (sum, file) => sum + (file.outputBlob ? file.outputBlob.size : 0),
    0
  );
  const totalSizeReduced = totalOriginalSize - totalOutputSize;
  const totalPercentage = totalOriginalSize > 0
    ? Math.round((totalSizeReduced / totalOriginalSize) * 100)
    : 0;

  const getOriginalFileName = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) return fileName;
    return fileName.substring(0, lastDotIndex);
  };

  const toSnakeCase = (fileName: string): string => {
    // Get filename without extension
    const nameWithoutExt = getOriginalFileName(fileName);
    
    // Convert to lowercase and replace spaces/special chars with hyphens
    let snakeCase = nameWithoutExt
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
      .replace(/-+/g, "-"); // Replace multiple consecutive hyphens with single hyphen
    
    // Handle empty string case
    if (!snakeCase) {
      snakeCase = "file";
    }
    
    return snakeCase;
  };

  const getDownloadName = (file: FileActions) => {
    const baseName = toSnakeCase(file.fileName);
    const extension =
      imageSettings.mode === "compress" ? file.from : imageSettings.imageType;

    return `${baseName}.${extension}`;
  };

  const download = (file: FileActions) => {
    if (!file?.url) return;
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = file.url;
    a.download = getDownloadName(file);
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(file.url);
    document.body.removeChild(a);
  };

  const downloadAll = async () => {
    try {
      const zip = new JSZip();

      // Add all converted files to ZIP with correct names and extensions
      for (const file of imageFiles) {
        if (file.outputBlob) {
          const newFileName = getDownloadName(file);
          
          // Add file to ZIP
          zip.file(newFileName, file.outputBlob);
        }
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create download link with appropriate name based on mode
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      // Use mode-appropriate filename
      const zipFileName = imageSettings.mode === "compress" 
        ? "compressed-images.zip" 
        : `converted-${imageSettings.imageType}.zip`;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      // Fallback to individual downloads if ZIP creation fails
      imageFiles.forEach((file) => {
        if (file.url) {
          setTimeout(() => download(file), 100);
        }
      });
    }
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      key="output"
      transition={{ type: "tween" }}
      className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 h-fit max-h-96 overflow-y-auto"
    >
      <div className="text-sm">
        <div className="flex justify-between items-center border-b mb-2 pb-2">
          <div className="flex items-center gap-1">
            <p className="">Output Files ({imageFiles.length})</p>
            <BadgeCheck className="text-white rounded-full" fill="#000000" />
          </div>
          {imageFiles.length > 0 && (
            <button
              onClick={downloadAll}
              type="button"
              className="bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-950 to-zinc-950 rounded-lg text-white/90 px-2.5 py-1.5 relative text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-500 focus:ring-zinc-950 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              {imageFiles.length > 1 ? "Download All as ZIP" : "Download as ZIP"}
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
          {imageFiles.map((file, index) => {
            const outputFileSize = file.outputBlob
              ? calculateBlobSize(file.outputBlob)
              : 0;
            const { sizeReduced, percentage } = file.outputBlob
              ? reduceSize(file.fileSize, file.outputBlob)
              : { sizeReduced: "0 B", percentage: 0 };

            return (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-2 bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium truncate flex-1">
                    {getDownloadName(file)}
                  </p>
                  <button
                    onClick={() => download(file)}
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 text-xs flex items-center gap-1 ml-2"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="opacity-70">Original: </span>
                    <span>{bytesToSize(file.fileSize)}</span>
                  </div>
                  <div>
                    <span className="opacity-70">New: </span>
                    <span className="font-semibold">{outputFileSize}</span>
                  </div>
                  <div>
                    <span className="opacity-70">Reduced: </span>
                    <span>{sizeReduced}</span>
                  </div>
                  <div>
                    <span className="opacity-70">%: </span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-2 space-y-1">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Total original size</p>
            <p className="font-semibold">{bytesToSize(totalOriginalSize)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-semibold">Total new size</p>
            <p className="font-semibold">{bytesToSize(totalOutputSize)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-semibold">Total size reduced</p>
            <p className="font-semibold">{bytesToSize(totalSizeReduced)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-semibold">Total reduction %</p>
            <p className="font-semibold">{totalPercentage}%</p>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <p>Time taken</p>
            <p>{timeTaken ? formatTime(timeTaken / 1000) : "-"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

