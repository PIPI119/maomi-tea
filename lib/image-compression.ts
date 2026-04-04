import imageCompression from "browser-image-compression";

/** Product photos: max 800px, ≤100KB, WebP — runs automatically after file pick in admin. */
export async function compressProductImage(file: File): Promise<File> {
  const blob = await imageCompression(file, {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: "image/webp",
  });
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}

/** Brand logo: max 200px, ≤50KB, WebP — used by admin brand tab before upload. */
export async function compressBrandLogo(file: File): Promise<File> {
  const blob = await imageCompression(file, {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 200,
    useWebWorker: true,
    fileType: "image/webp",
  });
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}
