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

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cookies, setCookie] = useCookies(["token"]);

  const [textValue, setTextValue] = useState("");
  const [conversationId, setConversationId] = useState();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "How may I assist you today within my current constraints?",
    },
    { role: "user", content: "i meant good morning haha" },
    {
      role: "assistant",
      content:
        "I apologize for misinterpreting your greeting! Good morning to you as well. I mentioned my normal conversation abilities are currently suspended, so I may not be able to engage in casual conversation as I normally would. Please let me know if there are any specific queries I can assist with regarding my knowledge or capabilities, keeping in mind the constraints of this debugging interface. I'll do my best to provide helpful responses.",
    },
  ]);

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

  return (
    <Box>
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
            <Select size="sm" variant="unstyled" width="150px" alignSelf='start'>
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
                onClick={() => {
                  // Handle send button click
                }}
              />
            </HStack>
          </VStack>
        </VStack>
      </Center>
    </Box>
  );
}
