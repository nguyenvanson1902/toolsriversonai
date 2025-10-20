import React from 'react';
import type { HistoryItem } from '../App';
import { HistoryIcon, TrashIcon, ChevronDownIcon } from './Icons';
import HistoryItemCard from './HistoryItemCard';

interface HistoryProps {
  history: HistoryItem[];
  isVisible: boolean;
  onToggle: () => void;
  onClear: () => void;
  onReuse: (item: HistoryItem) => void;
}

const History: React.FC<HistoryProps> = ({ history, isVisible, onToggle, onClear, onReuse }) => {
  return (
    <div className="bg-dark-surface p-6 rounded-2xl border border-primary/20 backdrop-blur-xl shadow-2xl shadow-dark-bg/50">
      <button 
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left"
        aria-expanded={isVisible}
        aria-controls="history-panel"
      >
        <div className="flex items-center">
            <HistoryIcon />
            <h2 className="text-2xl font-semibold ml-3 bg-clip-text text-transparent bg-gradient-to-r from-light-text to-gray-text">
              Lịch sử Sáng tạo
            </h2>
        </div>
        <div className="flex items-center">
            {history.length > 0 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    className="flex items-center text-sm text-red-400 hover:text-red-300 transition-colors mr-4 px-3 py-1 rounded-md hover:bg-red-500/10"
                    aria-label="Xóa lịch sử"
                >
                    <TrashIcon />
                    <span className="ml-1 hidden sm:inline">Xóa tất cả</span>
                </button>
            )}
            <ChevronDownIcon isRotated={!isVisible} />
        </div>
      </button>

      {isVisible && (
        <div id="history-panel" className="mt-6 animate-fade-in">
          {history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {history.map(item => (
                <HistoryItemCard key={item.id} item={item} onReuse={onReuse} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-text py-8">
              Chưa có tác phẩm nào được tạo. Hãy bắt đầu sáng tạo!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default History;