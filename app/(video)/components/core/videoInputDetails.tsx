import React from "react";
import { FileActions } from "~/types";
import { bytesToSize } from "~/utils/bytesToSize";
import { motion } from "framer-motion";

type VideoInputDetailsProps = {
  videoFiles: FileActions[];
  onClear: () => void;
};

export const VideoInputDetails = ({
  videoFiles,
  onClear,
}: VideoInputDetailsProps) => {
  const totalSize = videoFiles.reduce((sum, file) => sum + file.fileSize, 0);

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "tween" }}
      key="details"
      className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 h-fit max-h-64 overflow-y-auto"
    >
      <div className="text-sm">
        <div className="flex justify-between items-center border-b mb-2 pb-2">
          <p className="">
            Files Input ({videoFiles.length})
          </p>
          <button
            onClick={onClear}
            type="button"
            className="bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-950 to-zinc-950 rounded-lg text-white/90 px-2.5 py-1.5 relative text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-500 focus:ring-zinc-950"
          >
            Clear
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {videoFiles.map((file, index) => (
            <div key={index} className="border-b pb-2 last:border-b-0">
              <p className="text-xs truncate">{file.fileName}</p>
              <div className="flex justify-between items-center text-xs opacity-70">
                <span>Size</span>
                <span>{bytesToSize(file.fileSize)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t">
          <p className="font-semibold">Total size</p>
          <p className="font-semibold">{bytesToSize(totalSize)}</p>
        </div>
      </div>
    </motion.div>
  );
};
