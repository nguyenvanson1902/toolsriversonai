import React, { useState, useRef } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  title: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, title }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary', 'shadow-glow-primary');
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       onImageUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-primary', 'shadow-glow-primary');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary', 'shadow-glow-primary');
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col">
      <h3 className="text-lg font-semibold mb-3 text-center text-light-text">{title}</h3>
      <div
        className="w-full aspect-video bg-dark-bg-2/50 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-glow-primary"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        {preview ? (
          <img src={preview} alt="Xem trước ảnh" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="text-center text-gray-text p-4">
            <UploadIcon />
            <p className="mt-2 font-medium">Kéo thả hoặc nhấn để tải ảnh</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;