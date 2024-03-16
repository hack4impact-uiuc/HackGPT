"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useCookies } from "react-cookie";
import {
  VStack,
  Center,
  HStack,
  IconButton,
  Box,
  Image,
  Select,
} from "@chakra-ui/react";
import { ArrowUpIcon, AddIcon } from "@chakra-ui/icons";
import AutoResizeTextarea from "./components/AutoResizeTextArea";
import ConversationMessages, {
  Message,
} from "./components/ConversationMessages";
import { LLMProviders } from "./utils";
import Sidebar from "./components/Sidebar";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cookies, setCookie] = useCookies(["token"]);

  const [textValue, setTextValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(
    LLMProviders[0].model_name
  );

  const [messages, setMessages] = useState<Message[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(event.target.value);
  };

  const handleSendMessage = async () => {
    if (textValue.trim() !== "") {
      const newMessage: Message = {
        role: "user",
        content: textValue,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setTextValue("");

      if (!conversationId) {
        // Create a new conversation
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_provider: selectedModel.split("-")[0],
            model_name: selectedModel,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setConversationId(data.conversation_id);
        }
      } else {
        // Add message to existing conversation
        const response = await fetch(
          `/api/conversations/${conversationId}/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: newMessage.content }),
          }
        );

        if (response.ok) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let assistantMessage = "";

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

  const handleModelChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);

    if (conversationId) {
      // Update the model for the current conversation
      await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_provider: newModel.split("-")[0],
          model_name: newModel,
        }),
      });
    }
  };

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      setCookie("token", token, {
        path: "/",
        maxAge: 86400, // Expires in 1 day
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      router.push("/");
    } else if (!cookies.token) {
      router.push("/login");
    }
  }, [cookies.token, router, searchParams, setCookie]);

  return (
    <Box>
      <Sidebar />
      <HStack
        as="nav"
        spacing={4}
        alignItems="center"
        justifyContent="space-between"
        padding={4}
      >
        <IconButton
          icon={<AddIcon />}
          aria-label="Add"
          borderRadius="none"
          borderColor="black"
          borderWidth="1px"
          height="40px"
          width="40px"
          variant="outline"
          colorScheme="blue"
        />
        <Image
          src="h4i_square.png"
          alt="Hack4Impact Logo"
          borderRadius="none"
          borderColor="black"
          borderWidth="1px"
          height="40px"
          width="40px"
        />
      </HStack>
      <Center height="calc(100vh - 80px)">
        <VStack
          width="60%"
          minWidth="400px"
          maxWidth="900px"
          height="100%"
          justify="space-between"
        >
          <ConversationMessages messages={messages} />
          <VStack width="100%">
            <Select
              size="sm"
              variant="unstyled"
              width="150px"
              alignSelf="start"
              value={selectedModel}
              onChange={handleModelChange}
            >
              {LLMProviders.map((model) => (
                <option value={model.model_name} key={model.model_name}>
                  {model.display_name}
                </option>
              ))}
            </Select>
            <HStack width="100%">
              <AutoResizeTextarea
                value={textValue}
                onChange={handleChange}
                alignSelf="end"
                borderRadius="none"
                borderColor="black"
                minHeight="40px"
              />
              <IconButton
                icon={<ArrowUpIcon />}
                variant="outline"
                colorScheme="blue"
                aria-label="Send"
                borderRadius="none"
                borderColor="black"
                borderWidth="1px"
                height="60px"
                width="60px"
                alignSelf="end"
                onClick={handleSendMessage}
              />
            </HStack>
          </VStack>
        </VStack>
      </Center>
    </Box>
  );
}
