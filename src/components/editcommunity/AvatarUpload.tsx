import React, { useState, useEffect } from "react";
import { Avatar, Button, Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useActiveAccount } from "thirdweb/react";  // Updated for SDK v5
import ImageCropper from "./ImageCropper";

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
const handleCropComplete = async (croppedUrl: string) => {
    setCroppedImage(croppedUrl); // Preview cropped image locally
    setOpenCropper(false);

    // Upload the cropped image (croppedUrl is already a Base64 string)
    const uploadedUrl = await uploadAvatar(croppedUrl, account?.address);
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
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" sx={{ width: "100%" }}>
      <Avatar alt="Community Avatar" src={croppedImage || avatar} sx={{ width: 150, height: 150, marginBottom: 2 }} />

      <Button variant="contained" {...getRootProps()} className="btnpatronme">
        <input {...getInputProps()} />
        Change Avatar
      </Button>

      {error && (
        <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
          {error}
        </Typography>
      )}

      {selectedFile && openCropper && (
        <ImageCropper file={selectedFile} onCropComplete={handleCropComplete} onClose={handleCloseCropper} aspectRatio={1} maxWidth={500} />
      )}

      <Typography variant="subtitle1" gutterBottom className="descriptionsmall">
        Max Width: 500px
      </Typography>
    </Box>
  );
};

export default AvatarUpload;
