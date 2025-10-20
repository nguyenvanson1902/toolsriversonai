import { GoogleGenAI, Modality } from "@google/genai";
import type { Part } from "@google/genai";
import type { TextSize, FontFamily } from "../App";

const API_KEY = process.env.API_KEY as string;
const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash-image';

export type TextOverlayConfig = {
    isEnabled: boolean;
    text: string;
    color: string;
    size: TextSize;
    font: FontFamily;
};

const createAspectRatioInstruction = (ratio: string): string => {
    const presets: Record<string, string> = {
        '1:1': 'Vuông (tỷ lệ 1:1)',
        '16:9': 'Ngang (tỷ lệ 16:9)',
        '9:16': 'Dọc (tỷ lệ 9:16)',
        '4:5': 'Dọc (tỷ lệ 4:5)',
        '3:4': 'Dọc (tỷ lệ 3:4)',
        '4:3': 'Ngang (tỷ lệ 4:3)',
    };
    return presets[ratio] || `Tùy chỉnh (tỷ lệ ${ratio})`;
};


const createTextOverlayInstruction = (config: TextOverlayConfig): string => {
    if (!config.isEnabled || config.text.trim() === '') {
        return '';
    }
    return `
      \n**YÊU CẦU LỚP PHỦ VĂN BẢN (QUAN TRỌNG):**
      - **Nội dung:** "${config.text}"
      - **Màu sắc:** "${config.color}" (mã hex)
      - **Kích thước:** ${config.size}
      - **Kiểu chữ:** ${config.font}
      - **Vị trí:** Đặt văn bản ở một vị trí hợp lý và thẩm mỹ trên ảnh, không che mất các chi tiết quan trọng của chủ thể. Văn bản phải dễ đọc và nổi bật.
    `;
};


async function callGemini(contents: { parts: Part[] }) {
    if (!API_KEY) {
        throw new Error("API_KEY chưa được thiết lập trong biến môi trường.");
    }
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const candidate = response.candidates?.[0];

        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
        
        const textResponse = response.text;
        if (textResponse) {
            console.warn("Model trả về văn bản thay vì hình ảnh:", textResponse);
            throw new Error(`AI không thể tạo ảnh. Phản hồi từ AI: "${textResponse}"`);
        }

        return null;

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Đã xảy ra lỗi không xác định trong quá trình tạo ảnh.");
    }
}

export async function fuseImages(imagePart1: Part, imagePart2: Part, userPrompt: string, aspectRatio: string, textOverlayConfig: TextOverlayConfig): Promise<string | null> {
  const aspectRatioInstruction = createAspectRatioInstruction(aspectRatio);
  const textOverlayInstruction = createTextOverlayInstruction(textOverlayConfig);
  const enhancedPrompt = `
    **YÊU CẦU CHỈNH SỬA ẢNH**

    **ĐẦU VÀO:**
    -   **Ảnh 1:** Nền/bối cảnh.
    -   **Ảnh 2:** Chủ thể/đối tượng.
    -   **Mô tả người dùng:** "${userPrompt}"
    -   **Khung hình đầu ra:** ${aspectRatioInstruction}

    **QUY TẮC BẮT BUỘC:**
    1.  **GIỮ NGUYÊN KHUÔN MẶT:** Giữ lại 100% khuôn mặt gốc của chủ thể từ Ảnh 2. KHÔNG được thay đổi. Đây là ưu tiên số 1.
    2.  **HỢP NHẤT:** Tách chủ thể từ Ảnh 2 và ghép vào bối cảnh của Ảnh 1.
    3.  **CHẤT LƯỢNG:** Ảnh kết quả phải siêu thực, sắc nét, liền mạch. Ánh sáng, bóng đổ, màu sắc phải hài hòa.
    ${textOverlayInstruction}
    **THỰC HIỆN:** Dựa vào mô tả của người dùng, thực hiện yêu cầu và chỉ trả về kết quả là một hình ảnh duy nhất. Không thêm bất kỳ văn bản nào vào câu trả lời.
  `;
  const contents = {
    parts: [
        { text: "Ảnh 1 (nền):" },
        imagePart1,
        { text: "Ảnh 2 (chủ thể):" },
        imagePart2,
        { text: enhancedPrompt },
    ],
  };
  return callGemini(contents);
}

