import { useState } from "react";
import {
  Box,
  VStack,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react";

import { ChevronRightIcon } from "@chakra-ui/icons";
import { ConversationInfo } from "../utils";

interface SidebarProps {
  conversations: ConversationInfo[];
  setConversationId: (id: string) => void;
}

const Sidebar = ({ conversations, setConversationId }: SidebarProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleConversationClick = (id: string) => {
    setConversationId(id);
    onClose();
  };

  return (
    <>
      <IconButton
        icon={<ChevronRightIcon boxSize={6} />}
        aria-label="open sidebar"
        onClick={onOpen}
        pos="fixed"
        left={0}
        top="45%"
        variant="ghost"
        height="100px"
      />
      <Drawer isOpen={isOpen} onClose={onClose} placement="left" >
        {/* <DrawerOverlay> */}
        <DrawerContent>
          <DrawerBody>
            <Box w="100%" h="100vh" bg="white">
              <VStack w="100%" align="stretch" spacing={1} pt={5}>
                {conversations.map((conversation) => (
                  <Button
                    paddingLeft={2}
                    justifyContent="flex-start"
                    key={conversation.id}
                    variant="ghost"
                    borderRadius="none"
                    pr={0}
                    height={8}
                    onClick={() => handleConversationClick(conversation.id)}
                  >
                    {conversation.name}
                  </Button>
                ))}
              </VStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
        {/* </DrawerOverlay> */}
      </Drawer>
    </>
  );
};

export default Sidebar;
