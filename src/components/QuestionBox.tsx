import React, { useState } from "react";
import { MessagesSquare, Loader } from "lucide-react";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface QuestionBoxProps {
  onSubmit: (question: string) => Promise<string>;
  isLoading: boolean;
  answer: string | null;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({
  onSubmit,
  isLoading,
  answer,
}) => {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center">
          <MessagesSquare className="text-blue-500 mr-2" size={18} />
          <h3 className="font-semibold text-blue-800">
            Ask about your prescription
          </h3>
        </div>
      </div>

      {answer && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            <MarkdownPreview
              className="!bg-transparent !text-black"
              source={answer}
            />
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your medications..."
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
              isLoading || !question.trim()
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isLoading ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <MessagesSquare size={18} />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Example: "Can I take these medications together?" or "What are the
          main side effects I should watch for?"
        </p>
      </form>
    </div>
  );
};

export default QuestionBox;
