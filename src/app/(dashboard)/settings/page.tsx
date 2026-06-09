'use client';
import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Heading, Input, Switch,
  VStack, HStack, useToast, Text, Divider, Card, CardBody, SimpleGrid,
} from '@chakra-ui/react';
import { Settings, Save, Server, Shield, Globe } from 'react-feather';
import Breadcrumb from '@/components/Breadcrumb';

export default function SettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    siteName: 'News Portal',
    siteEmail: 'contact@news.mn',
    itemsPerPage: '10',
    maintenanceMode: false,
    enableComments: true,
    backupInterval: 'daily',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Тохиргоо амжилттай хадгалагдлаа',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }, 800);
  };

  return (
    <Box px={6} py={6} maxW="1000px">
      <Breadcrumb items={[{ label: 'Тохиргоо' }]} />
      <Heading size="lg" mb={6} color="gray.800">Системийн тохиргоо</Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} as="form" onSubmit={handleSubmit}>
        {/* Left Side: Forms */}
        <VStack spacing={6} align="stretch" gridColumn={{ md: 'span 2' }}>
          <Card border="1px solid" borderColor="gray.100" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={3} mb={2}>
                  <Globe size={18} className="text-blue-500" />
                  <Heading size="md" color="gray.700">Үндсэн тохиргоо</Heading>
                </HStack>
                <Divider />

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Вэбсайтын нэр</FormLabel>
                  <Input
                    value={form.siteName}
                    onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                    border="1px solid"
                    borderColor="gray.200"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Холбоо барих мэйл</FormLabel>
                  <Input
                    type="email"
                    value={form.siteEmail}
                    onChange={(e) => setForm({ ...form, siteEmail: e.target.value })}
                    border="1px solid"
                    borderColor="gray.200"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Нэг хуудсанд харагдах мэдээний тоо</FormLabel>
                  <Input
                    type="number"
                    value={form.itemsPerPage}
                    onChange={(e) => setForm({ ...form, itemsPerPage: e.target.value })}
                    border="1px solid"
                    borderColor="gray.200"
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          <Card border="1px solid" borderColor="gray.100" shadow="sm" borderRadius="xl">
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={3} mb={2}>
                  <Shield size={18} className="text-orange-500" />
                  <Heading size="md" color="gray.700">Аюулгүй байдал & Төлөв</Heading>
                </HStack>
                <Divider />

                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="600" fontSize="sm" color="gray.750">Түр хаах (Maintenance Mode)</Text>
                    <Text fontSize="xs" color="gray.500">Идэвхжүүлсэн үед хэрэглэгчдэд засвартай гэсэн хуудас харагдана</Text>
                  </Box>
                  <Switch
                    colorScheme="red"
                    isChecked={form.maintenanceMode}
                    onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                  />
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="600" fontSize="sm" color="gray.750">Сэтгэгдэл бичих</Text>
                    <Text fontSize="xs" color="gray.500">Нийтлэлүүдэд хэрэглэгчид сэтгэгдэл үлдээх боломжийг нээх</Text>
                  </Box>
                  <Switch
                    colorScheme="green"
                    isChecked={form.enableComments}
                    onChange={(e) => setForm({ ...form, enableComments: e.target.checked })}
                  />
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Box textAlign="right">
            <Button
              type="submit"
              leftIcon={<Save size={16} />}
              colorScheme="blue"
              isLoading={loading}
              size="md"
              shadow="sm"
            >
              Тохиргоог хадгалах
            </Button>
          </Box>
        </VStack>

        {/* Right Side: Server info */}
        <VStack spacing={6} align="stretch">
          <Card border="1px solid" borderColor="gray.100" shadow="sm" borderRadius="xl" bg="gray.50">
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <Server size={18} className="text-purple-500" />
                  <Heading size="sm" color="gray.700">Мэдээллийн сан</Heading>
                </HStack>
                <Divider />

                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.500">Үйлчилгээ үзүүлэгч</Text>
                  <Text fontSize="sm" fontWeight="bold" color="gray.850">Neon Serverless PostgreSQL</Text>
                </Box>

                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.500">Статус</Text>
                  <HStack spacing={2} mt={1}>
                    <Box w={2.5} h={2.5} borderRadius="full" bg="green.500" />
                    <Text fontSize="sm" fontWeight="600" color="green.600">Холбогдсон</Text>
                  </HStack>
                </Box>

                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.500">Бүс нутаг</Text>
                  <Text fontSize="sm" color="gray.700">AWS us-east-1 (N. Virginia)</Text>
                </Box>

                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.500">Холболтын хаяг</Text>
                  <Text fontSize="xs" color="gray.600" fontFamily="mono" isTruncated>
                    ep-gentle-mouse-apa3x6ib-pooler.us-east-1.neon.tech
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}
