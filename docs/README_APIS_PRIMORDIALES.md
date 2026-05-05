# APIs Primordiales del Proyecto de Inventario de Bienes

> Documento técnico detallado de los endpoints REST clave del sistema, su propósito funcional, qué módulos los consumen en frontend y cómo se relacionan con el flujo de negocio.

---

## 1) Panorama general de arquitectura

El proyecto está dividido en:

- **Backend (Spring Boot)**: expone APIs REST bajo prefijo `/api/*`.
- **Frontend (Angular)**: consume estas APIs desde `AssetsApiService`.
- **Base de datos (MySQL)**: persistencia de catálogos, adquisiciones, activos, asignaciones, bajas y usuarios.

### 1.1 Prefijo base y seguridad

- **Base URL backend**: `/api`.
- **Autenticación**: `HTTP Basic`.
- **Autorización por rol**: definida principalmente en `SecurityConfig`.

Roles de negocio:

- `ADMINISTRADOR`
- `COMPRAS`
- `INVENTARIO`
- `EMPLEADO`
- `FINANZAS`

---

## 2) Mapeo rápido: Módulo funcional → APIs principales

### 2.1 Login / sesión

- `GET /api/auth/me`
  - Verifica sesión y devuelve perfil (`username`, `role`, `employeeId`).
  - Consumido por `AuthService.login()`.

### 2.2 Menú / administración de usuarios

- `POST /api/admin/users`
  - Crea usuarios del sistema (con rol y opcional vínculo a empleado).
  - Consumido desde módulo menú administrativo.

### 2.3 Catálogos de adquisiciones

- `GET /api/acquisitions/suppliers`
- `POST /api/acquisitions/suppliers`
- `GET /api/acquisitions/budget-lines`
- `POST /api/acquisitions/budget-lines`

Se usan en:

- Módulo **Adquisiciones** (consulta para selección y validaciones).
- Módulo **Proveedores y partidas** (`catalogos`).

### 2.4 Adquisiciones (facturas)

- `POST /api/acquisitions/invoices`

Registra factura de compra con proveedor y partida presupuestaria.

### 2.5 Inventario maestro

- `POST /api/inventory/assets`
- `GET /api/inventory/assets`
- `GET /api/inventory/assets/{assetId}/qr.png`

### 2.6 Asignaciones y resguardos

- `POST /api/assignments`
- `POST /api/assignments/{assignmentId}/return`
- `GET /api/assignments/employee/{employeeId}`
- `GET /api/assignments`
- `GET /api/assignments/returns`

### 2.7 Portal empleado

- `GET /api/employee/me/assignments`
- `GET /api/employee/me/pending-assignments`
- `POST /api/employee/me/assignments/{assignmentId}/confirm`
- `POST /api/employee/me/disposals`
- `GET /api/employee/me/assets/{assetId}/qr.png`

### 2.8 Bajas y enajenación

- `POST /api/disposals`
- `POST /api/disposals/{id}/approve`
- `POST /api/disposals/{id}/reject`
- `GET /api/disposals/pending`

### 2.9 Reportes

- `GET /api/reports/invested-assets/summary`
- `GET /api/reports/employee/{employeeId}`
- `GET /api/reports/upcoming-disposals`
- `GET /api/reports/invested-assets/export?format=excel|pdf`
- `GET /api/reports/employee/me/export`

### 2.10 Datos maestros auxiliares (departamentos/empleados)

- `GET /api/data/departments`
- `POST /api/data/departments`
- `GET /api/data/employees`
- `POST /api/data/employees`

Se usan para el módulo nuevo de **administración de empleados** y flujos de vinculación.

---

## 3) Documentación detallada por dominio funcional

## 3.1 Autenticación y contexto de usuario

### `GET /api/auth/me`

**Objetivo:**
- Validar credenciales Basic Auth activas.
- Obtener identidad y rol para habilitar módulos en frontend.

**Respuesta típica:**
- `username`
- `role`
- `employeeId` (si el usuario está vinculado a un empleado)

