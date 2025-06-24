import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const userImage = formData.get("userImage") as File;
  const productImage = formData.get("productImage") as string;

  if (!userImage || !productImage) {
    return NextResponse.json({ error: "Missing user or product image." }, { status: 400 });
  }

  // Convert user image to base64 with prefix
  const userBuffer = await userImage.arrayBuffer();
  const userBase64 = `data:${userImage.type};base64,${Buffer.from(userBuffer).toString("base64")}`;

  try {
    // 1. Start prediction
    const runRes = await fetch("https://api.fashn.ai/v1/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FASHN_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model_image: userBase64,
        garment_image: productImage,
        category: "auto",
        segmentation_free: true,
        moderation_level: "permissive",
        garment_photo_type: "auto",
        mode: "balanced",
        seed: 42,
        num_samples: 1,
        output_format: "png",
        return_base64: false,
      }),
    });
    const runData = await runRes.json();
    if (!runRes.ok || !runData.id) {
      return NextResponse.json({ error: runData.error || "Failed to start prediction." }, { status: 500 });
    }

    // 2. Poll for status
    let output = null;
    let error = null;
    for (let i = 0; i < 20; i++) { // up to ~40s
      await new Promise((r) => setTimeout(r, 2000));
      const statusRes = await fetch(`https://api.fashn.ai/v1/status/${runData.id}`, {
        headers: { "Authorization": `Bearer ${process.env.FASHN_AI_API_KEY}` },
      });
      const statusData = await statusRes.json();
      if (statusData.status === "completed" && statusData.output && statusData.output[0]) {
        output = statusData.output[0];
        break;
      }
      if (statusData.status === "failed") {
        error = statusData.error || "Prediction failed.";
        break;
      }
    }

    if (output) {
      return NextResponse.json({ resultImageUrl: output });
    } else {
      return NextResponse.json({ error: error || "Prediction timed out." }, { status: 500 });
    }
  } catch (error) {
    console.error("Error calling Fashn AI API:", error);
    return NextResponse.json({ error: "Virtual try-on failed." }, { status: 500 });
  }
}
