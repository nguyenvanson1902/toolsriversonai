import React from 'react';
import { GenerateIcon, LoadingIcon, AspectRatioCustomIcon } from './Icons';
import type { AspectRatio, TextSize, FontFamily } from '../App';

interface ControlsProps {
  mode: 'fusion' | 'single' | 'branding';
  prompt: string;
  setPrompt: (prompt: string) => void;
  brandingStyle: string;
  setBrandingStyle: (style: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  customAspectRatioWidth: number;
  setCustomAspectRatioWidth: (width: number) => void;
  customAspectRatioHeight: number;
  setCustomAspectRatioHeight: (height: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isReady: boolean;
  isTextOverlayEnabled: boolean;
  setIsTextOverlayEnabled: (enabled: boolean) => void;
  overlayText: string;
  setOverlayText: (text: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
}

const OptionButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-semibold rounded-md transition-all duration-300 flex-1 shadow-emboss hover:shadow-glow-primary active:shadow-emboss-inset ${
            isActive
                ? 'shadow-emboss-inset bg-primary/20 text-primary'
                : 'bg-dark-bg-2/50 text-gray-text'
        }`}
        aria-pressed={isActive}
    >
        {label}
    </button>
);


const AspectRatioButton: React.FC<{
    label: string;
    ratio: AspectRatio;
    currentRatio: AspectRatio;
    onClick: (ratio: AspectRatio) => void;
    children: React.ReactNode;
}> = ({ label, ratio, currentRatio, onClick, children }) => {
    const isActive = ratio === currentRatio;
    return (
        <button
            onClick={() => onClick(ratio)}
            className={`flex flex-col items-center justify-between p-2 h-20 rounded-lg transition-all duration-300 shadow-emboss hover:shadow-glow-primary active:shadow-emboss-inset ${
                isActive
                    ? 'shadow-emboss-inset bg-primary/20 text-primary'
                    : 'bg-dark-bg-2/50 text-gray-text'
            }`}
            aria-pressed={isActive}
            aria-label={`Chọn khung hình ${label}`}
        >
            <div className="flex-grow w-full flex items-center justify-center p-1">
                {children}
            </div>
            <span className={`mt-1 text-xs font-semibold ${isActive ? 'text-primary' : 'text-gray-text'}`}>{label}</span>
        </button>
    );
};

const aspectRatios: { ratio: AspectRatio; label: string; visual: React.ReactNode }[] = [
    { ratio: '1:1', label: '1:1', visual: <div className="bg-gray-text/50 rounded-sm w-8 h-8"></div> },
    { ratio: '4:5', label: '4:5', visual: <div className="bg-gray-text/50 rounded-sm w-7 h-9"></div> },
    { ratio: '3:4', label: '3:4', visual: <div className="bg-gray-text/50 rounded-sm w-[27px] h-9"></div> },
    { ratio: '4:3', label: '4:3', visual: <div className="bg-gray-text/50 rounded-sm w-9 h-7"></div> },
    { ratio: '16:9', label: '16:9', visual: <div className="bg-gray-text/50 rounded-sm w-9 h-5"></div> },
    { ratio: '9:16', label: '9:16', visual: <div className="bg-gray-text/50 rounded-sm w-5 h-9"></div> },
    { ratio: 'custom', label: 'Tùy chỉnh', visual: <AspectRatioCustomIcon /> },
];

const brandingStyles = [
    { name: 'Chuyên nghiệp', description: 'Lý tưởng cho LinkedIn, hồ sơ công ty.' },
    { name: 'Sáng tạo', description: 'Thể hiện cá tính nghệ sĩ, độc đáo.' },
    { name: 'Tối giản', description: 'Phong cách sạch sẽ, hiện đại và tinh tế.' },
    { name: 'Thân thiện', description: 'Tạo cảm giác gần gũi, ấm áp.' },
    { name: 'Công nghệ', description: 'Vẻ ngoài hiện đại, tương lai.' },
];

const Controls: React.FC<ControlsProps> = ({ 
    mode, prompt, setPrompt, brandingStyle, setBrandingStyle, 
    aspectRatio, setAspectRatio, customAspectRatioWidth, setCustomAspectRatioWidth,
    customAspectRatioHeight, setCustomAspectRatioHeight, onGenerate, isLoading, isReady,
    isTextOverlayEnabled, setIsTextOverlayEnabled, overlayText, setOverlayText,
    textColor, setTextColor, textSize, setTextSize, fontFamily, setFontFamily
}) => {
  return (
    <div className="flex flex-col h-full justify-between space-y-6">
      <div className="space-y-6">
        {mode === 'branding' ? (
         <div>
           <label className="block text-sm font-medium text-gray-text mb-2">Chọn phong cách thương hiệu</label>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {brandingStyles.map(style => (
                   <button 
                       key={style.name}
                       onClick={() => setBrandingStyle(style.name)}
                       className={`text-left p-3 rounded-lg border-2 transition-all duration-300 h-full flex flex-col justify-center shadow-emboss hover:shadow-glow-primary active:shadow-emboss-inset ${
                           brandingStyle === style.name
                           ? 'shadow-emboss-inset bg-primary/20 border-primary text-primary'
                           : 'bg-dark-bg-2/50 border-transparent text-light-text'
                       }`}
                       aria-pressed={brandingStyle === style.name}
                   >
                       <h4 className="font-semibold text-light-text">{style.name}</h4>
                       <p className="text-xs text-gray-text mt-1">{style.description}</p>
                   </button>
               ))}
           </div>
         </div>
       ) : (
        <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-text mb-2">Mô tả ý tưởng</label>
            <textarea
              id="prompt"
              rows={5}
              className="w-full p-3 bg-dark-bg-2/50 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder-gray-text/70 shadow-emboss-inset"
              placeholder="Ví dụ: Thay đổi nền thành một bãi biển nhiệt đới, mặc cho người này một chiếc áo sơ mi hoa..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
        </div>
       )}

        {/* Text Overlay Section */}
        <div className="space-y-4">
          <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                    id="text-overlay-toggle"
                    type="checkbox"
                    checked={isTextOverlayEnabled}
                    onChange={(e) => setIsTextOverlayEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-primary focus:ring-primary cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="text-overlay-toggle" className="font-medium text-light-text cursor-pointer">
                    Thêm Lớp phủ Văn bản
                </label>
              </div>
          </div>
          {isTextOverlayEnabled && (
              <div className="space-y-4 p-4 bg-dark-bg-2/50 border border-primary/20 rounded-lg animate-fade-in shadow-emboss-inset">
                  <div>
                      <label htmlFor="overlay-text" className="block text-sm font-medium text-gray-text mb-2">Nội dung văn bản</label>
                      <textarea
                          id="overlay-text"
                          rows={2}
                          className="w-full p-2 bg-dark-bg-2/50 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-300 placeholder-gray-text/70 shadow-emboss-inset"
                          placeholder="Ví dụ: Sơn Đẹp Trai"
                          value={overlayText}
                          onChange={(e) => setOverlayText(e.target.value)}
                      />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                           <label className="block text-sm font-medium text-gray-text mb-2">Kiểu chữ</label>
                           <div className="flex gap-2">
                               {(['Serif', 'Sans-serif', 'Thư pháp'] as FontFamily[]).map(f => (
                                   <OptionButton key={f} label={f} isActive={fontFamily === f} onClick={() => setFontFamily(f)} />
                               ))}
                           </div>
                      </div>
                      <div>
                           <label className="block text-sm font-medium text-gray-text mb-2">Kích thước</label>
                           <div className="flex gap-2">
                                {(['Nhỏ', 'Vừa', 'Lớn'] as TextSize[]).map(s => (
                                   <OptionButton key={s} label={s} isActive={textSize === s} onClick={() => setTextSize(s)} />
                               ))}
                           </div>
                      </div>
                  </div>
                  <div>
                      <label htmlFor="text-color" className="block text-sm font-medium text-gray-text mb-2">Màu sắc</label>
                      <div className="relative">
                          <input
                              id="text-color"
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-full h-10 p-1 bg-dark-bg-2/50 border border-primary/20 rounded-lg cursor-pointer shadow-emboss-inset"
                          />
                           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-gray-text text-sm uppercase">{textColor}</span>
                           </div>
                      </div>
                  </div>
              </div>
          )}
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-text mb-2">Khung hình</label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
               {aspectRatios.map(ar => (
                  <AspectRatioButton
                    key={ar.ratio}
                    label={ar.label}
                    ratio={ar.ratio}
                    currentRatio={aspectRatio}
                    onClick={setAspectRatio}
                  >
                   {ar.visual}
                  </AspectRatioButton>
               ))}
            </div>
            {aspectRatio === 'custom' && (
                <div className="mt-4 p-4 bg-dark-bg-2/50 border border-primary/20 rounded-lg animate-fade-in shadow-emboss-inset">
                    <label className="block text-sm font-medium text-gray-text mb-2 text-center">Tỷ lệ tùy chỉnh</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={customAspectRatioWidth}
                            onChange={(e) => setCustomAspectRatioWidth(parseInt(e.target.value, 10) || 0)}
                            className="w-full p-2 bg-dark-bg-2/50 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center placeholder-gray-text/70 shadow-emboss-inset"
                            min="1"
                            placeholder="Rộng"
                            aria-label="Chiều rộng tùy chỉnh"
                        />
                        <span className="text-gray-text font-bold">:</span>
                        <input
                            type="number"
                            value={customAspectRatioHeight}
                            onChange={(e) => setCustomAspectRatioHeight(parseInt(e.target.value, 10) || 0)}
                            className="w-full p-2 bg-dark-bg-2/50 border border-primary/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center placeholder-gray-text/70 shadow-emboss-inset"
                            min="1"
                            placeholder="Cao"
                            aria-label="Chiều cao tùy chỉnh"
                        />
                    </div>
                </div>
            )}
        </div>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isLoading || !isReady || (mode !== 'branding' && !prompt) || (isTextOverlayEnabled && !overlayText) || (aspectRatio === 'custom' && (customAspectRatioWidth <= 0 || customAspectRatioHeight <= 0))}
        className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-dark-bg font-bold rounded-lg shadow-lg hover:shadow-glow-secondary disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none disabled:shadow-none mt-4"
      >
        {isLoading ? (
          <>
            <LoadingIcon />
            Đang kiến tạo...
          </>
        ) : (
          <>
            <GenerateIcon />
            Sáng tạo ảnh
          </>
        )}
      </button>
    </div>
  );
};

export default Controls;