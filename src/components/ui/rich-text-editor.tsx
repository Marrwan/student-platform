'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  height = 300,
  disabled = false
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <div className="border rounded-md">
      <Editor
        apiKey="7ek70kb8zmwgq91u83hhaca4liwnxp9n50oo128jxw4rvztg"
        onInit={(_evt: any, editor: any) => editorRef.current = editor}
        value={value}
        onEditorChange={(content: string) => onChange(content)}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder: placeholder,
          readonly: disabled,
          branding: false,
          promotion: false,
          elementpath: false,
          resize: false,
          statusbar: false
        }}
        initialValue={value}
      />
    </div>
  );
} 