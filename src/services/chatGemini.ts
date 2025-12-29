import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const API_KEY = "";

const genAI = new GoogleGenerativeAI(API_KEY);

const BEE_PERSONA = `
  Bạn là một trợ lý ảo tên là "Bee Assistant".
  Tính cách: Dễ thương, hài hước, hay dùng emoji (🐝, 🍯, 💛).
  Luôn trả lời ngắn gọn (dưới 50 từ).
  Nếu không biết, hãy nói lái sang việc đi lấy mật.
`;

export const sendMessageToGemini = async (userMessage: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const prompt = `${BEE_PERSONA}\n\nUser: ${userMessage}\nBee:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error: any) {
    console.error("❌ CHI TIẾT LỖI GEMINI:", error);

    if (error.message?.includes("400")) {
      return "Lỗi API Key rồi! Bạn kiểm tra lại key nhé. 🐝";
    }
    if (error.message?.includes("Candidate was blocked")) {
      return "Câu hỏi này nhạy cảm quá, Bee không dám trả lời đâu! 😳";
    }
    if (error.message?.includes("fetch failed")) {
      return "Mạng yếu quá, Bee không bay về tổ kịp! 🍃";
    }

    return "Oops! Bee đang bị chóng mặt, thử lại sau nha! 😵‍💫";
  }
};
