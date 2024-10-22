// src/App.tsx

import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import {
  FaInfoCircle,
  FaDownload,
  FaToolbox,
  FaChrome,
  FaPlayCircle,
  FaCogs,
  FaNetworkWired,
  FaEdit,
  FaPlusCircle,
  FaTasks,
  FaChevronDown,
  FaChevronRight,
  FaQuestionCircle,
} from 'react-icons/fa'; // Importar como componentes
import DocPage from './DocPage';
import './App.css';

interface RouteItem {
  path?: string;
  title: string;
  icon?: string;
  children?: RouteItem[];
}

const Icons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  FaInfoCircle: FaInfoCircle,
  FaDownload: FaDownload,
  FaToolbox: FaToolbox,
  FaChrome: FaChrome,
  FaPlayCircle: FaPlayCircle,
  FaCogs: FaCogs,
  FaNetworkWired: FaNetworkWired,
  FaEdit: FaEdit,
  FaPlusCircle: FaPlusCircle,
  FaTasks: FaTasks,
  FaChevronDown: FaChevronDown,
  FaChevronRight: FaChevronRight,
  FaQuestionCircle: FaQuestionCircle, // Ícone padrão
};

const App: React.FC = () => {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation(); // Hook para obter a rota atual

  // Função para encontrar o caminho das rotas que levam à rota atual
  const findRoutePath = (
    routes: RouteItem[],
    targetPath: string,
    path: string[] = []
  ): string[] | null => {
    for (let route of routes) {
      if (route.path === targetPath) {
        return [...path, route.title];
      }
      if (route.children) {
        const result = findRoutePath(route.children, targetPath, [...path, route.title]);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}docs/docsList.json`)
      .then((res) => res.json())
      .then((data: RouteItem[]) => {
        setRoutes(data);

        // Determinar quais menus devem estar expandidos com base na rota atual
        const currentPath = location.pathname.replace('/docs/', '').replace(/\/$/, '');
        const path = findRoutePath(data, currentPath);
        if (path) {
          // Excluir o último item que representa a página atual
          setExpandedMenus(path.slice(0, -1));
        }
      })
      .catch((err) => console.error('Erro ao buscar a lista de documentos:', err));
  }, [location.pathname]);

  // Função para obter dinamicamente o componente de ícone
  const getIconComponent = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons];
    if (!Icon) {
      // Retorna o componente do ícone padrão se não encontrar o ícone especificado
      return FaQuestionCircle;
    }
    return Icon;
  };

  // Função recursiva para renderizar os itens do menu
  const renderNavItems = (routes: RouteItem[], level = 0) => {
    return routes.map((route, index) => {
      const IconComponent = getIconComponent(route.icon || '');
      const levelClass = `level-${level}`; // Classe para indentação

      // Determinar se a rota atual está ativa
      const isActive = route.path ? location.pathname === `/${route.path}` : false;

      // Determinar se algum dos filhos está ativo
      const isChildActive =
        route.children?.some((child) => child.path && location.pathname === `/${child.path}`) ||
        false;

      if (route.children && route.children.length > 0) {
        const isExpanded = expandedMenus.includes(route.title) || isChildActive;

        const handleClick = () => {
          if (expandedMenus.includes(route.title)) {
            setExpandedMenus(expandedMenus.filter((title) => title !== route.title));
          } else {
            setExpandedMenus([...expandedMenus, route.title]);
          }
        };

        const ExpandIcon = isExpanded ? FaChevronDown : FaChevronRight; // Usar os componentes diretamente

        return (
          <React.Fragment key={`${route.title}-${index}`}>
            <div
              className={`nav-item ${isChildActive ? 'active-parent' : ''}`}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={handleClick}
            >
              <span className={`nav-link d-flex align-items-center flex-grow-1 ${levelClass}`}>
                <IconComponent className="me-2" /> {/* Usar o componente com props */}
                {route.title}
              </span>
              <ExpandIcon className="expand-icon" /> {/* Usar o componente diretamente */}
            </div>
            {isExpanded && renderNavItems(route.children, level + 1)}
          </React.Fragment>
        );
      } else {
        return (
          <Nav.Link
            as={NavLink}
            to={`/${route.path}`}
            key={`${route.title}-${index}`}
            className={`nav-link ${isActive ? 'active' : ''} ${levelClass}`}
          >
            <span className="d-flex align-items-center">
              <IconComponent className="me-2" /> {/* Usar o componente com props */}
              {route.title}
            </span>
          </Nav.Link>
        );
      }
    });
  };

  // Função recursiva para gerar as rotas do React Router
  const renderRoutes = (routes: RouteItem[]) => {
    const routeComponents: JSX.Element[] = [];

    const generateRoutes = (routes: RouteItem[]) => {
      routes.forEach((route) => {
        if (route.path) {
          routeComponents.push(
            <Route
              key={route.path}
              path={`/${route.path}`}
              element={<DocPage page={route.path!} />}
            />
          );
        }
        if (route.children) {
          generateRoutes(route.children);
        }
      });
    };

    generateRoutes(routes);
    return routeComponents;
  };

  return (
    <div className="app">
      <Navbar bg="primary" variant="dark">
        <Navbar.Brand as={Link} to="/">
          WSADOCS
        </Navbar.Brand>
      </Navbar>

      <div className="d-flex">
        {/* Menu Lateral */}
        <Nav className="flex-column sidebar bg-light p-1">
          {renderNavItems(routes)}
        </Nav>

        {/* Conteúdo Principal */}
        <Container className="content">
          <Routes>
            {renderRoutes(routes)}
            <Route path="*" element={<h1>Welcome to WSADOCS!</h1>} />
          </Routes>
        </Container>
      </div>
    </div>
  );
};

export default App;
