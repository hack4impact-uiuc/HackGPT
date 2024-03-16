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

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
              <Box w="400px" h="100vh" bg="white" boxShadow="lg" p={4}>
                <VStack align="stretch" spacing={4}>
                  {/* Add your sidebar content here */}
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
