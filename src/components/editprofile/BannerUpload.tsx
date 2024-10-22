import React, { useState } from "react";
import { Button, Box, Typography, IconButton } from "@mui/material";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import ImageCropper from "./ImageCropper";
import { useActiveAccount } from "thirdweb/react";
import EditIcon from '@mui/icons-material/Edit';

interface BannerUploadProps {
  banner: string;
  setBanner: (url: string) => void; // Set banner with the uploaded URL
}

const BannerUpload: React.FC<BannerUploadProps> = ({ banner, setBanner }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const account = useActiveAccount(); // Get wallet account details (SDK5)

  // Maximum file size in bytes (2MB)
  const maxFileSize = 2 * 1024 * 1024;

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const validTypes = ["image/jpeg", "image/png"];
        if (!validTypes.includes(file.type)) {
          setError("Invalid file type. Please upload a PNG or JPEG image.");
          return;
        }
        if (file.size > maxFileSize) {
          setError("File is too large. Maximum size is 2MB.");
          return;
        }

        setError(null);
        setSelectedFile(file);
        setOpenCropper(true);
      }
    },
  });

  // Handle after cropping is done and send image to the backend
// Handle after cropping is done and send image to the backend
const handleCropComplete = async (croppedBase64Image: string) => {
  setCroppedImage(croppedBase64Image); // Preview cropped image locally
  setOpenCropper(false);

  // Upload the image to the backend
  const uploadedUrl = await uploadBanner(croppedBase64Image); // Use Base64 here
  if (uploadedUrl) {
    setBanner(uploadedUrl); // Update the parent with the URL received from the backend
  }
};

// Upload Base64 image to the backend
const uploadBanner = async (base64Image: string): Promise<string | null> => {
  try {
    const response = await axios.post("https://api.visioncommunity.xyz/v02/image/upload", {
      banner: base64Image, // Sending Base64 banner data instead of file
      walletAddress: account?.address, // Pass the wallet address from active account (SDK5)
    });

    if (response.data.success) {
      return response.data.bannerUrl; // Return the URL of the uploaded image
    } else {
      setError("Failed to upload banner. Please try again.");
      return null;
    }
  } catch (error) {
    setError("Error uploading banner. Please try again.");
    return null;
  }
};


  const handleCloseCropper = () => {
    setOpenCropper(false);
    setSelectedFile(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Box textAlign="center">
      <Box component="img" src={croppedImage || banner} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: '5px' }}/>
      <IconButton variant="contained" {...getRootProps()} className="btnpatronme"
    style={{
      position: "absolute",
      bottom: "10px",
      right: "10px",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "white",
    }}
      >
        <input {...getInputProps()} />
        <EditIcon />
      </IconButton>

      {error && (
        <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
          {error}
        </Typography>
      )}

      {selectedFile && openCropper && (
        <ImageCropper file={selectedFile} onCropComplete={handleCropComplete} onClose={handleCloseCropper} aspectRatio={4 / 1} maxWidth={1280} />
      )}
    </Box>
  );
};

export default BannerUpload;
