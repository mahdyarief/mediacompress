import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { FileActions, ImageInputSettings } from "~/types";
import UPNG from "upng-js";

function removeFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return fileName.slice(0, lastDotIndex);
  }
  return fileName;
}

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return fileName.slice(lastDotIndex + 1).toLowerCase();
  }
  return "";
}

function toSnakeCase(fileName: string): string {
  // Get filename without extension
  const nameWithoutExt = removeFileExtension(fileName);

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
}

function addFormatSpecificOptions(
  command: string[],
  format: string,
  quality?: number
) {
  switch (format.toLowerCase()) {
    case "webp":
      // For WebP, use quality parameter (0-100, where 100 is best)
      if (quality !== undefined) {
        command.push("-quality", quality.toString());
      } else {
        command.push("-quality", "80"); // Default quality
      }
      command.push("-compression_level", "6"); // 0-6, higher = better compression but slower
      break;
    case "jpg":
    case "jpeg":
      // For JPEG, use q:v parameter (1-31, lower is better quality)
      if (quality !== undefined) {
        // Convert 0-100 scale to 1-31 scale (inverted)
        const jpegQuality = Math.max(
          1,
          Math.min(31, Math.round(31 - (quality * 30) / 100))
        );
        command.push("-q:v", jpegQuality.toString());
      } else {
        command.push("-q:v", "5"); // Default quality (high)
      }
      break;
    case "png":
      // PNG is lossless, but we can set compression level
      // Convert quality (0-100) to compression level (0-9)
      // For PNG: 0 = no compression (fastest, largest), 9 = best compression (slowest, smallest)
      // We invert: higher quality setting = lower compression (faster, larger file)
      if (quality !== undefined) {
        // Invert: higher quality = lower compression level
        // Medium (80) should give compression level around 2-3
        const compressionLevel = Math.max(
          0,
          Math.min(9, Math.round(9 - (quality * 9) / 100))
        );
        // Use -compression_level for PNG (this is the correct flag)
        command.push("-compression_level", compressionLevel.toString());
      } else {
        command.push("-compression_level", "6"); // Default compression
      }
      break;
    case "gif":
      // GIF compression - use quality for color quantization
      if (quality !== undefined) {
        // Lower quality = fewer colors = smaller file
        const colors = Math.max(
          2,
          Math.min(256, Math.round((quality * 254) / 100 + 2))
        );
        command.push("-colors", colors.toString());
      }
      break;
    case "bmp":
      // BMP is uncompressed, convert to PNG for compression
      // This will be handled by output format
      break;
    case "avif":
      // AVIF uses quality parameter (0-100)
      if (quality !== undefined) {
        command.push("-quality", quality.toString());
      } else {
        command.push("-quality", "80"); // Default quality
      }
      break;
    default:
      // For other formats, just convert
      break;
  }
}

export default async function convertImage(
  ffmpeg: FFmpeg,
  actionFile: FileActions,
  imageSettings: ImageInputSettings
): Promise<any> {
  const { file, fileName } = actionFile;
  const output =
    toSnakeCase(fileName) + "-converted." + imageSettings.imageType;

  // Write input file to FFmpeg's virtual file system
  ffmpeg.writeFile(fileName, await fetchFile(file));

  // Build FFmpeg command for image conversion
  const command = ["-i", fileName];

  // Add format-specific options
  addFormatSpecificOptions(
    command,
    imageSettings.imageType,
    imageSettings.quality
  );

  // Add output format
  command.push(output);

  console.log("FFmpeg command:", command.join(" "));
  await ffmpeg.exec(command);

  // Read the converted file
  const data = await ffmpeg.readFile(output);
  const blob = new Blob([data], { type: `image/${imageSettings.imageType}` });
  const url = URL.createObjectURL(blob);

  return { url, output, outputBlob: blob };
}

