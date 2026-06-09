'use client';
import React, { useState, useEffect } from 'react';
import { Box, Grid, GridItem, Heading, Text, HStack, Icon, Spinner } from '@chakra-ui/react';
import { FileText, TrendingUp, Eye, Tag } from 'react-feather';
import Breadcrumb from '@/components/Breadcrumb';
import axios from '@/lib/axios';

export default function DashboardPage() {
  const [data, setData] = useState<{ articles: number; published: number; draft: number; categories: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/stats')
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: 'Нийт мэдээ', value: data?.articles ?? 0, icon: FileText, color: 'blue.500' },
    { label: 'Нийтлэгдсэн', value: data?.published ?? 0, icon: TrendingUp, color: 'green.500' },
    { label: 'Ноорог', value: data?.draft ?? 0, icon: Eye, color: 'orange.500' },
    { label: 'Ангилал', value: data?.categories ?? 0, icon: Tag, color: 'purple.500' },
  ];

  return (
    <Box px={6} py={6}>
      <Breadcrumb items={[{ label: 'Хяналтын самбар' }]} />
      <Heading size="lg" mb={2} color="gray.800">Хяналтын самбар</Heading>
      <Text color="gray.500" mb={8}>Мэдээний системийн ерөнхий мэдээлэл</Text>

      {loading ? (
        <HStack spacing={4} justify="center" py={12}>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">Ачаалж байна...</Text>
        </HStack>
      ) : (
        <Grid templateColumns="repeat(4, 1fr)" gap={6}>
          {stats.map((s) => (
            <GridItem key={s.label}>
              <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100">
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="sm" color="gray.500" fontWeight="500">{s.label}</Text>
                  <Box p={2} borderRadius="lg" bg={s.color.replace('500', '50')}>
                    <Icon as={s.icon} color={s.color} boxSize={4} />
                  </Box>
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">{s.value}</Text>
              </Box>
            </GridItem>
          ))}
        </Grid>
      )}
    </Box>
  );
}
