// src/DocPage.tsx

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { useNavigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
// import './DocPage.css'; // Se desejar adicionar estilos específicos

interface DocPageProps {
  page: string;
}

interface ButtonProps {
  to: string;
  children: React.ReactNode;
}

// Define styles
const styles = {
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

const MarkdownButton: React.FC<ButtonProps> = ({ to, children }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to.startsWith('#')) {
      // Scroll to the anchor in the same document
      const id = to.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to another route
      navigate(to);
    }
  };

  return (
    <button onClick={handleClick} style={styles.button}>
      {children}
    </button>
  );
};

const DocPage: React.FC<DocPageProps> = ({ page }) => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    // Use import.meta.env.BASE_URL para caminhos relativos
    fetch(`${import.meta.env.BASE_URL}docs/${page}.md`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Erro ao buscar o arquivo');
        }
        return res.text();
      })
      .then((text) => setContent(text))
      .catch(() => setContent('Página não encontrada'));
  }, [page]);

  const components = {
    button: ({ node }: any) => {
      // Verifique se o botão possui filhos
      const hasChildren = node.children && node.children.length > 0;

      if (hasChildren) {
        const linkNode = node.children[0];
        const href = linkNode?.properties?.href || '#';
        const buttonText =
          linkNode.children && linkNode.children.length > 0
            ? linkNode.children[0].value
            : 'Button';

        return <MarkdownButton to={href}>{buttonText}</MarkdownButton>;
      } else {
        // Renderiza um botão padrão caso não haja filhos
        return <MarkdownButton to="#">Button</MarkdownButton>;
      }
    },
    a: ({ node, href, children }: any) => {
      // Opcional: estilizar links que devem parecer botões
      const isButton = node.properties?.className?.includes('btn');

      if (isButton) {
        return <MarkdownButton to={href || '#'}>{children}</MarkdownButton>;
      }

      return (
        <a href={href} className="standard-link">
          {children}
        </a>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath, remarkEmoji]}
      rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw, rehypeSlug]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};

export default DocPage;
