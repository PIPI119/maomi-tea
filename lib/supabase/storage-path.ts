/** Extract storage object path from a Supabase public URL for `storage.from(bucket).remove([path])`. */
export function publicUrlToStoragePath(
  publicUrl: string,
  bucket: string,
): string | null {
  const needle = `/storage/v1/object/public/${bucket}/`;
  const i = publicUrl.indexOf(needle);
  if (i === -1) return null;
  return decodeURIComponent(publicUrl.slice(i + needle.length));
}
