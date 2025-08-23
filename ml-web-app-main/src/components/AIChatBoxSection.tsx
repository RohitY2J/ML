import React from "react";

interface AIChatBoxSectionProps {
  question: string;
  setQuestion: (q: string) => void;
  response: string;
  isLoading: boolean;
  error: string;
  handleSubmit: (e: React.FormEvent) => void;
  theme: string;
  textColor: string;
  secondaryTextColor: string;
  borderColor: string;
}

const AIChatBoxSection: React.FC<AIChatBoxSectionProps> = ({
  question,
  setQuestion,
  response,
  isLoading,
  error,
  handleSubmit,
  theme,
  textColor,
  secondaryTextColor,
  borderColor,
}) => {
  const bgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-[#F8FAFD]";

  return (
    <div
      className={`${bgColor} p-4 rounded-lg border ${borderColor} flex flex-col justify-between h-full`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-8 h-8 rounded-full ${
            theme === "dark" ? "bg-[#2962FF]" : "bg-blue-500"
          } flex items-center justify-center`}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div>
          <h3 className={`text-sm font-semibold ${textColor}`}>AI Assistant</h3>
          <p className={`text-11 ${secondaryTextColor}`}>
            Ask me anything about the market
          </p>
        </div>
      </div>
      <div
        className={`space-y-4 max-h-[200px] overflow-y-auto mb-4 ${
          theme === "dark"
            ? "scrollbar-thumb-[#2A2E39]"
            : "scrollbar-thumb-gray-200"
        } scrollbar-track-transparent scrollbar-thin`}
      >
        {error && <div className="text-red-500 text-xs">{error}</div>}
        {response && <div className={`text-11 ${textColor}`}>{response}</div>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything"
          className={`flex-1 px-4 py-2 rounded-lg text-11 font-normal ${
            theme === "dark"
              ? "bg-[#2A2E39] text-[#D1D4DC] placeholder-[#9598A1]"
              : "bg-gray-100 text-gray-900 placeholder-gray-500"
          } focus:outline-none focus:ring-2 focus:ring-[#2962FF]`}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className={`px-4 py-2 rounded-lg text-white text-11 font-medium transition-colors duration-200 ${
            isLoading || !question.trim() ? "opacity-50 cursor-not-allowed" : ""
          } ${theme === "dark" ? "bg-[#2A2E39]" : "bg-blue-500"} ${
            theme === "dark" ? "hover:bg-[#2A2E39]" : "hover:bg-blue-600"
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChatBoxSection;
