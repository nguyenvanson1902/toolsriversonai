import React, { useState } from 'react';
import { DownloadIcon, ImageIcon, ErrorIcon } from './Icons';
import ImagePreviewModal from './ImagePreviewModal';

interface ResultDisplayProps {
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImage, isLoading, error }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'anh-sang-tao-ai.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-text animate-pulse">
            <div className="animate-pulse-glow rounded-full p-4">
                <ImageIcon />
            </div>
            <p className="mt-2 font-medium">AI đang hòa trộn thế giới...</p>
            <p className="text-xs mt-1">Vui lòng chờ trong giây lát</p>
        </div>
      );
    }

    if (error) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-red-400 text-center p-4">
             <ErrorIcon />
            <p className="mt-2 font-semibold">Oops! Đã xảy ra lỗi</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        );
    }
    
    if (generatedImage) {
      return (
        <>
          <div className="relative group w-full h-full" title="Nhấn để xem ảnh lớn">
            <img 
              src={generatedImage} 
              alt="Ảnh kết quả" 
              className="w-full h-full object-contain rounded-lg cursor-pointer transition-transform duration-300 group-hover:scale-105 animate-fade-in"
              onClick={() => setIsModalOpen(true)}
            />
            <button 
              onClick={handleDownload}
              className="absolute top-3 right-3 p-2 bg-dark-surface text-light-text rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm hover:bg-primary hover:text-dark-bg hover:shadow-glow-primary focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-primary"
              aria-label="Tải xuống"
            >
              <DownloadIcon />
            </button>
          </div>
          {isModalOpen && (
            <ImagePreviewModal imageUrl={generatedImage} onClose={() => setIsModalOpen(false)} />
          )}
        </>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-text">
        <ImageIcon />
        <p className="mt-2 font-medium">Kiệt tác của bạn sẽ xuất hiện tại đây</p>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-dark-bg-2/50 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden shadow-emboss-inset">
      {renderContent()}
    </div>
  );
};

export default ResultDisplay;