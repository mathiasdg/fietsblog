import { readdir, mkdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const sourceDir = "./img";
const outputDir = "./processed";
const maxWidth = 1234;
const maxHeight = 870;

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB"];
  if (bytes === 0) return "0 Byte";
  const i = Number.parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
}

async function processImagesInDir(dir, outputSubDir) {
  try {
    const files = await readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const inputPath = join(dir, file.name);
      const outputPath = join(outputSubDir, `${parse(file.name).name}.webp`);

      if (file.isDirectory()) {
        // If it's a directory, recurse into it
        const newOutputDir = join(outputDir, inputPath.replace(sourceDir, ""));
        await mkdir(newOutputDir, { recursive: true });
        await processImagesInDir(inputPath, newOutputDir);
      } else if (/\.(webp|jpg|jpeg|png)$/i.test(file.name)) {
        try {
          // Get original file size
          const originalStats = await stat(inputPath);
          const originalSize = originalStats.size;

          const image = sharp(inputPath);
          const metadata = await image.metadata();

          const aspectRatio = metadata.width / metadata.height;
          let newWidth = metadata.width;
          let newHeight = metadata.height;

          if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = Math.round(maxWidth / aspectRatio);
          }

          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = Math.round(maxHeight * aspectRatio);
          }

          await image
            .resize(newWidth, newHeight, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .webp()
            .toFile(outputPath);

          // Get new file size
          const newStats = await stat(outputPath);
          const newSize = newStats.size;
          const savingsPercent = (
            ((originalSize - newSize) / originalSize) *
            100
          ).toFixed(2);

          console.log(`✅ Processed: ${inputPath}`);
          console.log(
            `   Size: ${formatBytes(originalSize)} → ${formatBytes(
              newSize
            )} (${savingsPercent}% smaller)`
          );
          console.log(
            `   Dimensions: ${metadata.width}x${metadata.height} → ${newWidth}x${newHeight}`
          );
          console.log("----------------------------------------");
        } catch (err) {
          console.error(`❌ Error processing ${inputPath}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error(`Failed to process directory: ${dir}`, err);
  }
}

async function processImages() {
  console.log("🔍 Scanning for images...");

  try {
    await mkdir(outputDir, { recursive: true });
    await processImagesInDir(sourceDir, outputDir);

    console.log("\n🎉 Image processing complete!");
    console.log(`Processed images are in: ${outputDir}`);
  } catch (err) {
    console.error("❌ Failed to process images:", err);
  }
}

processImages();