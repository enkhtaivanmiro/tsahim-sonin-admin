'use client';
import { Flex } from '@chakra-ui/react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Flex flex={1} direction="column" overflow="auto" bg="gray.50">
        {children}
      </Flex>
    </Flex>
  );
}
