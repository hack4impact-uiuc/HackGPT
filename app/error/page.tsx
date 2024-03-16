"use client";

import { Center, Text, VStack } from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";

export default function ErrorPage() {
  return (
    <Center h="100vh">
      <VStack spacing={8}>
        <Text fontSize="xl">Oops! An error occurred.</Text>
        <Text>Please try logging in again.</Text>
        <Link href="/login" color="blue.500">
          Go back to login
        </Link>
      </VStack>
    </Center>
  );
}
