import React, { useState, useEffect } from "react";
import { Avatar, Button, Box, Typography, IconButton } from "@mui/material";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useActiveAccount } from "thirdweb/react";  // Updated for SDK v5
import ImageCropper from "./ImageCropper";
import EditIcon from '@mui/icons-material/Edit';

interface AvatarUploadProps {
  avatar: string;
  setAvatar: (url: string) => void; // Updated to set the URL instead of Base64
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ avatar, setAvatar }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the active account using SDK v5 hook
  const account = useActiveAccount();  // SDK v5, fetches both address and other wallet details

  // Maximum file size in bytes (3MB)
  const maxFileSize = 3 * 1024 * 1024;

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
          setError("File is too large. Maximum size is 3MB.");
          return;
        }

        setError(null);
        setSelectedFile(file);
        setOpenCropper(true);
      }
    },
  });

  // Handle after cropping is done and send image to the backend
const handleCropComplete = async (croppedBase64Image: string) => {
  setCroppedImage(croppedBase64Image); // Preview cropped image locally
  setOpenCropper(false);

  // Upload the cropped Base64 image to the backend (no need for fileToBase64)
  const uploadedUrl = await uploadAvatar(croppedBase64Image, account?.address);
  if (uploadedUrl) {
    setAvatar(uploadedUrl); // Update the parent with the URL received from the backend
  }
};

  // Upload Base64 image to the backend
  const uploadAvatar = async (base64Image: string, walletAddress: string | undefined): Promise<string | null> => {
    if (!walletAddress) {
      setError("Wallet not connected. Please connect your wallet.");
      return null;
    }

    try {
      const response = await axios.post("https://api.visioncommunity.xyz/v02/image/upload", {
        avatar: base64Image,
        walletAddress: walletAddress, // Ensure the wallet address is sent with the image
      });

      if (response.data.success) {
        return response.data.avatarUrl; // Return the URL of the uploaded image
      } else {
        setError("Failed to upload avatar. Please try again.");
        return null;
      }
    } catch (error) {
      console.error("Error uploading avatar:", error); // Log error
      setError("Error uploading avatar. Please try again.");
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
<Box position="relative" left="50%" bottom="-50px" style={{ transform: "translateX(-50%)" }}>
  {/* Avatar with relative positioning */}
  <Avatar alt="Community Avatar" src={croppedImage || avatar} sx={{ width: 120, height: 120, position: 'relative', border: "3px solid #fff" }} />

  {/* Pencil Icon inside the Avatar */}
  <IconButton
    variant="contained"
    {...getRootProps()}
    className="btnpatronme"
    style={{
      position: "absolute",
      bottom: "30px",
      right: "0px",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "white",
    }}
  >
    <input {...getInputProps()} />
    <EditIcon />
  </IconButton>

  {/* Error message */}
  {error && (
    <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
      {error}
    </Typography>
  )}

  {/* Cropper component */}
  {selectedFile && openCropper && (
    <ImageCropper
      file={selectedFile}
      onCropComplete={handleCropComplete}
      onClose={handleCloseCropper}
      aspectRatio={1}
      maxWidth={800}
    />
  )}

  {/* Description */}
  <Typography variant="subtitle1" gutterBottom className="descriptionsmall profiledescsmall">
    Max Width: 800px
  </Typography>
</Box>


  );
};

export default AvatarUpload;
