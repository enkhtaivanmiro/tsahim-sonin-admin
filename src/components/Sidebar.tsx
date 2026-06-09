'use client';
import { Box, Flex, VStack, Text, Icon, HStack, Divider, Avatar } from '@chakra-ui/react';
import { FileText, Layout, Tag, Settings } from 'react-feather';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Хяналтын самбар', href: '/', icon: Layout },
  { label: 'Мэдээ', href: '/news', icon: FileText },
  { label: 'Ангилал', href: '/categories', icon: Tag },
  { label: 'Тохиргоо', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Box
      w="260px"
      minH="100vh"
      bg="white"
      borderRight="1px solid"
      borderColor="gray.100"
      px={4}
      py={6}
      display="flex"
      flexDirection="column"
    >
      <HStack mb={8} px={2}>
        <Box w={8} h={8} borderRadius="lg" bg="blue.500" display="flex" alignItems="center" justifyContent="center">
          <Text color="white" fontWeight="bold" fontSize="sm">N</Text>
        </Box>
        <Text fontWeight="bold" fontSize="lg" color="gray.800">NewsAdmin</Text>
      </HStack>

      <VStack align="stretch" spacing={1} flex={1}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <HStack
                px={3}
                py={2.5}
                borderRadius="lg"
                bg={active ? 'blue.50' : 'transparent'}
                color={active ? 'blue.600' : 'gray.600'}
                _hover={{ bg: 'gray.50', color: 'gray.800' }}
                transition="all 0.15s"
                cursor="pointer"
              >
                <Icon as={item.icon} boxSize={4} />
                <Text fontSize="sm" fontWeight={active ? '600' : '400'}>{item.label}</Text>
              </HStack>
            </Link>
          );
        })}
      </VStack>

      <Divider mb={4} />
      <HStack px={2} spacing={3}>
        <Avatar size="sm" name="Admin" bg="blue.500" />
        <Box>
          <Text fontSize="sm" fontWeight="600" color="gray.800">Admin</Text>
          <Text fontSize="xs" color="gray.500">admin@news.mn</Text>
        </Box>
      </HStack>
    </Box>
  );
}
