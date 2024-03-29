import React, { useEffect, useRef } from "react";
import { Box, Text, VStack, Button } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { Components } from "react-markdown";

export interface Message {
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
}

interface ConversationMessagesProps {
  messages: Message[];
  handleHideMessage: (index: number) => Promise<void>;
  userName?: string;
}

// Extend the Components type to include math and inlineMath
type MathComponents = {
  math: (props: { value: string }) => JSX.Element;
  inlineMath: (props: { value: string }) => JSX.Element;
};

const ConversationMessages: React.FC<ConversationMessagesProps> = ({
  messages,
  handleHideMessage,
  userName = "User",
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <VStack spacing={4} align="stretch" width="100%" mb={10}>
      {messages.map((message, index) => (
        <Box
          key={index}
          borderRadius="none"
          borderWidth="1px"
          p={4}
          borderColor={message.hidden ? "gray.300" : "black"}
          alignSelf={message.role === "user" ? "flex-end" : "flex-start"}
          maxWidth="100%"
        >
          <Text
            fontWeight="bold"
            mb={1}
            color={message.hidden ? "gray.500" : "inherit"}
          >
            [{index}] {message.role === "user" ? userName : "Assistant"}
          </Text>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            components={
              {
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <Box overflowX="auto">
                      <SyntaxHighlighter
                        style={vs}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </Box>
                  ) : (
                    <code
                      className={className}
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        padding: "0.2em 0.4em",
                        borderRadius: "3px",
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                math: ({ value }) => <BlockMath math={value} />,
                inlineMath: ({ value }) => <InlineMath math={value} />,
              } as Components & MathComponents
            }
          >
            {message.content}
          </ReactMarkdown>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => handleHideMessage(index)}
            ml="auto"
            mt={2}
          >
            hide
          </Button>
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </VStack>
  );
};

export default ConversationMessages;
