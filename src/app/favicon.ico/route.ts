import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "icon.svg");
    const svgContent = fs.readFileSync(filePath, "utf8");
    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new NextResponse("", { status: 404 });
  }
}
