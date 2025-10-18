import ImageKit from "imagekit";
import multer from "multer";

// Initialize ImageKit SDK from environment variables
const imagekit = new ImageKit({
  publicKey: process.env.IMGKIT_PUBKEY,
  privateKey: process.env.IMGKIT_PRIVKEY,
  urlEndpoint: process.env.IMGKIT_ENDPOINT,
});

// Configure multer to store files in memory
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

export const uploadToImageKit = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Upload the file from buffer to ImageKit
  imagekit.upload({
    file: req.file.buffer,
    fileName: `product_${Date.now()}_${req.file.originalname}`,
    folder: "/teacups_products/",
  }, (error, result) => {
    if (error) {
      console.error("ImageKit upload error:", error);
      return res.status(500).json({ message: "Error uploading image." });
    }
    req.body.image = result.url;
    next();
  });
};
