// app/components/AutoResizeTextarea.tsx
import React, { useEffect, useRef } from "react";
import { Textarea, TextareaProps } from "@chakra-ui/react";

interface AutoResizeTextareaProps extends TextareaProps {
  maxHeight?: string;
  onSendMessage?: () => void;
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  placeholder,
  maxHeight = "200px",
  onSendMessage,
  ...rest
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (onSendMessage) {
        onSendMessage();
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        parseInt(maxHeight)
      )}px`;

      // Enable scrolling if the content exceeds the maximum height
      if (textareaRef.current.scrollHeight > parseInt(maxHeight)) {
        textareaRef.current.style.overflowY = "scroll";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [value, maxHeight]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      resize="none"
      _focus={{ boxShadow: "none" }}
      {...rest}
    />
  );
};

export default AutoResizeTextarea;
