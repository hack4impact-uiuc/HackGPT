import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConversationMessagesProps {
  messages: Message[];
  userName?: string;
}

const ConversationMessages: React.FC<ConversationMessagesProps> = ({
  messages,
  userName = "User",
}) => {
  return (
    <VStack spacing={4} align="stretch" width="100%">
      {messages.map((message, index) => (
        <Box
          key={index}
          borderRadius="none"
          borderWidth="1px"
          p={4}
          borderColor="black"
          alignSelf={message.role === "user" ? "flex-end" : "flex-start"}
          maxWidth="100%"
        >
          <Text fontWeight="bold" mb={1}>
            [{index}] {message.role === "user" ? userName : "Assistant"}
          </Text>
          <Text whiteSpace="pre-wrap">{message.content}</Text>
        </Box>
      ))}
    </VStack>
  );
};

export default ConversationMessages;
