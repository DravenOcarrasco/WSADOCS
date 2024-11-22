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
import './DocPage.css';

interface DocPageProps {
  page: string;
}

interface ButtonProps {
  to: string;
  children: React.ReactNode;
}

const LoadingSpinner: React.FC = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Carregando...</p>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="error-container">
    <div className="error-icon">⚠️</div>
    <h2>Ops! Algo deu errado</h2>
    <p>{message}</p>
  </div>
);

const MarkdownButton: React.FC<ButtonProps> = ({ to, children }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to.startsWith('#')) {
      const id = to.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(to);
    }
  };

  return (
    <button onClick={handleClick} className="markdown-button">
      {children}
    </button>
  );
};

const DocPage: React.FC<DocPageProps> = ({ page }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(`${import.meta.env.BASE_URL}docs/${page}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 
            ? 'Página não encontrada' 
            : 'Erro ao carregar o conteúdo');
        }
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [page]);

  const components = {
    button: ({ node }: any) => {
      const hasChildren = node.children && node.children.length > 0;

      if (hasChildren) {
        const linkNode = node.children[0];
        const href = linkNode?.properties?.href || '#';
        const buttonText =
          linkNode.children && linkNode.children.length > 0
            ? linkNode.children[0].value
            : 'Button';

        return <MarkdownButton to={href}>{buttonText}</MarkdownButton>;
      }

      return <MarkdownButton to="#">Button</MarkdownButton>;
    },
    a: ({ node, href, children }: any) => {
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="markdown-container">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkEmoji]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw, rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default DocPage;
