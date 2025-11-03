import React, { useState } from "react";
import type { ChangeEvent } from "react";

interface FormData {
  rawText: string;
  platforms: string[];
  tone: string;
}

const HomePage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    rawText: "",
    platforms: [],
    tone: "",
  });
  const [res, setRes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handlePlatformChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, platforms: [...formData.platforms, value] });
    } else {
      setFormData({
        ...formData,
        platforms: formData.platforms.filter((plat) => plat !== value),
      });
    }
  };

  const ContactGemini = async (): Promise<void> => {
    if (!formData.rawText || formData.platforms.length === 0) {
      alert("Please enter text and select at least one platform.");
      return;
    }

    setLoading(true);
    setRes("");

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-goog-api-key", import.meta.env.VITE_GEMINI_API_KEY);

      const raw = JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate creative social media posts from this raw text: 
                "${
                  formData.rawText
                }" for these platforms: ${formData.platforms.join(
                  ", "
                )} with a ${formData.tone || "neutral"} tone. 
                Format the output as: 
                Platform: [Platform Name] 
                Post: [Generated post content]`,
              },
            ],
          },
        ],
      });

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        requestOptions
      );

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setRes(text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setRes("Something went wrong while generating posts.");
    } finally {
      setLoading(false);
    }
  };

  const toneColors: Record<string, string> = {
    Professional: "bg-blue-100 text-blue-700 border-blue-300",
    Casual: "bg-gray-100 text-gray-700 border-gray-300",
    Funny: "bg-orange-100 text-orange-700 border-orange-300",
    Inspirational: "bg-green-100 text-green-700 border-green-300",
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 flex flex-col items-center">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Social Media Post Generator
        </h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Generate tailored posts — choose platforms, paste text, and let Gemini
          craft the perfect message for each.
        </p>
      </header>

      <form
        className="bg-white shadow-md rounded-2xl p-6 w-full max-w-2xl flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div>
          <label className="font-medium block mb-1 text-gray-700">
            Enter Raw Text
          </label>
          <textarea
            className="w-full min-h-[120px] p-3 font-mono text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            name="rawText"
            onChange={(e) =>
              setFormData({ ...formData, rawText: e.target.value })
            }
            value={formData.rawText}
            placeholder="Type your base content here..."
          />
        </div>

        <div>
          <label className="font-medium block mb-2 text-gray-700">
            Select Platforms
          </label>
          <div className="flex flex-wrap gap-4">
            {["Linkedin", "Instagram", "Twitter"].map((plat) => (
              <label
                key={plat}
                className="flex items-center gap-2 text-gray-700"
              >
                <input
                  type="checkbox"
                  value={plat}
                  checked={formData.platforms.includes(plat)}
                  onChange={handlePlatformChange}
                  className="accent-blue-500"
                />
                {plat}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="font-medium block mb-2 text-gray-700">
            Select Tone
          </label>
          <select
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Choose Tone --</option>
            <option value="Professional">Professional</option>
            <option value="Casual">Casual</option>
            <option value="Funny">Funny</option>
            <option value="Inspirational">Inspirational</option>
          </select>

          {formData.tone && (
            <div
              className={`inline-block mt-3 px-3 py-1 rounded-full border text-sm font-medium transition-all ${toneColors[formData.tone]
                }`}
            >
              {formData.tone} Tone Selected
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={ContactGemini}
          disabled={loading}
          className={`px-5 py-2.5 text-white rounded-lg font-semibold transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-linear-to-r from-blue-500 to-purple-500 "
          }`}
        >
          {loading ? "Generating..." : "Generate with Gemini"}
        </button>
      </form>

      {res && (
        <div className="mt-8 w-full max-w-4xl bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Generated Posts
          </h2>

          {res
            .split("Platform:")
            .filter((block) => block.trim())
            .map((block, idx) => (
              <div
                key={idx}
                className="border-b border-gray-200 pb-3 mb-3 last:border-none last:mb-0"
              >
                <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                  <strong className="text-blue-600">Platform:</strong>{" "}
                  {block.trim()}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
