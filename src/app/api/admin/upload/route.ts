import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary not configured." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10 MB." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, GIF allowed." },
        { status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "rignova/products";

    // Cloudinary signature: sorted params + secret
    const paramStr = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash("sha1")
      .update(paramStr + apiSecret)
      .digest("hex");

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", String(timestamp));
    uploadForm.append("signature", signature);
    uploadForm.append("folder", folder);

    // Log what we're sending for debugging
    console.log(`[upload] cloud=${cloudName} key=${apiKey.slice(0, 6)}... ts=${timestamp}`);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const res = await fetch(cloudinaryUrl, {
      method: "POST",
      body: uploadForm,
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("[upload] Cloudinary rejected:", JSON.stringify(result));
      return NextResponse.json(
        { error: result?.error?.message ?? "Cloudinary upload failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      url: result.secure_url as string,
      publicId: result.public_id as string,
      width: result.width as number,
      height: result.height as number,
    });
  } catch (error) {
    console.error("[upload] route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
