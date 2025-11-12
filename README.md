# Frontend - Sistema de Gestión E-commerce

Frontend React + Vite para el sistema de gestión de e-commerce.

## Tecnologías

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Context API (State Management)

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura:

```env
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=tu_clave_gemini
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

### 4. Compilar para producción

```bash
npm run build
```

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   ├── ai/         # Componentes de IA
│   │   ├── common/      # Componentes comunes
│   │   ├── dashboard/  # Componentes del dashboard
│   │   ├── layout/      # Layouts y navegación
│   │   ├── store/      # Componentes de tienda
│   │   └── ui/          # Componentes UI básicos
│   ├── context/         # Context API (Auth, Cart, Theme)
│   ├── pages/           # Páginas de la aplicación
│   ├── api.js           # Cliente API
│   └── utils/           # Utilidades
├── public/              # Archivos estáticos
└── package.json         # Dependencias
```

## Características

- Autenticación con roles (Admin, Vendedor, Cliente, Invitado)
- Dashboard con métricas en tiempo real
- Gestión de productos, clientes, ventas e inventario
- Punto de venta (POS) integrado
- Carrito de compras
- Reportes y exportación (PDF, Excel)
- Integración con IA (Gemini) para consultas inteligentes
- Diseño minimalista y responsive

## Deployment

Para deployment en Azure Static Web Apps, configura las variables de entorno en Azure Portal.

**IMPORTANTE**: Nunca subas el archivo `.env` con credenciales reales a Git.

