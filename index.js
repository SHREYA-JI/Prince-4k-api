const express = require("express");
const cors = require("cors");
const sharp = require("sharp");
const multer = require("multer");
require("dotenv").config();

const app = express();
app.use(cors());

const upload = multer({ limits: { fileSize: 20 * 1024 * 1024 } });

const API_KEY = process.env.API_KEY;

// 🔐 API Key Middleware
app.use("/api", (req, res, next) => {
  const key = req.query.apikey;
  if (!key || key !== API_KEY) {
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }
  next();
});

// 🚀 4K Upscale Endpoint
app.post("/api/upscale", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: "Image required" });
    }

    const inputBuffer = req.file.buffer;

    const metadata = await sharp(inputBuffer).metadata();

    // Calculate upscale to 4K width (3840)
    const newWidth = 3840;
    const newHeight = Math.round(
      (metadata.height / metadata.width) * newWidth
    );

    const outputBuffer = await sharp(inputBuffer)
      .resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3
      })
      .sharpen()
      .modulate({
        brightness: 1.05,
        saturation: 1.05
      })
      .toFormat("jpeg", { quality: 95 })
      .toBuffer();

    res.set("Content-Type", "image/jpeg");
    res.send(outputBuffer);

  } catch (err) {
    console.error("UPSCALE ERROR:", err);
    res.status(500).json({ status: false, message: "Upscale failed" });
  }
});

app.get("/", (req, res) => {
  res.json({ status: true, message: "Rakib 4K Upscale API Running 🚀" });
});

app.listen(process.env.PORT || 3000, () =>
  console.log("4K API Running 😎")
);
