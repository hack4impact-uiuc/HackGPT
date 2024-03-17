import { Message } from "./components/ConversationMessages";

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
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch conversations");
      return [];
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
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
          const reader = messageResponse.body?.getReader();
          const decoder = new TextDecoder();
          let assistantMessage = "";
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: "assistant", content: "" },
          ]);
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const chunk = decoder.decode(value);
            assistantMessage += chunk;
            setMessages((prevMessages) => [
              ...prevMessages.slice(0, -1),
              { role: "assistant", content: assistantMessage },
            ]);
          }
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
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage += chunk;

          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            { role: "assistant", content: assistantMessage },
          ]);
        }
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

export const LLMProviders = [
  {
    model_name: "grok lmao",
    model_provider: "elon",
    display_name: "grok",
  },
  {
    model_name: "gpt-4-turbo",
    model_provider: "openai",
    display_name: "gpt 4 turbo",
  },
  {
    model_name: "gpt-4",
    model_provider: "openai",
    display_name: "gpt 4",
  },
  {
    model_name: "gpt-3.5-turbo",
    model_provider: "openai",
    display_name: "gpt 3.5",
  },
  {
    model_name: "claude-3-opus-20240229",
    model_provider: "anthropic",
    display_name: "claude 3 opus",
  },
  {
    model_name: "claude-3-sonnet-20240229",
    model_provider: "anthropic",
    display_name: "claude 3 sonnet",
  },
  {
    model_name: "claude-3-haiku-20240307",
    model_provider: "anthropic",
    display_name: "claude 3 haiku",
  },
];
