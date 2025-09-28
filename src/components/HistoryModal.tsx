"use client";

import { DeleteIcon, SearchIcon } from "@chakra-ui/icons";
import {
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import React from "react";

const HistoryViewer = dynamic(() => import("@/components/HistoryViewer"), {
  ssr: false,
});

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const headerBg = useColorModeValue("white", "gray.800");
  const subText = useColorModeValue("gray.500", "gray.400");
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader bg={headerBg} borderBottom="1px" borderColor={useColorModeValue('gray.200','gray.700')}>
          <HStack justify="space-between">
            <Text fontWeight="bold">히스토리</Text>
            <HStack>
              <InputGroup size="sm" w={{ base: '160px', md: '240px' }}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={subText} />
                </InputLeftElement>
                <Input placeholder="검색..." variant="filled" _focus={{ bg: useColorModeValue('white','gray.700') }} />
              </InputGroup>
              <IconButton aria-label="전체 삭제" size="sm" variant="ghost" icon={<DeleteIcon />} />
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <Tabs isFitted variant="enclosed-colored">
            <TabList>
              <Tab>모든 히스토리</Tab>
              <Tab>Demo</Tab>
              <Tab>AI</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <HistoryViewer />
              </TabPanel>
              <TabPanel p={0}>
                <HistoryViewer />
              </TabPanel>
              <TabPanel p={0}>
                <HistoryViewer />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default HistoryModal;


