import axios from "axios";
import { Medicine, PrescriptionData } from "../types";

const OPENAI_API_BASE = "https://api.openai.com/v1";
const THREAD_ID = import.meta.env.VITE_THREAD_ID;
const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID;

/**
 * Analyzes a prescription image using OpenAI's Assistant API
 */

export async function uploadImageToOpenAI(
  imageBlob: Blob,
  apiKey: string
): Promise<string> {
  const formData = new FormData();

  formData.append("file", imageBlob, "image.png"); // You can rename as needed
  formData.append("purpose", "assistants"); // Required for Assistants API

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/files",
      formData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Upload success:", response.data);
    return response.data.id; // file_id you need for the Assistants API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw new Error("Image upload failed");
  }
}

export const analyzePrescription = async (
  fileId: string,
  apiKey: string
): Promise<Medicine[]> => {
  try {
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not found. Please add your API key to continue."
      );
    }

    // Add message with image to the thread
    const messageResponse = await axios.post(
      `${OPENAI_API_BASE}/threads/${THREAD_ID}/messages`,
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze this prescription image and extract all medicine information. and share their use why are they used in shotest way possible. PLease share the response in JSON string.",
          },
          {
            type: "image_file",
            image_file: {
              file_id: fileId,
            },
          },
          // {
          //   type: "input_file",
          //   file_id: file.id,
          // },
          // {
          //   type: "input_text",
          //   text: "What is the first dragon in the book?",
          // },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    // Run the assistant
    const runResponse = await axios.post(
      `${OPENAI_API_BASE}/threads/${THREAD_ID}/runs`,
      {
        assistant_id: ASSISTANT_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const runId = runResponse.data.id;

    // Poll for completion
    let runStatus = await checkRunStatus(runId, apiKey);
    while (runStatus === "in_progress" || runStatus === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await checkRunStatus(runId, apiKey);
    }

    if (runStatus === "completed") {
      // Get the assistant's response
      const messagesResponse = await axios.get(
        `${OPENAI_API_BASE}/threads/${THREAD_ID}/messages`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v2",
          },
        }
      );

      const lastMessage = messagesResponse.data.data[0];
      const content = lastMessage.content[0].text.value;

      try {
        const match = content.match(/```json\s*([\s\S]*?)\s*```/);

        // If match is found, extract inner JSON; else fallback to full content
        const cleaned = match ? match[1].trim() : content.trim();

        const parsed = JSON.parse(cleaned);

        return parsed;
      } catch (error) {
        console.error("Failed to parse Assistant response", content);
        throw new Error("Failed to parse prescription data");
      }
    } else {
      throw new Error(`Run failed with status: ${runStatus}`);
    }
  } catch (error) {
    console.error("Error analyzing prescription:", error);
    throw error;
  }
};

/**
 * Checks the status of an Assistant run
 */
const checkRunStatus = async (
  runId: string,
  apiKey: string
): Promise<string> => {
  const response = await axios.get(
    `${OPENAI_API_BASE}/threads/${THREAD_ID}/runs/${runId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
    }
  );
  return response.data.status;
};

/**
 * Asks a follow-up question about the prescription using the Assistant
 */
export const askQuestionAboutPrescription = async (
  question: string,
  imageBase64: string,
  prescriptionData: PrescriptionData,
  apiKey: string
): Promise<string> => {
  try {
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Add the question to the thread
    await axios.post(
      `${OPENAI_API_BASE}/threads/${THREAD_ID}/messages`,
      {
        role: "user",
        content: question,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    // Run the assistant
    const runResponse = await axios.post(
      `${OPENAI_API_BASE}/threads/${THREAD_ID}/runs`,
      {
        assistant_id: ASSISTANT_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const runId = runResponse.data.id;

    // Poll for completion
    let runStatus = await checkRunStatus(runId, apiKey);
    while (runStatus === "in_progress" || runStatus === "queued") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await checkRunStatus(runId, apiKey);
    }

    if (runStatus === "completed") {
      // Get the assistant's response
      const messagesResponse = await axios.get(
        `${OPENAI_API_BASE}/threads/${THREAD_ID}/messages`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v2",
          },
        }
      );

      const lastMessage = messagesResponse.data.data[0];
      return lastMessage.content[0].text.value;
    } else {
      throw new Error(`Run failed with status: ${runStatus}`);
    }
  } catch (error) {
    console.error("Error asking question:", error);
    throw error;
  }
};
