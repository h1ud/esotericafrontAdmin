---
name: backend-location
description: "Ubicacion del proyecto backend Spring Boot en el sistema de archivos"
metadata:
  type: reference
---

El proyecto backend Spring Boot de Esoterica se encuentra en:
`C:\Users\LENOVO\Documents\utp\ciclo7\proto\esoterica`

**Stack del backend:**
- Spring Boot con Gradle (Kotlin DSL - `build.gradle.kts`)
- Java 17+
- PostgreSQL
- JPA/Hibernate
- Spring Security con JWT
- Arquitectura por capas: controller, service, repository, domain (entity, dto)

**Estructura clave:**
- `src/main/java/com/webproject/esoteria/controller/` - REST controllers
- `src/main/java/com/webproject/esoteria/service/` - Business logic
- `src/main/java/com/webproject/esoteria/repository/` - JPA repositories
- `src/main/java/com/webproject/esoteria/domain/entity/` - JPA entities
- `src/main/java/com/webproject/esoteria/domain/dto/` - Data transfer objects
- `src/main/java/com/webproject/esoteria/security/` - JWT y configuracion de seguridad
