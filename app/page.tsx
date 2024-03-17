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
import { handleSendMessage, handleModelChange, fetchConversations } from "./utils";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cookies, setCookie] = useCookies(["token"]);

  const [textValue, setTextValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(
    LLMProviders[0].model_name
  );
  const [conversations, setConversations] = useState<
    { id: string; name: string }[]
  >([]);

  const [messages, setMessages] = useState<Message[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(event.target.value);
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

  useEffect(() => {
    if (cookies.token) {
      fetchConversations(cookies.token).then((data) => {
        setConversations(data);
      });
    }
  }, [cookies.token, conversationId])

  return (
    <Box>
      <Sidebar
        conversations={conversations}
        setConversationId={setConversationId}
      />
      <HStack
        as="nav"
        spacing={4}
        alignItems="center"
        justifyContent="space-between"
        padding={4}
      >
        <IconButton
          icon={<AddIcon boxSize={3} />}
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
          minWidth="500px"
          maxWidth="700px"
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
              onChange={(event) =>
                handleModelChange(
                  event,
                  conversationId,
                  setSelectedModel,
                  cookies
                )
              }
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
                onClick={() =>
                  handleSendMessage(
                    textValue,
                    conversationId,
                    selectedModel,
                    setMessages,
                    setConversationId,
                    cookies,
                    setTextValue
                  )
                }
              />
            </HStack>
          </VStack>
        </VStack>
      </Center>
    </Box>
  );
}
