//app/components/Sidebar.tsx

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
  Text,
  Divider,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { ConversationInfo } from "../utils";

interface SidebarProps {
  conversations: ConversationInfo[];
  setConversationId: (id: string) => void;
}

const handleConversationClick = (
  id: string,
  setConversationId: (id: string) => void,
  onClose: () => void
) => {
  setConversationId(id);
  onClose();
};

const Sidebar = ({ conversations, setConversationId }: SidebarProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const groupConversationsByDate = (conversations: ConversationInfo[]) => {
    const groupedConversations: Record<string, ConversationInfo[]> = {};

    conversations.forEach((conversation) => {
      const date = new Date(conversation.created_at).toDateString();
      if (!groupedConversations[date]) {
        groupedConversations[date] = [];
      }
      groupedConversations[date].push(conversation);
    });

    return groupedConversations;
  };

  const groupedConversations = groupConversationsByDate(conversations);

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
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay>
          <DrawerContent>
            <DrawerBody>
              <Box w="100%" h="100vh" bg="white">
                <VStack w="100%" align="stretch" spacing={1} pt={5}>
                  {Object.entries(groupedConversations).map(
                    ([date, conversationsOnDate]) => (
                      <Box key={date}>
                        <Text fontSize="xs" fontWeight="semibold" ml={2} mb={1}>
                          {date}
                        </Text>
                        {conversationsOnDate.map((conversation) => (
                          <Button
                            key={conversation.id}
                            paddingLeft={4}
                            justifyContent="flex-start"
                            variant="ghost"
                            borderRadius="none"
                            pr={0}
                            height={8}
                            width='200px'
                            onClick={() =>
                              handleConversationClick(
                                conversation.id,
                                setConversationId,
                                onClose
                              )
                            }
                          >
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              maxW="200px"
                            >
                              {conversation.name}
                            </Text>
                          </Button>
                        ))}
                        <Divider />
                      </Box>
                    )
                  )}
                </VStack>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
};

export default Sidebar;
