"use client";

import { Button, Center, VStack } from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";

export default function LoginPage() {
  const backendUrl = process.env.BACKEND_URL;
  return (
    <Center h="100vh">
      <VStack spacing={8}>
        <Link href={`${backendUrl}/login`}>
          <Button colorScheme="blue" size="lg">
            Login with Google
          </Button>
        </Link>
      </VStack>
    </Center>
  );
}
