/**
 * 다크모드 토글 컴포넌트
 * 라이트/다크 모드 전환 버튼
 */

import React, { memo, useMemo } from 'react';
import {
  IconButton,
  useColorMode,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

interface ColorModeToggleProps {
  /** 버튼 크기 */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** 아이콘만 표시할지 여부 */
  variant?: 'ghost' | 'outline' | 'solid';
  /** 툴팁 표시 여부 */
  showTooltip?: boolean;
}

/**
 * 컬러 모드 토글 버튼 컴포넌트
 */
const ColorModeToggle = memo(function ColorModeToggle({ 
  size = 'sm', 
  variant = 'outline',
  showTooltip = true 
}: ColorModeToggleProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  
  // 현재 모드에 따른 아이콘과 텍스트 (useMemo 최적화)
  const { isDark, SwitchIcon, label } = useMemo(() => {
    const isDark = colorMode === 'dark';
    return {
      isDark,
      SwitchIcon: isDark ? SunIcon : MoonIcon,
      label: isDark ? '라이트 모드로 전환' : '다크 모드로 전환'
    };
  }, [colorMode]);
  
  // 테마별 컬러
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('gray.200', 'gray.600');

  const button = (
    <IconButton
      aria-label={label}
      icon={<SwitchIcon />}
      onClick={toggleColorMode}
      size={size}
      variant={variant}
      transition="all 0.2s"
      _hover={{
        bg: variant === 'ghost' ? hoverBg : undefined,
        transform: 'scale(1.05)',
      }}
      _active={{
        bg: variant === 'ghost' ? activeBg : undefined,
        transform: 'scale(0.95)',
      }}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip label={label} placement="bottom">
        {button}
      </Tooltip>
    );
  }

  return button;
});

export default ColorModeToggle;