**Módulos que dependen de este endpoint:**
- Login
- Menú dinámico por permisos
- Funcionalidades de “mi usuario” en módulo empleado

---

## 3.2 Administración de usuarios del sistema

### `POST /api/admin/users`

**Objetivo:**
- Crear cuentas del sistema para operar en plataforma.

**Uso de negocio:**
- Creación de usuarios de compras, inventario, finanzas y empleados.

**Notas funcionales:**
- Puede recibir `employeeId` para vincular cuenta a empleado (indispensable para portal empleado).

---

## 3.3 Adquisiciones: proveedores, partidas y facturas

## 3.3.1 Proveedores

### `GET /api/acquisitions/suppliers`

**Objetivo:**
- Obtener catálogo de proveedores con estado activo/inactivo.

**Campos de interés:**
- `id`, `name`, `taxId`, `email`, `phone`, `active`.

### `POST /api/acquisitions/suppliers`

**Objetivo:**
- Registrar nuevo proveedor para compras futuras.

**Reglas relevantes:**
- Se valida unicidad lógica por `taxId`.

## 3.3.2 Partidas presupuestarias

### `GET /api/acquisitions/budget-lines`

**Objetivo:**
- Listar partidas disponibles para clasificación financiera de compras.

### `POST /api/acquisitions/budget-lines`

**Objetivo:**
- Crear partida presupuestaria (`code`, `description`, `allocatedAmount`).

## 3.3.3 Facturas de compra

### `POST /api/acquisitions/invoices`

**Objetivo:**
- Registrar adquisición formal con proveedor y partida.

**Payload principal:**
- `invoiceNumber`, `invoiceDate`, `totalAmount`, `supplierId`, `budgetLineId`, `notes`.

**Validaciones de negocio importantes:**
- La factura no debe existir previamente por número.
- El proveedor debe existir.
- La partida debe existir.
- **Proveedor inactivo bloquea la compra** (regla clave de negocio).

**Módulo frontend:**
- `AdquisicionesPage`.

---

## 3.4 Inventario maestro y QR

## 3.4.1 Registro de activos

### `POST /api/inventory/assets`

**Objetivo:**
- Dar de alta un activo/bien en inventario maestro.

**Payload principal:**
- `assetCode` (opcional, autogenerable), `name`, `description`, `serialNumber`,
  `acquisitionDate`, `acquisitionCost`, `tagType`, `tagValue`, `location` (opcional), `purchaseInvoiceId`.

**Reglas de negocio destacadas:**
- `serialNumber` único.
- `tagValue` único.
- Si no se envía ubicación, se asigna por defecto **“Almacén central”**.
- Estado inicial esperado: `EN_ALMACEN`.

## 3.4.2 Consulta de catálogo maestro

### `GET /api/inventory/assets`

**Objetivo:**
- Obtener el inventario maestro para visualización y reportes operativos.

**Campos clave en UI:**
- ID, código, nombre, ubicación, estado, valor unitario.

## 3.4.3 Código QR de activo

### `GET /api/inventory/assets/{assetId}/qr.png`

**Objetivo:**
- Generar/retornar imagen PNG QR de un activo.

**Contenido funcional del QR:**
- Código del bien
- Nombre del bien
- Ubicación
- Estado

**Módulo frontend:**
- Inventario (catálogo maestro).

---

## 3.5 Asignaciones y resguardos

## 3.5.1 Crear asignación

### `POST /api/assignments`

**Objetivo:**
- Registrar asignación entre activo y empleado.

**Flujo vigente:**
- Se registra en estado `PENDIENTE_CONFIRMACION`.
- El activo no queda definitivamente confirmado hasta acción del empleado.

## 3.5.2 Confirmación por empleado

### `POST /api/employee/me/assignments/{assignmentId}/confirm`

**Objetivo:**
- El empleado confirma recepción y aceptación de términos.

**Efectos de negocio:**
- Asignación cambia a `ACTIVA`.
- Activo cambia a estado `ASIGNADO`.
- Custodio actual se actualiza al empleado.
- Ubicación del activo pasa al departamento del empleado.

