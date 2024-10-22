// ImageCroppers.tsx
import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { Button, Box, Slider, Typography, Modal } from "@mui/material";
import getCroppedImg from "./cropImage"; // Helper function

interface ImageCropperProps {
  file: File;
  onCropComplete: (croppedImage: string) => void;
  onClose: () => void;
  aspectRatio: number; // Aspect ratio for cropping
  maxWidth: number;    // Maximum width for resizing
}

const ImageCropper: React.FC<ImageCropperProps> = ({ file, onCropComplete, onClose, aspectRatio, maxWidth }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropCompleteHandler = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

const handleCropSave = async () => {
  const croppedImageBase64 = await getCroppedImg(URL.createObjectURL(file), croppedAreaPixels, maxWidth);
  onCropComplete(croppedImageBase64); // Send Base64 image back to parent
  onClose(); // Close modal after save
};

  return (
    <Modal open onClose={onClose} sx={{ zIndex: 1300 }}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {/* Cropper area */}
        <Box width="100%" height="60%" position="relative" sx={{ maxWidth: 800 }}>
          <Cropper
            image={URL.createObjectURL(file)}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio} // Use dynamic aspect ratio
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteHandler}
          />
        </Box>

        {/* Zoom Slider */}
        <Box width="50%" mt={2}>
          <Typography variant="body2" color="white">
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, zoomValue) => setZoom(zoomValue as number)}
            sx={{ color: "white" }}
          />
        </Box>

        {/* Control buttons */}
        <Box mt={3} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleCropSave}>
            Crop & Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImageCropper;
