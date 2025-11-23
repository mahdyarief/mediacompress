"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { acceptedVideoFiles } from "~/utils/formats";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { toast } from "sonner";
import convertFile from "~/utils/convert";
import { VideoDisplay } from "./core/videoDisplay";
import { CustomDropZone } from "./core/customDropZone";
import { VideoInputDetails } from "./core/videoInputDetails";
import { VideoInputControl } from "./core/videoInputControl";
import { VideoOutputDetails } from "./core/videoOutputDetails";
import { VideoCompressProgress } from "./core/videoCompressProgress";
import { VideoTrim } from "./core/videoTrim";
import {
  FileActions,
  QualityType,
  VideoFormats,
  VideoInputSettings,
} from "~/types";
import { motion, AnimatePresence } from "framer-motion";

const CompressVideo = () => {
  const [videoFiles, setVideoFiles] = useState<FileActions[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [time, setTime] = useState<{
    startTime?: Date;
    elapsedSeconds: number;
  }>({ elapsedSeconds: 0 });
  const [status, setStatus] = useState<
    "notStarted" | "converted" | "compressing"
  >("notStarted");
  const [videoSettings, setVideoSettings] = useState<VideoInputSettings>({
    quality: QualityType.Hight,
    videoType: VideoFormats.MP4,
    customEndTime: 0,
    customStartTime: 0,
    removeAudio: false,
    twitterCompressionCommand: false,
  });
  const ffmpegRef = useRef(new FFmpeg());
  const disableDuringCompression = status === "compressing";

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
    setVideoFiles(newFiles);
  };

  const compress = async () => {
    if (!videoFiles.length) return;
    try {
      setTime({ ...time, startTime: new Date() });
      setStatus("compressing");
      setCurrentFileIndex(0);
      setProgress(0);

      const compressedFiles: FileActions[] = [];
      const totalFiles = videoFiles.length;

      // Set up progress handler once
      ffmpegRef.current.on("progress", ({ progress: completion }) => {
        // Progress will be updated per file in the loop
        const currentFileProgress = completion * 100;
        const overallProgress =
          ((compressedFiles.length + completion) / totalFiles) * 100;
        setProgress(overallProgress);
      });

      ffmpegRef.current.on("log", ({ message }) => {
        console.log(message);
      });

      for (let i = 0; i < videoFiles.length; i++) {
        setCurrentFileIndex(i);
        const file = videoFiles[i];

        try {
          const { url, output, outputBlob } = await convertFile(
            ffmpegRef.current,
            file,
            videoSettings
          );

          compressedFiles.push({
            ...file,
            url,
            output,
            outputBlob,
          });

          // Update state with compressed files so far
          setVideoFiles([...compressedFiles, ...videoFiles.slice(i + 1)]);
        } catch (fileError) {
          console.error(`Error compressing ${file.fileName}:`, fileError);
          // Mark file as error but continue with others
          compressedFiles.push({
            ...file,
            isError: true,
          });
          toast.error(`Error compressing ${file.fileName}`);
        }
      }

      setTime((oldTime) => ({ ...oldTime, startTime: undefined }));
      setStatus("converted");
      setProgress(0);
      setCurrentFileIndex(0);
      
      const successCount = compressedFiles.filter((f) => f.outputBlob).length;
      if (successCount > 0) {
        toast.success(
          `Successfully compressed ${successCount} file(s)`
        );
      }
    } catch (err) {
      console.log(err);
      setStatus("notStarted");
      setProgress(0);
      setCurrentFileIndex(0);
      setTime({ elapsedSeconds: 0, startTime: undefined });
      toast.error("Error Compressing Videos");
    }
  };

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${process.env.NEXT_PUBLIC_URL}/download/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${process.env.NEXT_PUBLIC_URL}/download/ffmpeg-core.wasm`,
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
        {videoFiles.length > 0 ? (
          <VideoDisplay videoUrl={URL.createObjectURL(videoFiles[0].file)} />
        ) : (
          <CustomDropZone
            acceptedFiles={acceptedVideoFiles}
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
            {videoFiles.length > 0 && (
              <>
                <VideoInputDetails
                  onClear={() => {
                    setVideoFiles([]);
                    setStatus("notStarted");
                    setProgress(0);
                    setTime({ elapsedSeconds: 0 });
                  }}
                  videoFiles={videoFiles}
                />
                {videoFiles.length === 1 && (
                  <VideoTrim
                    disable={disableDuringCompression}
                    onVideoSettingsChange={setVideoSettings}
                    videoSettings={videoSettings}
                  />
                )}
              </>
            )}
            <VideoInputControl
              disable={disableDuringCompression}
              onVideoSettingsChange={setVideoSettings}
              videoSettings={videoSettings}
            />
            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              key="button"
              transition={{ type: "tween" }}
              className="bg-gray-100 border border-gray-200 rounded-2xl p-3 h-fit"
            >
              {status === "compressing" && (
                <div className="space-y-2">
                  <VideoCompressProgress
                    progress={progress}
                    seconds={time.elapsedSeconds}
                  />
                  {videoFiles.length > 1 && (
                    <p className="text-xs text-center opacity-70">
                      Compressing {currentFileIndex + 1} of {videoFiles.length}
                    </p>
                  )}
                </div>
              )}

              {(status === "notStarted" || status === "converted") && (
                <button
                  onClick={compress}
                  type="button"
                  className="bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-950 to-zinc-950 rounded-lg text-white/90 px-3.5 py-2.5 relative text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-500 focus:ring-zinc-950 w-full plausible-event-name=Compressed"
                >
                  Compress
                </button>
              )}
            </motion.div>
            {status === "converted" && videoFiles.length > 0 && (
              <VideoOutputDetails
                timeTaken={time.elapsedSeconds}
                videoFiles={videoFiles.filter((f) => f.outputBlob)}
                videoSettings={videoSettings}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default CompressVideo;
