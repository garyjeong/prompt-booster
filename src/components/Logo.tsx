"use client";

import { Text } from "@chakra-ui/react";
import { memo } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const fontSizeMap = {
  sm: { base: "lg", md: "xl" },
  md: { base: "xl", md: "2xl" },
  lg: { base: "2xl", md: "3xl" },
} as const;

const Logo = memo(function Logo({ size = "lg" }: LogoProps) {
  return (
    <Text
      as="span"
      fontSize={fontSizeMap[size]}
      fontWeight="extrabold"
      letterSpacing="-0.03em"
      color="brand.600"
    >
      Prompt Booster
    </Text>
  );
});

export default Logo;
