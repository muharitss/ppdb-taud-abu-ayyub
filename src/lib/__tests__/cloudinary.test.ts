import { isPdfFile, getCloudinaryPreviewUrl } from "../cloudinary.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.equal = (a: unknown, b: unknown, message: string) => {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
};

console.log("Running cloudinary helper tests...");

// Test PDF detection
assert.equal(isPdfFile("file.pdf"), true, "file.pdf should be PDF");
assert.equal(isPdfFile("https://example.com/doc.PDF"), true, "uppercase PDF should be detected");
assert.equal(isPdfFile("https://example.com/doc.pdf?v=123"), true, "query param PDF should be detected");
assert.equal(isPdfFile("image.jpg"), false, "image.jpg is not PDF");
assert.equal(isPdfFile("image.png"), false, "image.png is not PDF");
assert.equal(isPdfFile(null), false, "null is not PDF");
assert.equal(isPdfFile(undefined), false, "undefined is not PDF");

// Test Cloudinary preview URL conversion
const rawPdf = "https://res.cloudinary.com/screenshottugas/image/upload/v1793164195/ppdb-taud/dokumen/doc.pdf";
assert.equal(
  getCloudinaryPreviewUrl(rawPdf),
  "https://res.cloudinary.com/screenshottugas/image/upload/v1793164195/ppdb-taud/dokumen/doc.jpg",
  "Cloudinary PDF should convert to JPG preview"
);

const withQuery = "https://res.cloudinary.com/demo/image/upload/sample.pdf?v=2";
assert.equal(
  getCloudinaryPreviewUrl(withQuery),
  "https://res.cloudinary.com/demo/image/upload/sample.jpg?v=2",
  "Cloudinary PDF with query param should convert to JPG keeping query"
);

const nonCloudinary = "https://supabase.co/storage/sample.pdf";
assert.equal(
  getCloudinaryPreviewUrl(nonCloudinary),
  nonCloudinary,
  "Non-cloudinary PDF should remain untouched"
);

const normalImage = "https://res.cloudinary.com/demo/image/upload/sample.png";
assert.equal(
  getCloudinaryPreviewUrl(normalImage),
  normalImage,
  "Normal image should remain untouched"
);

console.log("All cloudinary helper tests passed!");
