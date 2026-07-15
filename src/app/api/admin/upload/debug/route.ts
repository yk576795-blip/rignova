import { NextResponse } from "next/server";

// Temporary debug route — DELETE after fixing upload
export async function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY ?? "";

  // Show char codes to detect invisible characters
  const charCodes = cloudName.split("").map((c) => ({
    char: c,
    code: c.charCodeAt(0),
  }));

  return NextResponse.json({
    cloudName,
    cloudNameLength: cloudName.length,
    charCodes,
    apiKeyPrefix: apiKey.slice(0, 6),
    // Test if cloud name works with Cloudinary ping
    testUrl: `https://api.cloudinary.com/v1_1/${cloudName}/ping`,
  });
}
