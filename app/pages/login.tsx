import { Button, Center, Box, Heading, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already authenticated
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect to the dashboard if the user is already logged in
      router.push("/");
    }
  }, [router]);

  const handleLogin = () => {
    // Redirect to the backend login route
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`;
  };

  return (
    <Center height="100vh">
      <Box>
        <VStack spacing={8}>
          <Heading>Login</Heading>
          <Button onClick={handleLogin} colorScheme="blue">
            Login with Google
          </Button>
        </VStack>
      </Box>
    </Center>
  );
};

export default LoginPage;
