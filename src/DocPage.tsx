import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
// Remove remark-slug import
// import remarkSlug from 'remark-slug';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug'; // Import rehype-slug
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

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
    fetch(`${import.meta.env.BASE_URL}/docs/${page}.md`)
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
      const linkNode = node.children[0];
      const href = linkNode?.properties?.href || '#';
      return (
        <MarkdownButton to={href}>
          {linkNode.children[0].value}
        </MarkdownButton>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath, remarkEmoji]}
      rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw, rehypeSlug]} // Add rehypeSlug here
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};

export default DocPage;
