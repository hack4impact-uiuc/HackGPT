import { Message } from "./components/ConversationMessages";
import { LLMProviders } from "./llm_providers";

export const fetchConversationById = async (
  conversationId: string,
  token: string,
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
        credentials: "include",
      }
    );

    if (response.ok) {
      const conversation = await response.json();
      setSelectedModel(conversation.model_name);
      setMessages(conversation.messages);
    } else {
      console.error("Failed to fetch conversation");
    }
  } catch (error) {
    console.error("Error fetching conversation:", error);
  }
};

export interface ConversationInfo {
  id: string;
  name: string;
  created_at: string;
}

export const fetchConversations = async (token: string) => {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      mode: "cors",
      credentials: "include",
    });

    if (response.ok) {
      const data: ConversationInfo[] = await response.json();
      return data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      console.error("Failed to fetch conversations");
      return [];
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

const handleStreamingResponse = async (
  response: Response,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let assistantMessage = "";

  setMessages((prevMessages) => [
    ...prevMessages,
    { role: "assistant", content: "" },
  ]);

  try {
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      assistantMessage += chunk;

      console.log(chunk)

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { role: "assistant", content: assistantMessage },
      ]);
    }
  } catch (error) {
    console.error("Error during streaming:", error);
  }
};


export const handleSendMessage = async (
  textValue: string,
  conversationId: string | null,
  selectedModel: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>,
  cookies: { [key: string]: string },
  setTextValue: React.Dispatch<React.SetStateAction<string>>
) => {
  console.log(selectedModel);
  if (textValue.trim() !== "") {
    const newMessage: Message = {
      role: "user",
      content: textValue,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setTextValue("");

    if (!conversationId) {
      const response = await fetch(`${process.env.BACKEND_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.token}`,
        },
        body: JSON.stringify({
          model_provider: LLMProviders.find(
            (model) => model.model_name == selectedModel
          )?.model_provider,
          model_name: selectedModel,
        }),
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.conversation_id);

        // Send the new message to the newly created conversation
        const messageResponse = await fetch(
          `${process.env.BACKEND_URL}/conversations/${data.conversation_id}/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cookies.token}`,
            },
            body: JSON.stringify({ message: newMessage.content }),
            mode: "cors",
            credentials: "include",
          }
        );

        if (messageResponse.ok) {
          await handleStreamingResponse(messageResponse, setMessages);
        }
      }
    } else {
      // Add message to existing conversation
      const response = await fetch(
        `${process.env.BACKEND_URL}/conversations/${conversationId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.token}`,
          },
          body: JSON.stringify({ message: newMessage.content }),
          mode: "cors",
          credentials: "include",
        }
      );

      if (response.ok) {
        await handleStreamingResponse(response, setMessages);
      }
    }
  }
};

export const handleModelChange = async (
  event: React.ChangeEvent<HTMLSelectElement>,
  conversationId: string | null,
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>,
  cookies: { [key: string]: string }
) => {
  const newModel = event.target.value;
  setSelectedModel(newModel);

  if (conversationId) {
    // Update the model for the current conversation
    await fetch(`${process.env.BACKEND_URL}/conversations/${conversationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
      body: JSON.stringify({
        model_provider: LLMProviders.find(
          (model) => model.model_name == newModel
        )?.model_provider,
        model_name: newModel,
      }),
      mode: "cors",
      credentials: "include",
    });
  }
};