export async function generateSingleImage(imagePart: Part, userPrompt: string, aspectRatio: string, textOverlayConfig: TextOverlayConfig): Promise<string | null> {
    const aspectRatioInstruction = createAspectRatioInstruction(aspectRatio);
    const textOverlayInstruction = createTextOverlayInstruction(textOverlayConfig);
    const enhancedPrompt = `
      **YÊU CẦU CHỈNH SỬA ẢNH**

      **ĐẦU VÀO:**
      -   **Ảnh gốc:** Ảnh cần chỉnh sửa.
      -   **Mô tả người dùng:** "${userPrompt}"
      -   **Khung hình đầu ra:** ${aspectRatioInstruction}

      **QUY TẮC BẮT BUỘC:**
      1.  **GIỮ NGUYÊN KHUÔN MẶT:** Nếu ảnh có người, giữ lại 100% khuôn mặt gốc. KHÔNG được thay đổi. Đây là ưu tiên số 1.
      2.  **CHỈNH SỬA:** Áp dụng các thay đổi (nền, trang phục, phong cách...) theo mô tả của người dùng.
      3.  **CHẤT LƯỢNG:** Ảnh kết quả phải siêu thực, sắc nét, và liền mạch.
      ${textOverlayInstruction}
      **THỰC HIỆN:** Dựa vào mô tả của người dùng, thực hiện yêu cầu và chỉ trả về kết quả là một hình ảnh duy nhất. Không thêm bất kỳ văn bản nào vào câu trả lời.
    `;
    const contents = {
        parts: [
            { text: "Ảnh gốc:" },
            imagePart,
            { text: enhancedPrompt },
        ],
    };
    return callGemini(contents);
}

export async function generateBrandingImage(imagePart: Part, styleName: string, aspectRatio: string, textOverlayConfig: TextOverlayConfig): Promise<string | null> {
    const aspectRatioInstruction = createAspectRatioInstruction(aspectRatio);
    const textOverlayInstruction = createTextOverlayInstruction(textOverlayConfig);
  
    const stylePrompts: Record<string, string> = {
      'Chuyên nghiệp': 'Tạo một bức ảnh chân dung chuyên nghiệp, lý tưởng cho LinkedIn hoặc hồ sơ công ty. Sử dụng ánh sáng studio mềm mại, phông nền trung tính hoặc văn phòng hiện đại (hơi mờ), và trang phục công sở lịch sự (vest, áo sơ mi). Giữ biểu cảm tự tin và chuyên nghiệp.',
      'Sáng tạo': 'Biến ảnh gốc thành một tác phẩm nghệ thuật sáng tạo. Sử dụng màu sắc sống động, các yếu tố trừu tượng hoặc họa tiết độc đáo ở hậu cảnh. Có thể thêm các hiệu ứng ánh sáng nghệ thuật. Phong cách phù hợp cho nghệ sĩ, nhà thiết kế.',
      'Tối giản': 'Tạo một bức ảnh chân dung theo phong cách tối giản, sạch sẽ. Sử dụng phông nền đơn sắc (trắng, xám nhạt, hoặc màu pastel). Ánh sáng tự nhiên, nhẹ nhàng. Trang phục đơn giản, không họa tiết. Tập trung hoàn toàn vào chủ thể.',
      'Thân thiện': 'Tạo một bức ảnh chân dung với không khí ấm áp, thân thiện và dễ tiếp cận. Sử dụng ánh sáng tự nhiên, ấm áp. Phông nền có thể là một quán cà phê ấm cúng, công viên cây xanh (hơi mờ). Chủ thể mặc trang phục thường ngày, thoải mái và mỉ cười tự nhiên.',
      'Công nghệ': 'Tạo một bức ảnh chân dung mang phong cách công nghệ, hiện đại. Phông nền có thể là các đường mạch điện tử, mã code mờ ảo, hoặc không gian tương lai. Sử dụng ánh sáng với các tông màu xanh dương, tím neon. Trang phục gọn gàng, hiện đại.',
    };
  
    const stylePrompt = stylePrompts[styleName] || stylePrompts['Chuyên nghiệp'];
  
    const enhancedPrompt = `
      **YÊU CẦU TẠO ẢNH THƯƠNG HIỆU CÁ NHÂN**

      **ĐẦU VÀO:**
      -   **Ảnh gốc:** Ảnh chân dung.
      -   **Phong cách:** "${styleName}" - ${stylePrompt}
      -   **Khung hình đầu ra:** ${aspectRatioInstruction}

      **QUY TẮC BẮT BUỘC:**
      1.  **GIỮ NGUYÊN KHUÔN MẶT:** Giữ lại 100% khuôn mặt gốc của người trong ảnh. KHÔNG được thay đổi. Đây là ưu tiên số 1.
      2.  **ÁP DỤNG PHONG CÁCH:** Biến đổi nền, trang phục, ánh sáng, màu sắc theo phong cách đã chọn.
      3.  **CHẤT LƯỢNG:** Ảnh kết quả phải chuyên nghiệp, siêu thực, sắc nét.
      ${textOverlayInstruction}
      **THỰC HIỆN:** Áp dụng phong cách đã chọn vào ảnh gốc và chỉ trả về kết quả là một hình ảnh duy nhất. Không thêm bất kỳ văn bản nào vào câu trả lời.
    `;
    const contents = {
        parts: [
            { text: "Ảnh gốc:" },
            imagePart,
            { text: enhancedPrompt },
        ],
    };
    return callGemini(contents);
  }