'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Button, FormControl, FormLabel, Heading, Input, Select,
  Switch, HStack, VStack, useToast, Text, Divider,
} from '@chakra-ui/react';
import { Save, ArrowLeft } from 'react-feather';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import Breadcrumb from '@/components/Breadcrumb';
import RichText from '@/components/RichText';

interface Category { id: number; name: string; }

export default function CreateNewsPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    category_id: '',
    cover_image: '',
    published: false,
    featured: false,
  });

  useEffect(() => {
    axios.get('/api/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm((f) => ({ ...f, title, slug }));
  };

  const handleSubmit = async (published: boolean) => {
    if (!form.title || !form.content) {
      toast({ title: 'Гарчиг болон агуулга шаардлагатай', status: 'warning', duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/articles', { ...form, published });
      toast({ title: published ? 'Мэдээ нийтлэгдлээ' : 'Ноорог хадгалагдлаа', status: 'success', duration: 2000 });
      router.push('/news');
    } catch (err: any) {
      toast({ title: 'Алдаа гарлаа', description: err?.response?.data?.message, status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box px={6} py={6} maxW="900px">
      <Breadcrumb items={[{ label: 'Мэдээ', href: '/news' }, { label: 'Шинэ мэдээ' }]} />

      <HStack justify="space-between" mb={6}>
        <Heading size="lg" color="gray.800">Шинэ мэдээ</Heading>
        <Link href="/news">
          <Button leftIcon={<ArrowLeft size={16} />} variant="ghost" colorScheme="gray" size="sm">Буцах</Button>
        </Link>
      </HStack>

      <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" p={8}>
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Гарчиг</FormLabel>
            <Input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Мэдээний гарчиг..."
              size="lg"
              border="1px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Slug</FormLabel>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="my-article-slug"
              border="1px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
            />
          </FormControl>

          <HStack spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Ангилал</FormLabel>
              <Select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                placeholder="Ангилал сонгоно уу"
                border="1px solid"
                borderColor="gray.200"
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Зургийн URL</FormLabel>
              <Input
                value={form.cover_image}
                onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
                placeholder="https://..."
                border="1px solid"
                borderColor="gray.200"
              />
            </FormControl>
          </HStack>

          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="featured" mb="0" fontSize="sm" fontWeight="600" color="gray.700" mr={4}>
              Онцлох нийтлэл болгох (ОНЦЛОХ НИЙТЛЭЛҮҮД хэсэгт харагдана)
            </FormLabel>
            <Switch
              id="featured"
              colorScheme="red"
              isChecked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Агуулга</FormLabel>
            <RichText
              value={form.content}
              onChange={(val: string) => setForm((f) => ({ ...f, content: val }))}
              placeholder="Мэдээний агуулга..."
            />
          </FormControl>

          <Divider />

          <HStack justify="flex-end" spacing={3}>
            <Button
              leftIcon={<Save size={16} />}
              variant="outline"
              colorScheme="gray"
              isLoading={loading}
              onClick={() => handleSubmit(false)}
            >
              Ноорог хадгалах
            </Button>
            <Button
              leftIcon={<Save size={16} />}
              colorScheme="blue"
              isLoading={loading}
              onClick={() => handleSubmit(true)}
            >
              Нийтлэх
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
