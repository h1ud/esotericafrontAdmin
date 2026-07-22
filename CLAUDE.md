# Esoterica Frontend - Angular POS System

## Stack
- Angular (standalone components, routing lazy-load)
- Tailwind CSS v4
- GSAP para animaciones
- TypeScript

## Proyectos relacionados
- **Backend**: `C:\Users\LENOVO\Documents\utp\ciclo7\proto\esoterica` (Spring Boot)
- Proxy API: `localhost:4200` → `localhost:8080` via `proxy.conf.json`

## Agentes
- **Buffy**: Agente principal de frontend (definido en `.claude/agents/buffy.md`)
- **spring-backend-mentor**: Agente de backend (en el proyecto backend)

## 🚫 REGLA CRITICA
**NO MODIFICAR ARCHIVOS DEL BACKEND.** Solo lectura/consulta. Si necesitas cambios en el backend, reportalo al usuario.

## Rutas principales
| Ruta | Componente | Descripcion |
|------|-----------|-------------|
| `/login` | Login | Autenticacion |
| `/admin/dashboard` | Dashboard | Estadisticas y KPIs |
| `/admin/sales` | Sales | Lista de ventas |
| `/admin/menu` | Menu | Gestion de productos |
| `/admin/clients` | Clients | Gestion de clientes |
| `/admin/employees` | Employees | Gestion de empleados |
| `/admin/codes` | Codes | Codigos promocionales |
| `/pos-home` | PosHome | Punto de venta POS |
| `/passwordReset` | PasswordReset | Recuperar contrasena |

## Convenciones
- Componentes standalone (no NgModules)
- Servicios con `providedIn: 'root'`
- Estilos con Tailwind CSS + CSS personalizado cuando sea necesario
- Animaciones con GSAP en lifecycle hooks
