import ImageKit from "imagekit";
import multer from "multer";

console.log("IMAGEKIT-UPLOAD.JS: PubKey =", process.env.IMGKIT_PUBKEY);

// Initialize ImageKit SDK from environment variables
const imagekit = new ImageKit({
  publicKey: process.env.IMGKIT_PUBKEY,
  privateKey: process.env.IMGKIT_PRIVKEY,
  urlEndpoint: process.env.IMGKIT_ENDPOINT,
});

// Configure multer to store files in memory
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

// This is your original uploader for products
export const uploadToImageKit = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  imagekit.upload(
    {
      file: req.file.buffer,
      fileName: `product_${Date.now()}_${req.file.originalname}`,
      folder: "/teacups_products/", // Product folder
    },
    (error, result) => {
      if (error) {
        console.error("ImageKit upload error:", error);
        return res.status(500).json({ message: "Error uploading image." });
      }
      req.body.image = result.url;
      next();
    }
  );
};

// --- NEW FUNCTION FOR PROFILE PICTURES ---
export const uploadProfileToImageKit = (req, res, next) => {
  if (!req.file) {
    return next(); // No file, just skip to the next middleware
  }

  // Upload the file from buffer to ImageKit
  imagekit.upload(
    {
      file: req.file.buffer,
      fileName: `user_${req.body.userId || "unknown"}_${Date.now()}`,
      folder: "/user_profile/", // As requested
    },
    (error, result) => {
      if (error) {
        console.error("ImageKit profile upload error:", error);
        return res.status(500).json({ message: "Error uploading profile image." });
      }
      // Add the new image URL to req.body so the next route can save it
      req.body.image = result.url;
      next();
    }
  );
};