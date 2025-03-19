# Sistema de Gestión de Estacionamiento

## Descripción
Sistema de gestión de estacionamiento desarrollado con NestJS que permite administrar espacios de estacionamiento, usuarios y reservas de manera eficiente y segura.

## Tecnologías Utilizadas
- NestJS
- TypeScript
- PostgreSQL
- MongoDB
- Docker
- Jest (Testing)

## Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn
- PostgreSQL
- MongoDB
- Docker (opcional)

## Instalación y Configuración

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd parking-system
```

2. **Instalar dependencias**
```bash
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.local.example .env.local
```

4. **Iniciar la aplicación**
```bash
# Modo desarrollo
yarn run start:dev

# Modo producción
yarn run start:prod
```

## Configuración Docker

```bash
# Construir y ejecutar con docker-compose
docker-compose up -d
```

## Estructura del Proyecto
```
src/
├── common/         # Servicios y utilidades comunes
│   ├── config/     # Configuraciones globales
│   ├── decorators/ # Decoradores personalizados
│   └── services/   # Servicios base y utilidades
├── parking/        # Módulo de gestión de estacionamiento
│   ├── dto/        # Data Transfer Objects
│   ├── entities/   # Entidades de estacionamiento
│   ├── services/   # Servicios de estacionamiento
│   └── controllers/# Controladores de estacionamiento
├── users/          # Módulo de usuarios
│   ├── dto/        # Data Transfer Objects
│   ├── entities/   # Entidades de usuario
│   ├── services/   # Servicios de usuarios
│   └── controllers/# Controladores de usuarios
├── auth/           # Módulo de autenticación
│   ├── guards/     # Guards de autenticación
│   ├── strategies/ # Estrategias de autenticación
│   └── services/   # Servicios de autenticación
├── reservations/   # Módulo de reservas
│   ├── dto/        # Data Transfer Objects
│   ├── entities/   # Entidades de reservas
│   ├── services/   # Servicios de reservas
│   └── controllers/# Controladores de reservas
├── traces/         # Módulo de trazas
│   ├── dto/        # Data Transfer Objects
│   ├── entities/   # Entidades de trazas
│   ├── services/   # Servicios de trazas
│   └── controllers/# Controladores de trazas
└── main.ts         # Punto de entrada de la aplicación
```

## Pruebas

```bash
# Ejecutar pruebas unitarias
yarn run test

# Ejecutar pruebas e2e
yarn run test:e2e

# Ver cobertura de pruebas
yarn run test:cov
```

## Documentación
La documentación de la API está disponible en:
- Swagger UI: `http://localhost:3000/api`
- Colección Postman: Importar el archivo `parking-system.postman_collection.json`

## Scripts Disponibles
- `yarn start` - Inicia la aplicación en modo desarrollo
- `yarn start:dev` - Inicia la aplicación con hot-reload
- `yarn start:prod` - Inicia la aplicación en modo producción
- `yarn test` - Ejecuta pruebas unitarias
- `yarn test:e2e` - Ejecuta pruebas end-to-end
- `yarn lint` - Ejecuta el linter

