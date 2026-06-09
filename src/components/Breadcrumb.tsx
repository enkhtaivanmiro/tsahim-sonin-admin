'use client';
import { Breadcrumb as ChakraBreadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { ChevronRight } from 'react-feather';
import Link from 'next/link';

interface Props {
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <ChakraBreadcrumb separator={<ChevronRight size={16} />} mb={6}>
      <BreadcrumbItem>
        <BreadcrumbLink as={Link} href="/">Нүүр хуудас</BreadcrumbLink>
      </BreadcrumbItem>
      {items.map((item, index) => (
        <BreadcrumbItem key={index} isCurrentPage={index === items.length - 1}>
          <BreadcrumbLink as={item.href ? Link : 'span'} href={item.href || '#'}>
            {item.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </ChakraBreadcrumb>
  );
}
