"use client";

// app/page.tsx
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
  handleHideMessage,
  handleDeleteMessage,
  handleEditMessage,
} from "./utils";
import Link from "next/link";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface CustomJwtPayload extends JwtPayload {
  first_name?: string;
  last_name?:string;
  sub?: string;
}


export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cookies, setCookie] = useCookies(["token"]);

  const [textValue, setTextValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(
    "claude-3-sonnet-20240229"
  );
  const [conversations, setConversations] = useState<
    { id: string; name: string; created_at: string }[]
  >([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(event.target.value);
  };

  const handleHideMessageWrapper = async (index: number) => {
    if (conversationId) {
      await handleHideMessage(
        index,
        messages,
        conversationId,
        setMessages,
        cookies
      );
    }
  };

  const handleDeleteMessageWrapper = async (index: number) => {
    if (conversationId) {
      await handleDeleteMessage(
        index,
        messages,
        conversationId,
        setMessages,
        cookies
      );
    }
  };

    const handleEditMessageWrapper = async (index: number) => {
      if (conversationId) {
        await handleEditMessage(
          index,
          messages,
          conversationId,
          setMessages,
          setTextValue,
          cookies
        );
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

  useEffect(() => {
    if (cookies.token) {
      fetchConversations(cookies.token).then((data) => {
        setConversations(data);
      });
    }
  }, [cookies.token, conversationId]);

  useEffect(() => {
    if (cookies.token && conversationId) {
      fetchConversationById(
        conversationId,
        cookies.token,
        setSelectedModel,
        setMessages
      );
    }
  }, [cookies.token, conversationId]);

  let decodedToken: CustomJwtPayload | null = null;
  if (cookies.token) {
    try {
      decodedToken = jwtDecode<CustomJwtPayload>(cookies.token);
    } catch (error) {
      console.error("Error decoding JWT token:", error);
    }
  }

  let userFirstName: string | undefined = undefined;
  let userEmail: string | undefined = undefined;
  if (decodedToken) {
    userFirstName = decodedToken.first_name || undefined;
    userEmail = decodedToken.sub || undefined;
  }

  const [clientUserName, setClientUserName] = useState(userFirstName);

  useEffect(() => {
    setClientUserName(userFirstName);
  }, [userFirstName]);

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
            setSelectedModel("claude-3-sonnet-20240229");
          }}
        />
        <Link href="https://uiuc.hack4impact.org/">
          <Image
            src="h4i_square.png"
            alt="Hack4Impact Logo"
            borderRadius="none"
            borderColor="black"
            borderWidth="1px"
            height="40px"
            width="40px"
          />
        </Link>
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
            <ConversationMessages
              messages={messages}
              handleHideMessage={handleHideMessageWrapper}
              handleDeleteMessage={handleDeleteMessageWrapper}
              handleEditMessage={handleEditMessageWrapper}
              userName={clientUserName}
            />
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
              isLoading={loading}
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
