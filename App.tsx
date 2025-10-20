import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import Controls from './components/Controls';
import ResultDisplay from './components/ResultDisplay';
import { fuseImages, generateSingleImage, generateBrandingImage, TextOverlayConfig } from './services/geminiService';
import { HeaderIcon } from './components/Icons';
import History from './components/History';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5' | '3:4' | '4:3' | 'custom';
export type TextSize = 'Nhỏ' | 'Vừa' | 'Lớn';
export type FontFamily = 'Serif' | 'Sans-serif' | 'Thư pháp';

export type HistoryItem = {
  id: string;
  generatedImage: string;
  prompt: string;
  aspectRatio: AspectRatio;
  customAspectRatio?: { width: number; height: number };
  timestamp: number;
  isTextOverlayEnabled?: boolean;
  overlayText?: string;
  textColor?: string;
  textSize?: TextSize;
  fontFamily?: FontFamily;
};

type Mode = 'fusion' | 'single' | 'branding';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('branding');
  const [sourceImage1, setSourceImage1] = useState<File | null>(null);
  const [sourceImage2, setSourceImage2] = useState<File | null>(null);
  const [sourceImageSingle, setSourceImageSingle] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [brandingStyle, setBrandingStyle] = useState<string>('Chuyên nghiệp');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [customAspectRatioWidth, setCustomAspectRatioWidth] = useState<number>(16);
  const [customAspectRatioHeight, setCustomAspectRatioHeight] = useState<number>(9);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(true);

  // State for text overlay
  const [isTextOverlayEnabled, setIsTextOverlayEnabled] = useState<boolean>(false);
  const [overlayText, setOverlayText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textSize, setTextSize] = useState<TextSize>('Vừa');
  const [fontFamily, setFontFamily] = useState<FontFamily>('Sans-serif');

  useEffect(() => {
    try {
      const savedHistoryJson = localStorage.getItem('imageFusionHistory');
      if (savedHistoryJson) {
        const savedHistory: Omit<HistoryItem, 'generatedImage'>[] = JSON.parse(savedHistoryJson);
        const loadedHistory: HistoryItem[] = savedHistory.map(item => ({
          ...item,
          generatedImage: '', 
        }));
        setHistory(loadedHistory);
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
        const historyForStorage = history.map(({ id, prompt, aspectRatio, customAspectRatio, timestamp, isTextOverlayEnabled, overlayText, textColor, textSize, fontFamily }) => ({
            id,
            prompt,
            aspectRatio,
            customAspectRatio,
            timestamp,
            isTextOverlayEnabled,
            overlayText,
            textColor,
            textSize,
            fontFamily,
        }));
        localStorage.setItem('imageFusionHistory', JSON.stringify(historyForStorage));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const handleImage1Upload = (file: File) => {
    setSourceImage1(file);
    setGeneratedImage(null);
    setError(null);
  };
  
  const handleImage2Upload = (file: File) => {
    setSourceImage2(file);
    setGeneratedImage(null);
    setError(null);
  };

  const handleImageSingleUpload = (file: File) => {
    setSourceImageSingle(file);
    setGeneratedImage(null);
    setError(null);
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        }
      };
      reader.readAsDataURL(file);
    });

    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
  };

  const handleGenerateClick = useCallback(async () => {
    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    let finalAspectRatio: string = aspectRatio;
    if (aspectRatio === 'custom') {
        if (customAspectRatioWidth > 0 && customAspectRatioHeight > 0) {
            finalAspectRatio = `${customAspectRatioWidth}:${customAspectRatioHeight}`;
        } else {
            setError('Vui lòng nhập tỷ lệ khung hình tùy chỉnh hợp lệ (lớn hơn 0).');
            setIsLoading(false);
            return;
        }
    }

    try {
      let result: string | null = null;
      let generatedPrompt = prompt;

      const textOverlayConfig: TextOverlayConfig = {
        isEnabled: isTextOverlayEnabled,
        text: overlayText,
        color: textColor,
        size: textSize,
        font: fontFamily,
      };

      if (mode === 'fusion') {
        if (!sourceImage1 || !sourceImage2 || !prompt) {
          setError('Vui lòng tải lên cả hai ảnh và nhập mô tả.');
          setIsLoading(false);
          return;
        }
        const imagePart1 = await fileToGenerativePart(sourceImage1);
        const imagePart2 = await fileToGenerativePart(sourceImage2);
        result = await fuseImages(imagePart1, imagePart2, prompt, finalAspectRatio, textOverlayConfig);
      } else if (mode === 'single') { 
        if (!sourceImageSingle || !prompt) {
          setError('Vui lòng tải lên ảnh và nhập mô tả.');
          setIsLoading(false);
          return;
        }
        const imagePart = await fileToGenerativePart(sourceImageSingle);
        result = await generateSingleImage(imagePart, prompt, finalAspectRatio, textOverlayConfig);
      } else { // mode === 'branding'
        if (!sourceImageSingle) {
          setError('Vui lòng tải lên ảnh chân dung.');
          setIsLoading(false);
          return;
        }
        const imagePart = await fileToGenerativePart(sourceImageSingle);
        result = await generateBrandingImage(imagePart, brandingStyle, finalAspectRatio, textOverlayConfig);
        generatedPrompt = `Phong cách: ${brandingStyle}`;
      }
      
      if (result) {
        const generatedImageUrl = `data:image/png;base64,${result}`;
        setGeneratedImage(generatedImageUrl);

        const newHistoryItem: HistoryItem = {
            id: new Date().toISOString(),
            generatedImage: generatedImageUrl,
            prompt: generatedPrompt,
            aspectRatio,
            customAspectRatio: aspectRatio === 'custom' ? { width: customAspectRatioWidth, height: customAspectRatioHeight } : undefined,
            timestamp: Date.now(),
            isTextOverlayEnabled,
            overlayText,
            textColor,
            textSize,
            fontFamily,
        };
        setHistory(prev => [newHistoryItem, ...prev]);

      } else {
        setError('Không thể tạo ảnh. Vui lòng thử lại với một mô tả khác.');
      }
    } catch (e) {
      console.error(e);
      setError(`Đã xảy ra lỗi: ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [mode, sourceImage1, sourceImage2, sourceImageSingle, prompt, brandingStyle, aspectRatio, customAspectRatioWidth, customAspectRatioHeight, isTextOverlayEnabled, overlayText, textColor, textSize, fontFamily]);

  const handleReuseHistoryItem = (item: HistoryItem) => {
    if (item.prompt.startsWith('Phong cách: ')) {
        const styleName = item.prompt.replace('Phong cách: ', '');
        setBrandingStyle(styleName);
        setPrompt('');
        setMode('branding');
    } else {
        setPrompt(item.prompt);
        if (mode === 'branding') {
            setMode('single');
        }
    }
    setAspectRatio(item.aspectRatio);
    if (item.aspectRatio === 'custom' && item.customAspectRatio) {
      setCustomAspectRatioWidth(item.customAspectRatio.width);
      setCustomAspectRatioHeight(item.customAspectRatio.height);
    }
    setIsTextOverlayEnabled(item.isTextOverlayEnabled ?? false);
    setOverlayText(item.overlayText ?? '');
    setTextColor(item.textColor ?? '#FFFFFF');
    setTextSize(item.textSize ?? 'Vừa');
    setFontFamily(item.fontFamily ?? 'Sans-serif');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
      if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử không? Hành động này không thể hoàn tác.')) {
          setHistory([]);
          localStorage.removeItem('imageFusionHistory');
      }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl mx-auto flex items-center justify-center mb-6 text-center">
        <HeaderIcon />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
          SƠN ĐẸP TRAI
        </h1>
      </header>
      <p className="text-center text-gray-text mb-8 max-w-3xl">
        Hợp nhất hai thế giới, kiến tạo một kiệt tác. Tải lên hai ảnh, mô tả ý tưởng của bạn, và để AI hòa trộn chúng thành một.
      </p>

      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-dark-surface p-6 rounded-2xl border border-primary/20 backdrop-blur-xl shadow-2xl shadow-dark-bg/50 flex flex-col gap-8">
          
          <div className="flex justify-center mb-2 bg-dark-bg-2/50 p-1 rounded-lg text-center shadow-emboss-inset">
            <button onClick={() => setMode('branding')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 flex-1 ${mode === 'branding' ? 'shadow-emboss-inset bg-primary/20 text-primary' : 'text-gray-text hover:text-light-text'}`}>
              Thương hiệu
            </button>
            <button onClick={() => setMode('fusion')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 flex-1 ${mode === 'fusion' ? 'shadow-emboss-inset bg-primary/20 text-primary' : 'text-gray-text hover:text-light-text'}`}>
              Hợp nhất
            </button>
            <button onClick={() => setMode('single')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 flex-1 ${mode === 'single' ? 'shadow-emboss-inset bg-primary/20 text-primary' : 'text-gray-text hover:text-light-text'}`}>
              Chỉnh sửa
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-light-text to-gray-text">1. Tải lên Ảnh</h2>
            {mode === 'fusion' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUploader title="Ảnh 1 (Nền / Bối cảnh)" onImageUpload={handleImage1Upload} />
                <ImageUploader title="Ảnh 2 (Chủ thể / Đối tượng)" onImageUpload={handleImage2Upload} />
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <ImageUploader title={mode === 'branding' ? 'Ảnh Chân dung' : 'Ảnh Gốc'} onImageUpload={handleImageSingleUpload} />
              </div>
            )}
          </div>
          
          <div className="flex-grow flex flex-col">
            <h2 className="text-2xl font-semibold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-light-text to-gray-text">2. Tùy chỉnh & Sáng tạo</h2>
            <Controls
              mode={mode}
              prompt={prompt}
              setPrompt={setPrompt}
              brandingStyle={brandingStyle}
              setBrandingStyle={setBrandingStyle}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              customAspectRatioWidth={customAspectRatioWidth}
              setCustomAspectRatioWidth={setCustomAspectRatioWidth}
              customAspectRatioHeight={customAspectRatioHeight}
              setCustomAspectRatioHeight={setCustomAspectRatioHeight}
              onGenerate={handleGenerateClick}
              isLoading={isLoading}
              isReady={mode === 'fusion' ? (!!sourceImage1 && !!sourceImage2) : (!!sourceImageSingle)}
              isTextOverlayEnabled={isTextOverlayEnabled}
              setIsTextOverlayEnabled={setIsTextOverlayEnabled}
              overlayText={overlayText}
              setOverlayText={setOverlayText}
              textColor={textColor}
              setTextColor={setTextColor}
              textSize={textSize}
              setTextSize={setTextSize}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
            />
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-dark-surface p-6 rounded-2xl border border-primary/20 backdrop-blur-xl shadow-2xl shadow-dark-bg/50 flex flex-col">
           <h2 className="text-2xl font-semibold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-light-text to-gray-text">3. Kết quả</h2>
           <div className="flex-grow flex w-full h-full min-h-[300px]">
             <ResultDisplay 
                generatedImage={generatedImage} 
                isLoading={isLoading} 
                error={error} 
             />
           </div>
        </div>
      </main>

      <div className="w-full max-w-7xl mx-auto mt-8">
        <History 
            history={history}
            isVisible={isHistoryVisible}
            onToggle={() => setIsHistoryVisible(v => !v)}
            onClear={handleClearHistory}
            onReuse={handleReuseHistoryItem}
        />
      </div>

      <footer className="w-full max-w-7xl mx-auto mt-8 text-center text-gray-text text-sm">
        <p>Phát triển bởi Google Gemini API. © 2024 SƠN ĐẸP TRAI.</p>
      </footer>
    </div>
  );
};

export default App;