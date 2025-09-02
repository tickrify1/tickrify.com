// utils/toDataURL.ts
export async function fileToDataURL(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  const mime = file.type || "image/png";
  return `data:${mime};base64,${base64}`;
}
