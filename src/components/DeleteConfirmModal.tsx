'use client';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { ReactElement, useState } from 'react';
import axios from '@/lib/axios';

interface Props {
  uri: string;
  title: string;
  onSuccess: () => void;
  children: ReactElement<{ onClick?: () => void }>;
}

export default function DeleteConfirmModal({ uri, title, onSuccess, children }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/${uri}`);
      toast({ title: 'Амжилттай устгагдлаа', status: 'success', duration: 2000 });
      onSuccess();
      onClose();
    } catch {
      toast({ title: 'Устгахад алдаа гарлаа', status: 'error', duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {React.cloneElement(children, { onClick: onOpen })}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Устгах баталгаажуулалт</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Та энэ {title} устгахдаа итгэлтэй байна уу?
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} disabled={loading}>
              Буцах
            </Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={loading}>
              Устгах
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
