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
import { LLMProviders } from "./llm_providers";
import Sidebar from "./components/Sidebar";
import {
  handleSendMessage,
  handleModelChange,
  fetchConversations,
  fetchConversationById,
} from "./utils";

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
    { id: string; name: string; created_at: string }[]
  >([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

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
  }, [cookies.token, conversationId]);

  useEffect(() => {
    if (cookies.token && conversationId) {
      console.log("triggered");
      fetchConversationById(
        conversationId,
        cookies.token,
        setSelectedModel,
        setMessages
      );
    }
  }, [cookies.token, conversationId]);

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
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1}
        bg="white"
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
          onClick={() => {
            setConversationId(null);
            setMessages([]);
            setSelectedModel(LLMProviders[0].model_name);
          }}
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
      <Center minHeight="calc(100vh - 80px)" mt={16} mb={24}>
        <VStack
          width="60%"
          minWidth="500px"
          maxWidth="700px"
          height="100%"
          justify="space-between"
        >
          <Box width="100%" pt={2} pb={2}>
            <ConversationMessages messages={messages} />
          </Box>
        </VStack>
      </Center>
      <VStack
        width="100%"
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={1}
        bg="white"
        py={4}
      >
        <VStack width="60%" minWidth="500px" maxWidth="700px">
          <Select
            size="sm"
            variant="unstyled"
            width="140px"
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
              onSendMessage={() =>
                handleSendMessage(
                  textValue,
                  conversationId,
                  selectedModel,
                  setMessages,
                  setConversationId,
                  cookies,
                  setTextValue,
                  setLoading
                )
              }
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
                  setTextValue,
                  setLoading
                )
              }
              isLoading={loading}
            />
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}
