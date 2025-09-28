"use client";

import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    useColorModeValue,
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
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader bg={headerBg} borderBottom="1px" borderColor={useColorModeValue('gray.200','gray.700')}>
          히스토리
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <HistoryViewer />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default HistoryModal;


