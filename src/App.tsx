// src/App.tsx

import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Offcanvas } from 'react-bootstrap';
import * as FaIcons from 'react-icons/fa'; // Font Awesome Icons
import * as BiIcons from 'react-icons/bi'; // BoxIcons
import * as MdIcons from 'react-icons/md'; // Material Design Icons
import * as BsIcons from 'react-icons/bs'; // Bootstrap Icons
import DocPage from './DocPage';
import './App.css';

const Icons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    ...FaIcons,
    ...BiIcons,
    ...MdIcons,
    ...BsIcons,
    // Adicione outros conjuntos conforme necessário
};

interface RouteItem {
	path?: string;
	title: string;
	icon?: string;
	children?: RouteItem[];
}



const App: React.FC = () => {
	const [routes, setRoutes] = useState<RouteItem[]>([]);
	const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
	const location = useLocation(); // Hook para obter a rota atual
	const [showOffcanvas, setShowOffcanvas] = useState(false); // Estado para controlar o Offcanvas

	const handleClose = () => setShowOffcanvas(false);
	const handleShow = () => setShowOffcanvas(true);

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
		fetch(`${import.meta.env.BASE_URL}docs/docsList.json`) // Caminho correto sem barra adicional
			.then((res) => res.json())
			.then((data: RouteItem[]) => {
				setRoutes(data);

				// Determinar quais menus devem estar expandidos com base na rota atual
				const basePath = import.meta.env.BASE_URL; // '/WSADOCS/'
				const currentPath = location.pathname.replace(basePath, '').replace(/\/$/, '');
				const path = findRoutePath(data, currentPath);
				if (path) {
					// Excluir o último item que representa a página atual
					setExpandedMenus(path.slice(0, -1));
				}
			})
			.catch((err) => console.error('Erro ao buscar a lista de documentos:', err));
	}, [location.pathname]);

	// Função para obter dinamicamente o componente de ícone
    // Função para obter dinamicamente o componente de ícone
    const getIconComponent = (iconName: string) => {
        const Icon = Icons[iconName as keyof typeof Icons];
        if (!Icon) {
            // Retorna o componente do ícone padrão se não encontrar o ícone especificado
            return FaIcons.FaQuestionCircle;
        }
        return Icon;
    };

	// Função recursiva para renderizar os itens do menu
	const renderNavItems = (routes: RouteItem[], level = 0) => {
		return routes.map((route, index) => {
			const IconComponent = getIconComponent(route.icon || '');
			const levelClass = `level-${level}`; // Classe para indentação

			// Determinar se a rota atual está ativa
			const isActive = route.path ? location.pathname === `${import.meta.env.BASE_URL}${route.path}` : false;

			// Determinar se algum dos filhos está ativo
			const isChildActive =
				route.children?.some((child) => child.path && location.pathname === `${import.meta.env.BASE_URL}${child.path}`) ||
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

				const ExpandIcon = isExpanded ? FaIcons.FaChevronDown : FaIcons.FaChevronRight; // Usar os componentes diretamente

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
						to={route.path!} // Caminho relativo sem barra inicial
						key={`${route.title}-${index}`}
						className={`nav-link ${isActive ? 'active' : ''} ${levelClass}`}
						onClick={() => setShowOffcanvas(false)} // Fecha o Offcanvas ao clicar no link
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
				if(route.path === ""){
					routeComponents.push(
						<Route
							key={""}
							path={""} // Caminho relativo sem barra inicial
							element={<DocPage page={""} />}
						/>
					);
				}else
				if (route.path) {
					routeComponents.push(
						<Route
							key={route.path}
							path={route.path} // Caminho relativo sem barra inicial
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
			{/* Navbar Responsiva */}
			<Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
				<Container>
					<Navbar.Brand as={Link} to="/">
						WSADOCS
					</Navbar.Brand>
					{/* Botão de Toggle para Mobile */}
					<Navbar.Toggle aria-controls="offcanvasNavbar" onClick={handleShow}>
						<FaIcons.FaBars />
					</Navbar.Toggle>
					<Navbar.Collapse id="basic-navbar-nav">
						{/* Opcional: Adicione links de navegação aqui */}
					</Navbar.Collapse>
				</Container>
			</Navbar>

			{/* Offcanvas para Menu Lateral em Mobile */}
			<Offcanvas show={showOffcanvas} onHide={handleClose} placement="start">
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Menu</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<Nav className="flex-column">
						{renderNavItems(routes)}
					</Nav>
				</Offcanvas.Body>
			</Offcanvas>

			<div className="d-flex">
				{/* Menu Lateral para Desktop */}
				<Nav className="flex-column sidebar bg-light p-3 d-none d-lg-block" style={{ minWidth: '250px' }}>
					{renderNavItems(routes)}
				</Nav>

				{/* Conteúdo Principal */}
				<Container className="content flex-grow-1 p-3">
					<Routes>
						{renderRoutes(routes)}
						{/* <Route path="*" element={<h1>Welcome to WSADOCS!</h1>} /> */}
					</Routes>
				</Container>
			</div>
		</div>
	);
};

export default App;
