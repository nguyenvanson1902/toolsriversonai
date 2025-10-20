import React, { useState } from 'react';
import type { HistoryItem } from '../App';
import { DownloadIcon, ReuseIcon } from './Icons';
import ImagePreviewModal from './ImagePreviewModal';

interface HistoryItemCardProps {
  item: HistoryItem;
  onReuse: (item: HistoryItem) => void;
}

const HistoryItemCard: React.FC<HistoryItemCardProps> = ({ item, onReuse }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = item.generatedImage;
        link.download = `anh-sang-tao-ai-${item.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReuseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onReuse(item);
    }

    const formattedDate = new Date(item.timestamp).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    if (!item.generatedImage) {
        return (
            <div className="group relative aspect-square bg-dark-bg-2/50 rounded-lg overflow-hidden border-2 border-primary/20 flex flex-col justify-between p-3 animate-fade-in shadow-emboss-inset">
                <div>
                    <p className="text-xs text-yellow-400 font-semibold">Chỉ xem</p>
                    <p className="text-xs text-gray-text mt-1">Ảnh không được lưu để tiết kiệm dung lượng.</p>
                </div>
                <div className="text-left">
                    <p className="text-xs text-light-text line-clamp-3 font-medium" title={item.prompt}>{item.prompt || 'Không có mô tả'}</p>
                    <p className="text-xs text-gray-text mt-1">{formattedDate}</p>
                     <button
                        onClick={handleReuseClick}
                        className="mt-2 w-full flex items-center justify-center p-1.5 bg-dark-bg-2/50 text-primary text-xs rounded-md backdrop-blur-sm hover:bg-primary hover:text-dark-bg transition-colors shadow-emboss hover:shadow-glow-primary active:shadow-emboss-inset"
                        aria-label="Tái sử dụng cài đặt"
                        title="Tái sử dụng cài đặt"
                    >
                        <ReuseIcon />
                        <span className="ml-1.5">Dùng lại</span>
                    </button>
                </div>
            </div>
        );
    }


    return (
        <>
            <div 
                className="group relative aspect-square bg-dark-bg-2/50 rounded-lg overflow-hidden cursor-pointer border-2 border-primary/20 hover:border-primary transition-all duration-300 animate-fade-in shadow-emboss hover:shadow-glow-primary"
                onClick={() => setIsModalOpen(true)}
                title="Nhấn để xem ảnh lớn"
            >
                <img src={item.generatedImage} alt={`Ảnh được tạo cho mô tả: ${item.prompt}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <p className="text-xs text-light-text line-clamp-2" title={item.prompt}>{item.prompt}</p>
                    <p className="text-xs text-gray-text mt-1">{formattedDate}</p>
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <button
                        onClick={handleDownload}
                        className="p-2 bg-dark-surface/80 text-light-text rounded-full backdrop-blur-sm hover:bg-primary hover:text-dark-bg hover:shadow-glow-primary transition-all"
                        aria-label="Tải xuống"
                        title="Tải xuống"
                    >
                        <DownloadIcon />
                    </button>
                    <button
                        onClick={handleReuseClick}
                        className="p-2 bg-dark-surface/80 text-light-text rounded-full backdrop-blur-sm hover:bg-secondary hover:text-dark-bg hover:shadow-glow-secondary transition-all"
                        aria-label="Tái sử dụng cài đặt"
                        title="Tái sử dụng cài đặt"
                    >
                        <ReuseIcon />
                    </button>
                </div>
            </div>
            {isModalOpen && (
                <ImagePreviewModal imageUrl={item.generatedImage} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
};

export default HistoryItemCard;