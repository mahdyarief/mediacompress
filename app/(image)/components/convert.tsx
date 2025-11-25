"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { acceptedImageFiles, imageFormat } from "~/utils/formats";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { toast } from "sonner";
import convertImage, { compressImage } from "~/utils/imageConvert";
import { ImageDisplay } from "./core/imageDisplay";
import { ImageDropZone } from "./core/imageDropZone";
import { ImageInputDetails } from "./core/imageInputDetails";
import { ImageInputControl } from "./core/imageInputControl";
import { ImageOutputDetails } from "./core/imageOutputDetails";
import { ImageConvertProgress } from "./core/imageConvertProgress";
import {
  FileActions,
  ImageFormats,
  ImageInputSettings,
} from "~/types";
import { motion, AnimatePresence } from "framer-motion";
import { getBaseUrl } from "~/lib/utils";

const ConvertImage = () => {
  const [imageFiles, setImageFiles] = useState<FileActions[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [time, setTime] = useState<{
    startTime?: Date;
    elapsedSeconds: number;
  }>({ elapsedSeconds: 0 });
  const [status, setStatus] = useState<
    "notStarted" | "converted" | "converting" | "compressing"
  >("notStarted");
  const [imageSettings, setImageSettings] = useState<ImageInputSettings>({
    mode: "convert",
    imageType: ImageFormats.WEBP,
    quality: 80,
  });
  const ffmpegRef = useRef(new FFmpeg());
  const disableDuringConversion =
    status === "converting" || status === "compressing";
  const supportedInputFormats = imageFormat
    .map((format) => format.toUpperCase())
    .join(", ");
  const supportedOutputFormats = [
    ImageFormats.WEBP,
    ImageFormats.PNG,
    ImageFormats.JPG,
    ImageFormats.JPEG,
    ImageFormats.GIF,
    ImageFormats.BMP,
    ImageFormats.AVIF,
  ]
    .map((format) => format.toUpperCase())
    .join(", ");

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (time?.startTime) {
      timer = setInterval(() => {
        const endTime = new Date();
        const timeDifference = endTime.getTime() - time.startTime!.getTime();
        setTime({ ...time, elapsedSeconds: timeDifference });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [time]);

  const handleUpload = (files: File[]) => {
    const newFiles: FileActions[] = files.map((file) => ({
      fileName: file.name,
      fileSize: file.size,
      from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
      fileType: file.type,
      file,
      isError: false,
    }));
    setImageFiles(newFiles);
  };

  const convert = async () => {
    if (!imageFiles.length) return;
    try {
      setTime({ ...time, startTime: new Date() });
      setStatus(imageSettings.mode === "compress" ? "compressing" : "converting");
      setCurrentFileIndex(0);
      setProgress(0);

      const convertedFiles: FileActions[] = [];
      const totalFiles = imageFiles.length;

      // Set up progress handler once
      ffmpegRef.current.on("progress", ({ progress: completion }) => {
        // Progress will be updated per file in the loop
        const currentFileProgress = completion * 100;
        const overallProgress =
          ((convertedFiles.length + completion) / totalFiles) * 100;
        setProgress(overallProgress);
      });

      ffmpegRef.current.on("log", ({ message }) => {
        console.log(message);
      });

      for (let i = 0; i < imageFiles.length; i++) {
        setCurrentFileIndex(i);
        const file = imageFiles[i];

        try {
          // Debug: Log what we're about to do
          console.log("Processing file:", {
            fileName: file.fileName,
            mode: imageSettings.mode,
            fileType: file.fileType,
            extension: file.from,
          });

          let result;
          if (imageSettings.mode === "compress") {
            console.log("Calling compressImage for:", file.fileName);
            result = await compressImage(ffmpegRef.current, file, imageSettings);
            console.log("compressImage returned:", {
              output: result.output,
              url: result.url ? "exists" : "missing",
              blobSize: result.outputBlob?.size,
            });
          } else {
            console.log("Calling convertImage for:", file.fileName);
            result = await convertImage(ffmpegRef.current, file, imageSettings);
          }

          const { url, output, outputBlob } = result;

          // Verify output format matches input for compress mode
          if (imageSettings.mode === "compress") {
            const inputExt = file.from.toLowerCase();
            const outputExt = output.split(".").pop()?.toLowerCase();
            if (inputExt !== outputExt) {
              console.error(
                "⚠️ Format mismatch in compress mode!",
                `Input: ${inputExt}, Output: ${outputExt}`
              );
            }
          }

          convertedFiles.push({
            ...file,
            url,
            output,
            outputBlob,
          });

          // Update state with converted files so far
          setImageFiles([...convertedFiles, ...imageFiles.slice(i + 1)]);
        } catch (fileError) {
          console.error(
            `Error ${imageSettings.mode === "compress" ? "compressing" : "converting"} ${file.fileName}:`,
            fileError
          );
          // Mark file as error but continue with others
          convertedFiles.push({
            ...file,
            isError: true,
          });
          toast.error(
            `Error ${imageSettings.mode === "compress" ? "compressing" : "converting"} ${file.fileName}`
          );
        }
      }

      setTime((oldTime) => ({ ...oldTime, startTime: undefined }));
      setStatus("converted");
      setProgress(0);
      setCurrentFileIndex(0);
      
      const successCount = convertedFiles.filter((f) => f.outputBlob).length;
      if (successCount > 0) {
        toast.success(
          `Successfully ${imageSettings.mode === "compress" ? "compressed" : "converted"} ${successCount} file(s)`
        );
      }
    } catch (err) {
      console.log(err);
      setStatus("notStarted");
      setProgress(0);
      setCurrentFileIndex(0);
      setTime({ elapsedSeconds: 0, startTime: undefined });
      toast.error(
        `Error ${imageSettings.mode === "compress" ? "Compressing" : "Converting"} Images`
      );
    }
  };

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    const baseUrl = getBaseUrl();
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${baseUrl}/download/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${baseUrl}/download/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
  };

  const loadWithToast = () => {
    toast.promise(load, {
      loading: "Downloading necessary packages from FFmpeg for offline use.",
      success: () => {
        return "All necessary file downloaded";
      },
      error: "Error loading FFmpeg packages",
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadWithToast(), []);

  return (
    <>
      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        key="drag"
        transition={{ type: "tween" }}
        className="flex border rounded-3xl col-span-5 md:h-full w-full bg-gray-50/35"
      >
        {imageFiles.length > 0 ? (
          <ImageDisplay
            imageUrls={imageFiles.map((file) =>
              URL.createObjectURL(file.file)
            )}
          />
        ) : (
          <ImageDropZone
            acceptedFiles={acceptedImageFiles}
            handleUpload={handleUpload}
          />
        )}
      </motion.div>
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          key="size"
          transition={{ type: "tween" }}
          className="flex border rounded-3xl col-span-3 h-full w-full bg-gray-50/35 p-4 relative"
        >
          <div className="flex flex-col gap-4 w-full">
            {imageFiles.length > 0 && (
              <>
                <ImageInputDetails
                  onClear={() => {
                    setImageFiles([]);
                    setStatus("notStarted");
                    setProgress(0);
                    setTime({ elapsedSeconds: 0 });
                  }}
                  imageFiles={imageFiles}
                />
              </>
            )}
            <ImageInputControl
              disable={disableDuringConversion}
              onImageSettingsChange={setImageSettings}
              imageSettings={imageSettings}
              currentFileFormat={
                imageFiles.length > 0 ? imageFiles[0].from : undefined
              }
            />
            <div className="text-xs text-gray-500 bg-white/70 border border-gray-200 rounded-2xl px-4 py-3">
              <p className="font-semibold text-gray-800">Supported formats</p>
              <p className="mt-1">
                Inputs: {supportedInputFormats}
              </p>
              <p>
                Convert to: {supportedOutputFormats}
              </p>
            </div>
            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              key="button"
              transition={{ type: "tween" }}
              className="bg-gray-100 border border-gray-200 rounded-2xl p-3 h-fit"
            >
              {(status === "converting" || status === "compressing") && (
                <div className="space-y-2">
                  <ImageConvertProgress
                    progress={progress}
                    seconds={time.elapsedSeconds}
                  />
                  {imageFiles.length > 1 && (
                    <p className="text-xs text-center opacity-70">
                      {imageSettings.mode === "compress" ? "Compressing" : "Converting"}{" "}
                      {currentFileIndex + 1} of {imageFiles.length}
                    </p>
                  )}
                </div>
              )}

              {(status === "notStarted" || status === "converted") && (
                <button
                  onClick={convert}
                  type="button"
                  className="bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-950 to-zinc-950 rounded-lg text-white/90 px-3.5 py-2.5 relative text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-500 focus:ring-zinc-950 w-full plausible-event-name=Converted"
                >
                  {imageSettings.mode === "compress" ? "Compress" : "Convert"}
                </button>
              )}
            </motion.div>
            {status === "converted" && imageFiles.length > 0 && (
              <ImageOutputDetails
                timeTaken={time.elapsedSeconds}
                imageFiles={imageFiles.filter((f) => f.outputBlob)}
                imageSettings={imageSettings}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default ConvertImage;

