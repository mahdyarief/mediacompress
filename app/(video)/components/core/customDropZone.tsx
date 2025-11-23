"use client";
import { useState } from "react";
import ReactDropzone from "react-dropzone";
import { toast } from "sonner";
import { Projector } from "~/components/svg/projector";

type CustomDropZoneProps = {
  handleUpload: (files: File[]) => void;
  acceptedFiles: { [key: string]: string[] };
  disabled?: boolean;
};

export const CustomDropZone = ({
  handleUpload,
  acceptedFiles,
  disabled,
}: CustomDropZoneProps) => {
  const [isHover, setIsHover] = useState<boolean>(false);

  const handleHover = (): void => setIsHover(true);
  const handleExitHover = (): void => setIsHover(false);
  const onDrop = (files: File[]) => {
    handleUpload(files);
    handleExitHover();
  };
  const onDropRejected = () => {
    handleExitHover();
    toast.error("Error uploading your file(s)", {
      description: "Allowed Files: Video files (MP4, MKV, AVI, MOV, FLV, WEBM).",
      duration: 5000,
    });
  };
  const onError = () => {
    handleExitHover();
    toast.error("Error uploading your file(s)", {
      description: "Allowed Files: Video files (MP4, MKV, AVI, MOV, FLV, WEBM).",
      duration: 5000,
    });
  };

  return (
    <ReactDropzone
      disabled={disabled}
      onDrop={onDrop}
      onDragEnter={handleHover}
      onDragLeave={handleExitHover}
      accept={acceptedFiles}
      onDropRejected={onDropRejected}
      multiple={true}
      onError={onError}
    >
      {({ getRootProps, getInputProps }) => (
        <div
          {...getRootProps()}
          className={`${
            isHover ? "border-black bg-gray-100/80" : "border-default-gray"
          } flex justify-center items-center flex-col cursor-pointer w-full py-6 ${
            disabled ? "cursor-not-allowed" : ""
          }`}
        >
          <input {...getInputProps()} />
          <Projector />
          <h3 className="text-center mt-5">
            Click to select videos
            <br />
            or
            <br />
            drag videos and Drop
            <br />
            <span className="text-xs opacity-60 mt-2 block">
              (Multiple files supported)
            </span>
          </h3>
        </div>
      )}
    </ReactDropzone>
  );
};
