'use client';
import React, { useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic<any>(() => import('react-quill-new'), { ssr: false });

export default function RichText({ value, onChange, placeholder, ...props }: any) {
  const quillRef = useRef<any>(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Зураг хуулахад алдаа гарлаа.');
        }

        const data = await response.json();
        
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', data.url);
          quill.setSelection(range.index + 1);
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), [imageHandler]);

  return (
    <Box 
      className="quill-editor-wrapper"
      border="1px solid" 
      borderColor="gray.200" 
      borderRadius="md" 
      overflow="hidden"
      bg="white"
      sx={{
        '.ql-toolbar.ql-snow': {
          border: 'none',
          borderBottom: '1px solid',
          borderBottomColor: 'gray.200',
          bg: 'gray.50',
        },
        '.ql-container.ql-snow': {
          border: 'none',
          minHeight: '280px',
        },
        '.ql-editor': {
          fontSize: '15px',
          lineHeight: '1.6',
          color: 'gray.800',
        }
      }}
    >
      <ReactQuill
        ref={quillRef}
        value={value || ''}
        placeholder={placeholder}
        onChange={(val: string) => onChange?.(val)}
        modules={modules}
        formats={[
          'header',
          'bold',
          'italic',
          'underline',
          'strike',
          'blockquote',
          'list',
          'bullet',
          'link',
          'image',
        ]}
        {...props}
      />
    </Box>
  );
}
