# ESOTÉRICA · Backend — Docker

## 📁 Archivos para pasar al proyecto de IntelliJ

Los siguientes archivos deben **copiarse a la raíz del proyecto Spring Boot en IntelliJ** para poder dockerizarlo:

| Archivo | Destino en IntelliJ | Propósito |
|---------|---------------------|-----------|
| `Dockerfile` | `{proyecto-backend}/Dockerfile` | Build multi-etapa con Gradle 8.7 + Java 21 |
| `.dockerignore` | `{proyecto-backend}/.dockerignore` | Excluir archivos innecesarios del build |
| `docker-compose.yml` | `{proyecto-backend}/docker-compose.yml` | Orquestar backend + PostgreSQL + pgAdmin |

## 🐳 Cómo usar en IntelliJ

```bash
# 1. Navegar a la raíz del proyecto backend (donde está build.gradle)
cd /ruta/del/proyecto/spring-boot

# 2. Copiar los archivos de backend/ a esta carpeta

# 3. Construir y levantar
docker compose up --build
```

## 🔧 Variables de entorno

En `docker-compose.yml` ya están configuradas:

- `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/dbesoterica`
- `SPRING_DATASOURCE_USERNAME=postgres`
- `SPRING_DATASOURCE_PASSWORD=postgres`
- `ESOTERICA_JWT_SECRET=secure-jwt-secret-change-in-production`

Ajusta según tu configuración real.

## 🗄️ Servicios incluidos

| Servicio | Puerto | Acceso |
|----------|--------|--------|
| Backend (Spring Boot) | `8080` | `http://localhost:8080` |
| PostgreSQL | `5432` | `postgres:postgres@localhost:5432/dbesoterica` |
| pgAdmin (opcional) | `5050` | `http://localhost:5050` (admin@esoterica.com / admin) |