## 3.5.3 Devolución

### `POST /api/assignments/{assignmentId}/return`

**Objetivo:**
- Registrar devolución del activo.

**Efectos:**
- Asignación cambia a `DEVUELTA`.
- Activo vuelve a `EN_ALMACEN`.
- Custodio queda nulo.
- Ubicación vuelve a “Almacén central”.

## 3.5.4 Consultas de asignaciones

- `GET /api/assignments/employee/{employeeId}`: historial por empleado.
- `GET /api/assignments`: listado general.
- `GET /api/assignments/returns`: solo devoluciones.

---

## 3.6 Portal de empleado

### `GET /api/employee/me/assignments`

**Objetivo:**
- Ver asignaciones activas del usuario autenticado.

### `GET /api/employee/me/pending-assignments`

**Objetivo:**
- Ver asignaciones pendientes por confirmar.

### `POST /api/employee/me/disposals`

**Objetivo:**
- Permitir que empleado solicite baja de sus propios activos.

### `GET /api/employee/me/assets/{assetId}/qr.png`

**Objetivo:**
- Obtener QR del activo desde la sección “Mis activos”.

---

## 3.7 Bajas y enajenación

## 3.7.1 Crear solicitud de baja

### `POST /api/disposals`

**Objetivo:**
- Registrar solicitud de baja.

**Regla importante:**
- El estado inicial funcional es `SOLICITADA`.

## 3.7.2 Aprobar solicitud

### `POST /api/disposals/{id}/approve`

**Objetivo:**
- Aprobar baja con trazabilidad de aprobación y valor final.

**Efecto clave:**
- Activo asociado pasa a `DADO_DE_BAJA`.

## 3.7.3 Rechazar solicitud

### `POST /api/disposals/{id}/reject`

**Objetivo:**
- Rechazar solicitud de baja (con `approvedBy` como responsable de decisión).

## 3.7.4 Pendientes

### `GET /api/disposals/pending`

**Objetivo:**
- Obtener solicitudes en estado pendiente de resolución.

---

## 3.8 Reportes

## 3.8.1 Resumen de inversión

### `GET /api/reports/invested-assets/summary`

**Objetivo:**
- Calcular total invertido en activos.

## 3.8.2 Reporte por empleado

### `GET /api/reports/employee/{employeeId}`

**Objetivo:**
- Obtener historial/asignaciones para un empleado específico.

## 3.8.3 Reporte general operativo

### `GET /api/reports/upcoming-disposals`

**Objetivo:**
- Devolver activos con vista operativa para seguimiento (incluye estados, asignación, etc.).

## 3.8.4 Exportación general CSV/PDF

### `GET /api/reports/invested-assets/export?format=excel|pdf`

**Objetivo:**
- Exportar reporte general de bienes en CSV o PDF.

## 3.8.5 Exportación de “mis activos” en PDF

### `GET /api/reports/employee/me/export`

**Objetivo:**
- Descargar reporte PDF del empleado autenticado.

---

## 3.9 Datos maestros auxiliares (departamentos y empleados)

Estos endpoints existen en `/api/data` y son críticos para preparar catálogos internos.

### Departamentos

- `GET /api/data/departments`: lista departamentos.
- `POST /api/data/departments`: crea departamento.

### Empleados

- `GET /api/data/employees`: lista empleados.
- `POST /api/data/employees`: crea empleado con vínculo a departamento.

**Módulo frontend que los consume:**
- `admin-empleados` (creación y listado de empleados).

---

## 4) Endpoints consumidos en frontend (`AssetsApiService`)

Resumen de métodos de servicio y endpoint asociado:

