"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { memo } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fontSizeMap = {
  sm: { base: "lg", md: "xl" },
  md: { base: "xl", md: "2xl" },
  lg: { base: "2xl", md: "3xl" },
} as const;

const Logo = memo(function Logo({ size = "lg" }: LogoProps) {
  return (
    <HStack spacing={3} align="center">
      {/* Gradient orb */}
      <Box
        w={{ base: 5, md: 6 }}
        h={{ base: 5, md: 6 }}
        borderRadius="full"
        bgGradient="conic(to-r, brand.500, purple.400, pink.400, cyan.400, brand.500)"
        animation={`${gradientShift} 8s ease infinite`}
        bgSize="200% 200%"
        boxShadow="0 0 24px rgba(14,165,233,0.35)"
      />

      {/* Animated gradient wordmark */}
      <Text
        as="span"
        fontSize={fontSizeMap[size]}
        fontWeight="extrabold"
        letterSpacing="-0.03em"
        bgGradient="linear(to-r, brand.600, purple.500, pink.500, cyan.400)"
        bgClip="text"
        animation={`${gradientShift} 10s ease infinite`}
        bgSize="200% 200%"
      >
        Prompt Booster
      </Text>
    </HStack>
  );
});

export default Logo;


