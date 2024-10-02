export default async function getCroppedImg(imageSrc: string, pixelCrop: any, maxWidth: number) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Set the canvas size to the cropped area
  canvas.width = pixelCrop.width * scaleX;
  canvas.height = pixelCrop.height * scaleY;

  ctx?.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Resize the image if it exceeds the maxWidth
  if (canvas.width > maxWidth) {
    const resizeRatio = maxWidth / canvas.width;
    const newHeight = canvas.height * resizeRatio;

    const resizedCanvas = document.createElement("canvas");
    resizedCanvas.width = maxWidth;
    resizedCanvas.height = newHeight;

    const resizedCtx = resizedCanvas.getContext("2d");
    resizedCtx?.drawImage(canvas, 0, 0, maxWidth, newHeight);

    return new Promise<string>((resolve, reject) => {
      resizedCanvas.toBlob((blob) => {
        if (!blob) {
          reject("Canvas is empty");
          return;
        }
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      }, "image/jpeg");
    });
  }

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject("Canvas is empty");
        return;
      }
      const fileUrl = URL.createObjectURL(blob);
      resolve(fileUrl);
    }, "image/jpeg");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.setAttribute("crossOrigin", "anonymous"); // To avoid CORS issues with some images
    img.src = url;
  });
}
