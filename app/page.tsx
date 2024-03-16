"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useCookies } from "react-cookie";
import {
  VStack,
  Center,
  Input,
  Text,
  Heading,
  Textarea,
} from "@chakra-ui/react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cookies, setCookie] = useCookies(["token"]);

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

  // Render your main user interaction page here
  return (
    <Center height="100vh">
      <VStack width="40%" minWidth="400px">
        <Heading paddingBottom={5}>Welcome to HackGPT</Heading>
        <Textarea />
      </VStack>
    </Center>
  );
}
