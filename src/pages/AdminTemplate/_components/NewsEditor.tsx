import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import Quote from "@editorjs/quote";

import { uploadImage } from "../../../store/slices/newsSlice";

interface NewsEditorProps {
  data?: any;
  onChange: (data: any) => void;
  holder: string;
}

const NewsEditor: React.FC<NewsEditorProps> = ({ data, onChange, holder }) => {
  const ref = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!ref.current) {
      const editor = new EditorJS({
        holder: holder,
        data: data && Object.keys(data).length > 0 ? data : undefined,
        placeholder: "Nhập nội dung bài viết tại đây...",
        tools: {
          header: {
            class: Header as any,
            config: { levels: [2, 3, 4], defaultLevel: 2 },
          },
          list: {
            class: List as any,
            inlineToolbar: true,
          },
          quote: {
            class: Quote as any,
            inlineToolbar: true,
          },
          image: {
            class: ImageTool as any,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  try {
                    const imageUrl = await uploadImage(file);

                    if (!imageUrl) {
                      throw new Error("Upload failed, no URL returned");
                    }

                    return {
                      success: 1,
                      file: {
                        url: imageUrl,
                      },
                    };
                  } catch (error) {
                    console.error("Editor Upload Error:", error);
                    return {
                      success: 0,
                    };
                  }
                },
              },
            },
          },
        },
        onChange: async () => {
          const content = await editor.save();
          onChange(content);
        },
      });
      ref.current = editor;
    }

    return () => {
      if (ref.current && typeof ref.current.destroy === "function") {
        try {
          ref.current.destroy();
        } catch (e) {
        }
        ref.current = null;
      }
    };
  }, []);

  return (
    <div
      id={holder}
      className="prose max-w-full border p-4 rounded-md min-h-[300px] bg-white text-black"
    />
  );
};

export default NewsEditor;