// PNG compression using upng-js library for actual compression
async function compressPNGWithUPNG(
  file: File,
  fileName: string,
  quality: number
): Promise<{ url: string; output: string; outputBlob: Blob }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file"));
          return;
        }

        // Decode PNG using UPNG
        const png = UPNG.decode(arrayBuffer);
        if (!png) {
          reject(new Error("Failed to decode PNG"));
          return;
        }

        console.log("PNG decoded:", {
          width: png.width,
          height: png.height,
          frames: png.frames.length,
          originalSize: file.size,
        });

        // Convert quality (0-100) to compression level (0-9)
        // Lower quality = higher compression = smaller file
        // Medium (80) = compression level 2 (good compression)
        // High (90) = compression level 1 (less compression)
        // Low (70) = compression level 3 (more compression)
        const compressionLevel = Math.max(
          0,
          Math.min(9, Math.round(9 - (quality * 9) / 100))
        );

        console.log(
          "Compressing PNG with level:",
          compressionLevel,
          "(quality:",
          quality + ")"
        );

        // Encode PNG with compression
        // UPNG.encode will apply compression automatically
        // The library uses zlib compression which should reduce file size
        const rgba = UPNG.toRGBA8(png); // Get all frames as RGBA arrays
        const frameDelays = png.frames.map((f) => f.delay || 0);

        // UPNG.encode(rgba, width, height, cnum, dels, quality)
        // For better compression with quality control, we can adjust the approach
        // Lower quality = more compression = smaller file
        // Convert quality (0-100) to a compression factor
        // Quality 80 (Medium) = good compression
        // Quality 90 (High) = less compression
        // Quality 70 (Low) = more compression

        // For lossless compression, keep all colors (cnum = 0)
        // UPNG's internal zlib compression will reduce file size
        // For lossy compression with smaller files, use palette reduction (cnum > 0)
        // Based on quality setting: lower quality = more aggressive compression
        const useLossyCompression = quality < 80; // Use palette for lower quality
        const colorCount = useLossyCompression
          ? Math.max(2, Math.min(256, Math.round(256 - quality * 2.5)))
          : 0; // 0 = lossless, >0 = palette (lossy but smaller)

        const compressed = UPNG.encode(
          rgba,
          png.width,
          png.height,
          colorCount, // 0 = lossless, >0 = palette reduction (lossy)
          frameDelays,
          0 // quality (0 = default compression)
        );

        if (!compressed) {
          reject(new Error("Failed to compress PNG"));
          return;
        }

        const output = toSnakeCase(fileName) + ".png";
        const blob = new Blob([compressed], { type: "image/png" });
        const url = URL.createObjectURL(blob);

        console.log("PNG compressed successfully:", {
          output,
          originalSize: file.size,
          compressedSize: blob.size,
          reduction: ((1 - blob.size / file.size) * 100).toFixed(2) + "%",
          compressionLevel,
        });

        resolve({
          url,
          output,
          outputBlob: blob,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

export async function compressImage(
  ffmpeg: FFmpeg,
  actionFile: FileActions,
  imageSettings: ImageInputSettings
): Promise<any> {
  const { file, fileName } = actionFile;
  const originalExtension = getFileExtension(fileName);

  console.log("compressImage called with:", {
    fileName,
    originalExtension,
    mode: imageSettings.mode,
    fileType: file.type,
  });

  // For PNG, use Canvas API since FFmpeg.wasm doesn't reliably support PNG encoding
  // Check both extension and MIME type to be sure
  const isPNG =
    originalExtension === "png" ||
    file.type === "image/png" ||
    fileName.toLowerCase().endsWith(".png");

  if (isPNG) {
    console.log("✅ Detected PNG file - Using Canvas API for PNG compression");
    console.log("File details:", {
      fileName,
      originalExtension,
      fileType: file.type,
      fileSize: file.size,
    });
    try {
      const result = await compressPNGWithUPNG(
        file,
        fileName,
        imageSettings.quality || 80
      );
      console.log("✅ Canvas compression successful:", {
        output: result.output,
        blobSize: result.outputBlob.size,
        url: result.url,
        blobType: result.outputBlob.type,
      });

      // Verify the output is actually PNG
      if (!result.output.toLowerCase().endsWith(".png")) {
        console.error(
          "❌ Output filename doesn't end with .png:",
          result.output
        );
        // Fix it!
        result.output = toSnakeCase(fileName) + ".png";
      }

      // Verify blob type is PNG
      if (result.outputBlob.type !== "image/png") {
        console.warn(
          "⚠️ Blob type is not image/png, it's:",
          result.outputBlob.type,
          "- fixing it"
        );
        // Create a new blob with correct type
        result.outputBlob = new Blob([result.outputBlob], {
          type: "image/png",
        });
        result.url = URL.createObjectURL(result.outputBlob);
      }

      console.log("✅ Final PNG result:", {
        output: result.output,
        blobType: result.outputBlob.type,
      });

      return result;
    } catch (error) {
      console.error("❌ Canvas compression failed:", error);
      throw error; // Re-throw to be caught by caller - don't fall through to FFmpeg
    }
  }

  console.log("Using FFmpeg for compression (not PNG)");

  // Safety check: Never use FFmpeg for PNG in compress mode
  if (originalExtension === "png" || file.type === "image/png") {
    throw new Error(
      "PNG compression should use Canvas API, but it wasn't called. This is a bug."
    );
  }

  // Keep the same format for compression
  const output = toSnakeCase(fileName) + "." + originalExtension;

  // Write input file to FFmpeg's virtual file system
  ffmpeg.writeFile(fileName, await fetchFile(file));

  // Build FFmpeg command for image compression
  const command = ["-i", fileName];

  // Add format-specific compression options
  addFormatSpecificOptions(command, originalExtension, imageSettings.quality);

  // For BMP, convert to PNG for compression (use Canvas for PNG output)
  if (originalExtension === "bmp") {
    // Convert BMP to PNG using UPNG (first convert to PNG via Canvas, then compress)
    // For BMP, we need to convert to PNG first using Canvas, then compress with UPNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to convert BMP to PNG"));
            return;
          }

          // Now compress the PNG using UPNG
          blob.arrayBuffer().then((arrayBuffer) => {
            const png = UPNG.decode(arrayBuffer);
            if (!png) {
              reject(new Error("Failed to decode PNG"));
              return;
            }

            const rgba = UPNG.toRGBA8(png)[0];
            const quality = imageSettings.quality || 80;
            const compressionLevel = Math.max(
              0,
              Math.min(9, Math.round(9 - (quality * 9) / 100))
            );
            const compressed = UPNG.encode(
              [rgba],
              png.width,
              png.height,
              0,
              compressionLevel
            );

            if (!compressed) {
              reject(new Error("Failed to compress PNG"));
              return;
            }

            const output = toSnakeCase(fileName) + ".png";
            const outputBlob = new Blob([compressed], { type: "image/png" });
            const url = URL.createObjectURL(outputBlob);

            resolve({ url, output, outputBlob });
          });
        }, "image/png");
      };

      img.onerror = () => reject(new Error("Failed to load BMP image"));
      img.src = URL.createObjectURL(file);
    });
  }

  // For other formats (JPG, JPEG, WebP, GIF, AVIF), use FFmpeg
  // Explicitly set codec and format to ensure same format as input
  const codecMap: Record<string, string> = {
    jpg: "mjpeg",
    jpeg: "mjpeg",
    webp: "libwebp",
    gif: "gif",
    avif: "libavif",
  };

  const formatMap: Record<string, string> = {
    jpg: "image2",
    jpeg: "image2",
    webp: "webp",
    gif: "gif",
    avif: "avif",
  };

  const codec = codecMap[originalExtension];
  const ffmpegFormat = formatMap[originalExtension] || "image2";

  // For single image frames, ensure we only output one frame
  command.push("-frames:v", "1");

  // Explicitly set codec to ensure same format output
  if (codec) {
    command.push("-c:v", codec);
  }

  // Set format explicitly
  command.push("-f", ffmpegFormat, output);

  console.log("FFmpeg command:", command.join(" "));
  await ffmpeg.exec(command);

  // List all files to debug what FFmpeg actually created
  const files = await ffmpeg.listDir("/");
  console.log("Files in FFmpeg filesystem after execution:", files);

  // Try to read the expected output file
  let data: Uint8Array;
  let actualOutput = output;

  try {
    data = (await ffmpeg.readFile(output)) as Uint8Array;
    console.log("Successfully read expected output file:", output);
  } catch (error) {
    console.error("Failed to read expected output file:", output, error);
    // Try to find any file with similar name
    const matchingFiles = files.filter(
      (f: any) =>
        f.name.includes(removeFileExtension(fileName)) &&
        f.name.includes("compressed")
    );
    if (matchingFiles.length > 0) {
      actualOutput = matchingFiles[0].name;
      console.log("Found alternative output file:", actualOutput);
      data = (await ffmpeg.readFile(actualOutput)) as Uint8Array;
    } else {
      throw new Error(
        `Output file ${output} not found. Available files: ${files
          .map((f: any) => f.name)
          .join(", ")}`
      );
    }
  }

  const blob = new Blob([data], {
    type: file.type || `image/${originalExtension}`,
  });
  const url = URL.createObjectURL(blob);

  return { url, output: actualOutput, outputBlob: blob };
}
