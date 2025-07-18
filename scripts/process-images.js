import { readdir, mkdir, stat, readFile, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";
const path = "./public/images/slaapspots";
const sourceDir = `${path}/raw`;
const outputDir = path;
const maxWidth = 369;
const maxHeight = 369;

const overnachtingenJsonPath = "./public/overnachtingen.json";

function formatBytes(bytes) {
	const sizes = ["Bytes", "KB", "MB"];
	if (bytes === 0) return "0 Byte";
	const i = Number.parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
}

// Load overnachtingen.json and parse it
async function loadOvernachtingen() {
	const data = await readFile(overnachtingenJsonPath, "utf8");
	return JSON.parse(data);
}

// Save overnachtingen.json
async function saveOvernachtingen(obj) {
	await writeFile(
		overnachtingenJsonPath,
		JSON.stringify(obj, null, 4),
		"utf8"
	);
}

async function processImagesInDir(dir, outputSubDir, slaapCoordinaten) {
	try {
		const files = await readdir(dir, { withFileTypes: true });

		for (const file of files) {
			const inputPath = join(dir, file.name);
			const outputPath = join(outputSubDir, `${parse(file.name).name}.webp`);

			if (file.isDirectory()) {
				// If it's a directory, recurse into it
				const newOutputDir = join(outputDir, inputPath.replace(sourceDir, ""));
				await mkdir(newOutputDir, { recursive: true });
				await processImagesInDir(inputPath, newOutputDir, slaapCoordinaten);
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

					// Set tentPhoto to true if image name matches sleepspot index
					const match = file.name.match(/^(\d+)\./);
					if (match) {
						const index = Number.parseInt(match[1], 10) - 1;
						if (
							slaapCoordinaten[index] &&
							slaapCoordinaten[index].tentPhoto !== true
						) {
							slaapCoordinaten[index].tentPhoto = true;
							console.log(
								`===> Set tentPhoto: true for slaapCoordinaten[${index}] (${file.name})`
							);
						}
					}

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
							newSize,
						)} (${savingsPercent}% smaller)`,
					);
					console.log(
						`   Dimensions: ${metadata.width}x${metadata.height} → ${newWidth}x${newHeight}`,
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
		// Load overnachtingen.json
		const overnachtingenObj = await loadOvernachtingen();
		const slaapCoordinaten = overnachtingenObj.slaapCoordinaten;

		// await mkdir(outputDir, { recursive: true });
		await processImagesInDir(sourceDir, outputDir, slaapCoordinaten);

		// Save overnachtingen.json (after all images processed)
		await saveOvernachtingen(overnachtingenObj);

		console.log("\n🎉 Image processing complete!");
		console.log(`Processed images are in: ${outputDir}`);
	} catch (err) {
		console.error("❌ Failed to process images:", err);
	}
}

processImages();
