# SIS Académico — Sistema de Inscripciones (UMSS)

Sistema completo de inscripción de materias para estudiantes universitarios, basado en el
modelo entidad-relación provisto y en el diseño de Figma "SIS Académico".

**Stack:** Node.js + Express · PostgreSQL · React (Vite)

## Índice
1. [Estructura del proyecto](#estructura-del-proyecto)
2. [Requisitos](#requisitos)
3. [Instalación local (manual)](#instalación-local-manual)
4. [Instalación local con Docker (recomendado)](#instalación-local-con-docker-recomendado)
5. [Despliegue con URL pública](#despliegue-con-url-pública)
6. [Credenciales de prueba](#credenciales-de-prueba)
7. [Endpoints de la API](#endpoints-de-la-api)
8. [Modelo de datos](#modelo-de-datos)
9. [Notas y siguientes pasos](#notas-y-siguientes-pasos)

---

## Estructura del proyecto

```
sistema-inscripciones/
├── backend/                 # API REST (Node.js + Express + PostgreSQL)
│   ├── db/
│   │   ├── schema.sql       # DDL completo (13 tablas del modelo ER)
│   │   ├── seed.sql         # Datos de ejemplo
│   │   ├── migrate.js       # Aplica schema.sql
│   │   └── seed.js          # Aplica seed.sql + genera password real
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js            # Pool de conexión pg
│   │   ├── middleware/auth.js
│   │   └── routes/          # auth, perfil, inscripcion, historial, horario, dashboard
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, Kardex, Inscripcion, Horario, Perfil
│   │   ├── components/       # Layout, Sidebar, Topbar, UI
│   │   ├── api.js            # Cliente HTTP
│   │   └── AuthContext.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml        # Levanta db + backend + frontend con un comando
├── render.yaml                # Blueprint de despliegue en Render
└── README.md
```

## Requisitos

- Node.js ≥ 18
- PostgreSQL ≥ 14 (si no usas Docker)
- Docker y Docker Compose (opcional, recomendado)

---

## Instalación local (manual)

### 1. Base de datos

Crea una base de datos PostgreSQL vacía:

```bash
createdb sis_academico
# o desde psql:
# CREATE DATABASE sis_academico;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con los datos de tu PostgreSQL (host, usuario, password, etc.)

npm install
npm run db:migrate     # crea las 13 tablas (schema.sql)
npm run db:seed        # carga datos de ejemplo + usuario demo
npm run dev            # levanta la API en http://localhost:4000
```

Verifica que responde: `curl http://localhost:4000/api/health`

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev             # levanta la app en http://localhost:5173
```

Abre `http://localhost:5173` — el frontend ya está configurado (`vite.config.js`) para
redirigir automáticamente las peticiones `/api/*` al backend en `localhost:4000`.

---

## Instalación local con Docker (recomendado)

Con Docker no necesitas instalar PostgreSQL ni Node localmente.

```bash
docker compose up --build -d
```

Esto levanta:
- `db` → PostgreSQL en el puerto `5432`
- `backend` → API en `http://localhost:4000`
- `frontend` → App en `http://localhost:8080`

La primera vez, inicializa la base de datos (el contenedor `db` arranca vacío):

```bash
docker compose exec backend node db/migrate.js
docker compose exec backend node db/seed.js
```

Abre `http://localhost:8080` y usa las [credenciales de prueba](#credenciales-de-prueba).

Para detener todo: `docker compose down` (agrega `-v` para borrar también los datos).

---

## Despliegue con URL pública

Este proyecto no se despliega automáticamente desde este entorno de desarrollo (no hay
capacidad de hosting persistente aquí), pero queda 100% listo para desplegarse en minutos
en un servicio gratuito. Dos rutas recomendadas:

### Opción A — Render (recomendada, incluye `render.yaml`)

1. Sube este proyecto a un repositorio de GitHub.
2. En [render.com](https://render.com) → **New → Blueprint** → conecta el repositorio.
   Render detectará `render.yaml` y creará automáticamente:
   - una base de datos PostgreSQL gratuita (`sis-academico-db`)
   - el servicio backend (`sis-academico-backend`, Docker)
   - el servicio frontend (`sis-academico-frontend`, Docker)
3. Cuando el backend termine de desplegar, copia su URL pública (algo como
   `https://sis-academico-backend.onrender.com`).
4. En el servicio **frontend** → *Environment* → agrega la variable:
   `VITE_API_URL = https://sis-academico-backend.onrender.com/api`
   y haz **Manual Deploy → Clear build cache & deploy** (Vite necesita reconstruir para
   incluir la variable).
5. Inicializa la base de datos una sola vez, desde la pestaña *Shell* del servicio backend:
   ```bash
   node db/migrate.js
   node db/seed.js
   ```
6. Comparte la URL pública del servicio **frontend** con tu profesor.

### Opción B — Railway

1. Sube el proyecto a GitHub.
2. En [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
3. Agrega un plugin de **PostgreSQL** desde el marketplace de Railway.
4. Crea un servicio para `backend/` (Railway detecta el `Dockerfile`) y configura las
   variables de entorno `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` con los
   valores que Railway genera para el plugin de PostgreSQL, más `JWT_SECRET`.
5. Crea un segundo servicio para `frontend/`, con la variable `VITE_API_URL` apuntando a
   la URL pública que Railway asigna al backend, seguida de `/api`.
6. Ejecuta la migración y el seed desde la consola del servicio backend (mismo comando que
   en la Opción A, paso 5).
7. Railway te da una URL pública `https://<proyecto>.up.railway.app` para el frontend.

> En ambas opciones, el paso clave a no olvidar es correr `node db/migrate.js` y
> `node db/seed.js` una vez, contra la base de datos ya desplegada.

---

## Credenciales de prueba

| Código SIS | Contraseña   |
|------------|--------------|
| 202500350  | `Umss2026!`  |

El seed también incluye: 1 carrera (Ingeniería de Sistemas), 14 materias, 5 docentes,
4 aulas, una gestión activa con 5 grupos ofertados (con horarios y cupos), historial
académico de 10 materias cursadas (para poblar el Kardex y el Dashboard), y 2 materias
ya inscritas en la gestión activa (para probar Horario e Inscripción de una).

---

## Endpoints de la API

Todos (salvo `/auth/login` y `/health`) requieren `Authorization: Bearer <token>`.

| Método | Ruta                          | Descripción                                   |
|--------|-------------------------------|------------------------------------------------|
| GET    | `/api/health`                 | Estado del servicio                             |
| POST   | `/api/auth/login`             | Login (`cod_siss`, `password`) → token JWT      |
| GET    | `/api/auth/me`                | Datos básicos de la sesión actual               |
| GET    | `/api/dashboard`               | Resumen para la pantalla de Inicio              |
| GET    | `/api/perfil`                  | Perfil académico + estado de cuenta             |
| PATCH  | `/api/perfil`                  | Actualiza correo / teléfono                     |
| GET    | `/api/inscripcion/oferta`      | Grupos ofertados en la gestión activa           |
| GET    | `/api/inscripcion/mis-materias`| Materias inscritas en la gestión activa         |
| POST   | `/api/inscripcion`             | Inscribe a un grupo (`id_grupo`)                |
| DELETE | `/api/inscripcion/:id`         | Retira una inscripción                          |
| GET    | `/api/historial`               | Kardex completo + promedios                     |
| GET    | `/api/horario`                 | Horario semanal armado desde las inscripciones  |

La ruta de inscripción valida: cupo disponible, prerrequisitos aprobados, plazo de
inscripción vigente, no duplicar materia y un máximo de 7 materias por gestión.

---

## Modelo de datos

`backend/db/schema.sql` implementa exactamente las 13 entidades de tu diagrama ER:
`facultad`, `carrera`, `estudiante`, `materia`, `prerrequisito`, `docente`,
`docente_materia`, `gestion_academica`, `grupo`, `horario`, `aula`, `historial`,
`inscripcion`. La única adición sobre el diagrama original es la columna
`estudiante.password_hash`, necesaria para implementar el login real (no estaba
contemplada en el modelo entregado).

---

## Notas y siguientes pasos

- El diseño de Figma incluye CAPTCHA y selector de fecha de nacimiento en el login como
  factores visuales de verificación; la API actual autentica con `cod_siss` + contraseña,
  que son los datos que el modelo de datos realmente soporta. Se puede añadir verificación
  de fecha de nacimiento como segundo factor si lo necesitas.
- Los campos de "Estado de cuenta" en Perfil (matrícula, examen de grado, deuda de
  biblioteca) son valores de ejemplo: no existen en el modelo ER entregado y quedarían
  pendientes de un módulo de tesorería/biblioteca.
- Para producción real: cambia `JWT_SECRET`, restringe `CORS_ORIGIN` al dominio del
  frontend, y activa HTTPS.
