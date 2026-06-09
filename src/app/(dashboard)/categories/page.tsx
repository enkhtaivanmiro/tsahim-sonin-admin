'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Button, FormControl, FormLabel, Heading, Input, Table,
  TableContainer, Tbody, Td, Th, Thead, Tr, Spinner, Text, useToast,
  HStack, VStack, Card, CardBody,
} from '@chakra-ui/react';
import { Plus } from 'react-feather';
import axios from '@/lib/axios';
import Breadcrumb from '@/components/Breadcrumb';

interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch {
      toast({ title: 'Ангилал ачаалахад алдаа гарлаа', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm({ name, slug });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast({ title: 'Нэр болон Slug оруулна уу', status: 'warning', duration: 3000 });
      return;
    }
    setAdding(true);
    try {
      await axios.post('/api/categories', form);
      toast({ title: 'Ангилал нэмэгдлээ', status: 'success', duration: 2000 });
      setForm({ name: '', slug: '' });
      fetchCategories();
    } catch (err: any) {
      toast({ title: 'Алдаа гарлаа', description: err?.response?.data?.message, status: 'error', duration: 3000 });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box px={6} py={6}>
      <Breadcrumb items={[{ label: 'Ангилал' }]} />
      <Heading size="lg" mb={6} color="gray.800">Ангилал удирдах</Heading>

      <HStack spacing={8} align="flex-start">
        {/* Table of categories */}
        <Box flex={1} bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr bg="gray.50">
                  <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">ID</Th>
                  <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Ангиллын нэр</Th>
                  <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Slug</Th>
                  <Th color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Огноо</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr><Td colSpan={4} textAlign="center" py={12}><Spinner color="blue.500" /><Text mt={2} color="gray.400" fontSize="sm">Уншиж байна...</Text></Td></Tr>
                ) : categories.length === 0 ? (
                  <Tr><Td colSpan={4} textAlign="center" py={12}><Text color="gray.400">Ангилал байхгүй байна</Text></Td></Tr>
                ) : (
                  categories.map((c) => (
                    <Tr key={c.id}>
                      <Td color="gray.500" fontSize="sm">{c.id}</Td>
                      <Td fontWeight="600" color="gray.800">{c.name}</Td>
                      <Td color="gray.600">{c.slug}</Td>
                      <Td color="gray.500" fontSize="sm">
                        {new Date(c.created_at).toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* Add Category Form */}
        <Card w="350px" border="1px solid" borderColor="gray.100" shadow="sm" borderRadius="xl">
          <CardBody>
            <VStack as="form" onSubmit={handleAddCategory} spacing={4} align="stretch">
              <Heading size="md" color="gray.700" mb={2}>Шинэ ангилал нэмэх</Heading>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Нэр</FormLabel>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Жишээ: Спорт, Улс төр..."
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Slug</FormLabel>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="sport"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
                />
              </FormControl>

              <Button
                type="submit"
                leftIcon={<Plus size={16} />}
                colorScheme="blue"
                isLoading={adding}
                mt={2}
              >
                Нэмэх
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </HStack>
    </Box>
  );
}
