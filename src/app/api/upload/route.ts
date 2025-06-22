import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // Convert file to a buffer
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  try {
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        // You can add folders or tags here if you want
      }, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      }).end(bytes);
    });

    // The result from Cloudinary will have a 'secure_url' property
    // We need to assert the type to access it
    const result = uploadResult as { secure_url: string };

    return NextResponse.json({
      message: "Upload successful",
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}