- `createInvoice` → `POST /api/acquisitions/invoices`
- `createSupplier` → `POST /api/acquisitions/suppliers`
- `listSuppliers` → `GET /api/acquisitions/suppliers`
- `createBudgetLine` → `POST /api/acquisitions/budget-lines`
- `listBudgetLines` → `GET /api/acquisitions/budget-lines`
- `createAsset` → `POST /api/inventory/assets`
- `listAssets` → `GET /api/inventory/assets`
- `inventoryAssetQr` → `GET /api/inventory/assets/{id}/qr.png`
- `employeeAssetQr` → `GET /api/employee/me/assets/{id}/qr.png`
- `createAssignment` → `POST /api/assignments`
- `returnAssignment` → `POST /api/assignments/{id}/return`
- `listAssignmentsByEmployee` → `GET /api/assignments/employee/{id}`
- `listReturnedAssignments` → `GET /api/assignments/returns`
- `myAssignments` → `GET /api/employee/me/assignments`
- `myPendingAssignments` → `GET /api/employee/me/pending-assignments`
- `confirmAssignment` → `POST /api/employee/me/assignments/{id}/confirm`
- `requestDisposal` → `POST /api/disposals`
- `requestDisposalByEmployee` → `POST /api/employee/me/disposals`
- `approveDisposal` → `POST /api/disposals/{id}/approve`
- `rejectDisposal` → `POST /api/disposals/{id}/reject`
- `listPendingDisposals` → `GET /api/disposals/pending`
- `listDepartments` → `GET /api/data/departments`
- `createEmployeeData` → `POST /api/data/employees`
- `listEmployees` → `GET /api/data/employees`
- `createUser` → `POST /api/admin/users`
- `investedSummary` → `GET /api/reports/invested-assets/summary`
- `employeeReport` → `GET /api/reports/employee/{id}`
- `upcomingDisposals` → `GET /api/reports/upcoming-disposals`
- `exportInvested` → `GET /api/reports/invested-assets/export`
- `exportMyAssetsPdf` → `GET /api/reports/employee/me/export`

---

## 5) Recomendaciones operativas para consumo API

1. **Validar rol antes de habilitar acciones UI**, aunque backend ya protege rutas.
2. **Manejar errores de negocio explícitos** (`BusinessException`) mostrando mensajes de backend al usuario.
3. **No asumir payload completo** en vistas de reporte (usar render defensivo cuando aplique).
4. **Registrar IDs de referencia** (proveedor, partida, factura, activo, empleado) en auditorías internas.
5. **Mantener sincronía estado-UI** tras operaciones mutables (crear, aprobar, confirmar, devolver) refrescando listados.

---

## 6) Glosario rápido de estados de negocio

- **Activo (`AssetStatus`)**:
  - `EN_ALMACEN`
  - `ASIGNADO`
  - `DADO_DE_BAJA`

- **Asignación (`AssignmentStatus`)**:
  - `PENDIENTE_CONFIRMACION`
  - `ACTIVA`
  - `DEVUELTA`

- **Baja (`DisposalStatus`)**:
  - `SOLICITADA`
  - `APROBADA`
  - `RECHAZADA`
  - `EJECUTADA` (según evolución futura del flujo)

---

## 7) Trazabilidad: módulos UI donde aplica cada API

- **Login**: `/api/auth/me`
- **Menú/Admin usuarios**: `/api/admin/users`
- **Adquisiciones**: `/api/acquisitions/*`
- **Catálogos**: `/api/acquisitions/suppliers`, `/api/acquisitions/budget-lines`
- **Inventario**: `/api/inventory/assets`, `/api/inventory/assets/{id}/qr.png`
- **Asignaciones**: `/api/assignments/*`
- **Empleado**: `/api/employee/me/*`
- **Bajas**: `/api/disposals/*`
- **Reportes**: `/api/reports/*`
- **Admin empleados**: `/api/data/departments`, `/api/data/employees`

---

## 8) Conclusión

Este documento concentra los **APIs primordiales** del proyecto con foco en negocio, consumo frontend y aplicación por módulo. Debe usarse como guía base para:

- Onboarding técnico.
- QA funcional por módulo.
- Integraciones futuras (móvil, terceros, BI).
- Auditoría de permisos por rol.

