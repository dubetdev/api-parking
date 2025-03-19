# Sistema de Gestión de Estacionamiento

## Descripción
Sistema de gestión de estacionamiento desarrollado con NestJS que permite administrar espacios de estacionamiento, usuarios y reservas de manera eficiente y segura.

## Tecnologías Utilizadas
- NestJS (Framework de Backend)
- TypeScript
- PostgreSQL (Base de datos principal)
- MongoDB (Base de datos para trazas)
- Docker & Docker Compose
- Jest (Testing)
- Swagger (Documentación API)
- JWT (Autenticación)

## Requisitos Previos
- Node.js (v16 o superior)
- npm (v8 o superior) o yarn
- PostgreSQL (v13 o superior)
- MongoDB (v5 o superior)
- Docker & Docker Compose (opcional)

## Instalación y Configuración

1. **Clonar el repositorio**
```bash
git clone git@github.com:dubetdev/api-parking.git

cd api-parking
```

2. **Instalar dependencias**
```bash
yarn install

```

3. **Configurar variables de entorno**
```bash
cp .env.local .env
```

Edita el archivo `.env` con tus configuraciones:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=usuario
DB_PASSWORD=contraseña
DB_NAME=parking_db

# MongoDB
MONGO_URI=mongodb://localhost:27017/parking_traces

# JWT
JWT_SECRET=tu_secret_key
JWT_EXPIRATION=24h
```

4. **Iniciar la aplicación**
```bash
# Modo desarrollo
yarn start:dev
# o
npm run start:dev

# Modo producción
yarn start:prod
# o
npm run start:prod
```

## Configuración Docker

1. **Construir y ejecutar servicios**
```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

2. **Detener servicios**
```bash
docker-compose down
```
