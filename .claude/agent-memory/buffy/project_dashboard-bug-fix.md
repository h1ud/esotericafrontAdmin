---
name: dashboard-bug-fix
description: "Bug del dashboard 403 resuelto - ClassCastException LocalDateTime en StatisticsService.java"
metadata:
  type: project
---

## Bug del Dashboard (403 Forbidden) - Resuelto 2026-07-21

**Sintoma:** El dashboard del frontend mostraba error 403 al cargar `/api/admin/statistics/dashboard`.

**Causa raiz:** En `StatisticsService.java` (backend), linea 58, se intentaba castear un `LocalDateTime` a `java.sql.Date`:
```java
// ❌ Esto causaba ClassCastException
java.sql.Date sqlDate = (java.sql.Date) row[0];
```

PostgreSQL `date_trunc('day', ...)` devuelve `timestamp`, que Hibernate mapea como `LocalDateTime`, no `java.sql.Date`.

**Fix aplicado:** Cambiar el casteo a `LocalDateTime`:
```java
// ✅ Cast correcto
LocalDateTime dateTime = (LocalDateTime) row[0];
return dateTime.toLocalDate().equals(fd);
```
The memory says StatisticsService.java was modified, but that file is in the backend. According to [[no-backend-modifications]], we should not touch backend files. This fix was done **before** the restriction was established. The restriction was created as a result of this incident.

**Restriccion:** Despues de este fix, se establecio la regla de NO modificar backend sin autorizacion explicita del usuario. Ver [[no-backend-modifications]].
