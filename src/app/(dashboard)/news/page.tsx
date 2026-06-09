'use client';
import React, { useState, useCallback } from 'react';
import {
  Box, Button, HStack, IconButton, Input, InputGroup, InputRightElement,
  Table, TableContainer, Tbody, Td, Th, Thead, Tr, Spinner, Text, Badge, Switch,
  useToast, Heading,
} from '@chakra-ui/react';
import { Search, Edit, Trash2, Plus } from 'react-feather';
import Link from 'next/link';
import axios from '@/lib/axios';
import Breadcrumb from '@/components/Breadcrumb';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { useListQuery } from '@/lib/hooks';

interface Article {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  category_name?: string;
  created_at: string;
}

export default function NewsPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, fetchData, hasNextPage } = useListQuery<Article>({
    uri: 'articles',
    params: { limit: 20, page: 1 },
  });

  const list: Article[] = data?.data || [];
  const totalCount = data?.count ?? 0;
  const currentPage = data?.currentPage ?? 1;
  const remainingCount = totalCount - list.length;

  const handleToggle = async (article: Article) => {
    try {
      await axios.patch(`/api/articles/${article.id}`);
      toast({ title: article.published ? 'Ноорог болголоо' : 'Нийтлэгдлээ', status: 'success', duration: 2000 });
      fetchData({ search: searchQuery, page: 1 });
    } catch {
      toast({ title: 'Алдаа гарлаа', status: 'error', duration: 2000 });
    }
  };

  const handleToggleFeatured = async (article: Article) => {
    try {
      await axios.patch(`/api/articles/${article.id}?action=featured`);
      toast({ title: article.featured ? 'Онцлохоос хаслаа' : 'Онцлох болголоо', status: 'success', duration: 2000 });
      fetchData({ search: searchQuery, page: 1 });
    } catch {
      toast({ title: 'Алдаа гарлаа', status: 'error', duration: 2000 });
    }
  };

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    fetchData({ search: value, page: 1 });
  }, [fetchData]);

  return (
    <Box px={6} py={6}>
      <Breadcrumb items={[{ label: 'Мэдээ' }]} />
      <Heading size="lg" mb={6} color="gray.800">Мэдээний жагсаалт</Heading>

      <HStack justify="space-between" mb={6}>
        <InputGroup maxW="400px">
          <Input
            placeholder="Мэдээний гарчиг хайх..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
          />
          <InputRightElement pointerEvents="none" color="gray.400">
            <Search size={16} />
          </InputRightElement>
        </InputGroup>

        <Link href="/news/create">
          <Button leftIcon={<Plus size={16} />} colorScheme="blue" size="md">
            Мэдээ нэмэх
          </Button>
        </Link>
      </HStack>

      <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr bg="gray.50">
                <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Гарчиг</Th>
                <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Ангилал</Th>
                <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Төлөв</Th>
                <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Онцлох</Th>
                <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Огноо</Th>
                <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" w="100px">Үйлдэл</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading && list.length === 0 ? (
                <Tr><Td colSpan={6} textAlign="center" py={12}><Spinner color="blue.500" /><Text mt={2} color="gray.400" fontSize="sm">Уншиж байна...</Text></Td></Tr>
              ) : list.length === 0 ? (
                <Tr><Td colSpan={6} textAlign="center" py={12}><Text color="gray.400">{searchQuery ? 'Хайлтын үр дүн олдсонгүй' : 'Мэдээ байхгүй байна'}</Text></Td></Tr>
              ) : (
                list.map((article) => (
                  <Tr key={article.id} _hover={{ bg: 'gray.50' }} transition="background 0.1s">
                    <Td fontWeight="500" color="gray.800" maxW="300px" isTruncated>{article.title}</Td>
                    <Td><Badge colorScheme="purple" variant="subtle">{article.category_name || '—'}</Badge></Td>
                    <Td>
                      <HStack spacing={2}>
                        <Switch colorScheme="green" isChecked={article.published} onChange={() => handleToggle(article)} size="sm" />
                        <Badge colorScheme={article.published ? 'green' : 'gray'} variant="subtle" fontSize="xs">
                          {article.published ? 'Нийтлэгдсэн' : 'Ноорог'}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Switch colorScheme="red" isChecked={article.featured} onChange={() => handleToggleFeatured(article)} size="sm" />
                        <Badge colorScheme={article.featured ? 'red' : 'gray'} variant="subtle" fontSize="xs">
                          {article.featured ? 'Онцлох' : 'Энгийн'}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td color="gray.500" fontSize="sm">
                      {new Date(article.created_at).toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Link href={`/news/${article.id}`}>
                          <IconButton icon={<Edit size={14} />} variant="ghost" size="sm" aria-label="Засах" colorScheme="blue" />
                        </Link>
                        <DeleteConfirmModal uri={`articles/${article.id}`} title="мэдээг" onSuccess={() => fetchData({ page: 1 })}>
                          <IconButton icon={<Trash2 size={14} />} variant="ghost" size="sm" aria-label="Устгах" colorScheme="red" />
                        </DeleteConfirmModal>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {hasNextPage && !loading && (
        <Box textAlign="center" mt={6}>
          <Button variant="outline" onClick={() => fetchData({ search: searchQuery, page: currentPage + 1 })} isLoading={loading} colorScheme="blue">
            Цааш үзэх {remainingCount > 0 && `(${remainingCount} үлдсэн)`}
          </Button>
        </Box>
      )}
      {list.length > 0 && (
        <Text textAlign="center" mt={4} fontSize="sm" color="gray.400">{list.length} / {totalCount} мэдээ</Text>
      )}
    </Box>
  );
}
