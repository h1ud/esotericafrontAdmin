# 🐳 Tutorial: Cómo ver tus imágenes en Docker Desktop

## Paso 1: Abrir Docker Desktop

1. Busca **Docker Desktop** en el menú de inicio (Windows) o Launchpad (Mac)
2. Ábrelo — verás esta pantalla principal con el **Dashboard**

![Docker Desktop Dashboard](https://docs.docker.com/desktop/images/dashboard.png)

## Paso 2: Ir a la sección "Images" (Imágenes)

En el panel izquierdo, haz clic en la pestaña **Images** (el icono del cubo/tarro).

Aquí aparecen todas las imágenes Docker que has construido o descargado.

## Paso 3: Construir tu imagen (si aún no lo hiciste)

### Si usas docker-compose (recomendado):
```bash
# En la raíz del proyecto (donde está docker-compose.yml)
docker compose build
```

### Si solo usas el Dockerfile:
```bash
docker build -t esoterica-frontend .
```

### Para el backend:
```bash
# En la carpeta raíz del backend Spring Boot
docker build -t esoterica-backend .
```

## Paso 4: Ver tu imagen aparecer en Docker Desktop

Después de construir, en la pestaña **Images** verás algo como:

| Name | Tag | Size |
|------|-----|------|
| esoterica-frontend | latest | 120 MB |
| esoterica-backend | latest | 280 MB |
| postgres | 16-alpine | 200 MB |

Puedes:
- 🖱️ Hacer clic en la imagen para ver detalles
- ▶️ Presionar el botón **Run** para ejecutarla
- 🗑️ Eliminarla con el menú de tres puntos

## Paso 5: Ejecutar y ver contenedores en vivo

1. Ve a la pestaña **Containers** (icono del barco 🚢)
2. Verás tus contenedores corriendo con:
   - Nombre del contenedor
   - Estado (running / stopped)
   - Puertos mapeados
   - Tiempo de ejecución
3. Puedes:
   - 📋 Ver los **logs** en tiempo real
   - 🖥️ Abrir una terminal dentro del contenedor
   - ⏯️ Iniciar / Detener / Reiniciar
   - 🌐 Hacer clic en el puerto para abrir en el navegador

## Comandos rápidos para referencia

```bash
# Ver imágenes en terminal
docker images

# Ver contenedores activos
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Construir imagen
docker build -t nombre-imagen .

# Ejecutar contenedor
docker run -p 4200:80 nombre-imagen

# Ver logs de un contenedor
docker logs nombre-contenedor

# Detener contenedor
docker stop nombre-contenedor

# Eliminar contenedor
docker rm nombre-contenedor

# Eliminar imagen
docker rmi nombre-imagen

# Todo con compose
docker compose up --build   # Construye y levanta
docker compose down         # Detiene y elimina
docker compose logs -f      # Logs en tiempo real
```

## Tip: Si no ves tu imagen

1. Asegúrate de que el build se completó sin errores
2. En Docker Desktop, haz clic en el botón 🔄 **Refresh** (recargar)
3. En la barra de búsqueda, escribe el nombre de tu imagen
