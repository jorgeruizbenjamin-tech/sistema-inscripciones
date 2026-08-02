-- ============================================================
-- SIS Académico - Sistema de Inscripciones
-- Esquema de base de datos (PostgreSQL)
-- Basado en el modelo entidad-relación proporcionado por el usuario
-- ============================================================

DROP TABLE IF EXISTS inscripcion CASCADE;
DROP TABLE IF EXISTS historial CASCADE;
DROP TABLE IF EXISTS horario CASCADE;
DROP TABLE IF EXISTS aula CASCADE;
DROP TABLE IF EXISTS grupo CASCADE;
DROP TABLE IF EXISTS gestion_academica CASCADE;
DROP TABLE IF EXISTS docente_materia CASCADE;
DROP TABLE IF EXISTS docente CASCADE;
DROP TABLE IF EXISTS prerrequisito CASCADE;
DROP TABLE IF EXISTS materia CASCADE;
DROP TABLE IF EXISTS estudiante CASCADE;
DROP TABLE IF EXISTS carrera CASCADE;
DROP TABLE IF EXISTS facultad CASCADE;

-- ---------------------------------------------------------
-- facultad
-- ---------------------------------------------------------
CREATE TABLE facultad (
    id_facultad     SERIAL PRIMARY KEY,
    nombre_facultad VARCHAR(150) NOT NULL,
    sigla_facultad  VARCHAR(20) NOT NULL UNIQUE
);

-- ---------------------------------------------------------
-- carrera
-- ---------------------------------------------------------
CREATE TABLE carrera (
    id_carrera         SERIAL PRIMARY KEY,
    id_facultad        INT NOT NULL REFERENCES facultad(id_facultad),
    nombre_carrera     VARCHAR(150) NOT NULL,
    codigo_carrera     VARCHAR(20) NOT NULL UNIQUE,
    duracion_semestres INT NOT NULL
);

-- ---------------------------------------------------------
-- estudiante
-- (se agrega password_hash, requerido para el login del SIS,
--  no presente en el diagrama original pero necesario para
--  implementar autenticación real)
-- ---------------------------------------------------------
CREATE TABLE estudiante (
    cod_siss           INT PRIMARY KEY,
    id_carrera         INT NOT NULL REFERENCES carrera(id_carrera),
    nombre_estudiante  VARCHAR(100) NOT NULL,
    apellido_estudiante VARCHAR(100) NOT NULL,
    ci                 VARCHAR(20) NOT NULL UNIQUE,
    correo             VARCHAR(150) NOT NULL UNIQUE,
    telefono           VARCHAR(30),
    fecha_nacimiento   DATE,
    password_hash      VARCHAR(255) NOT NULL,
    creado_en          TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- materia
-- ---------------------------------------------------------
CREATE TABLE materia (
    id_materia     SERIAL PRIMARY KEY,
    id_carrera     INT NOT NULL REFERENCES carrera(id_carrera),
    codigo         VARCHAR(20) NOT NULL UNIQUE,
    nombre_materia VARCHAR(150) NOT NULL,
    creditos       INT NOT NULL,
    semestre       INT NOT NULL
);

-- ---------------------------------------------------------
-- prerrequisito (relación reflexiva sobre materia)
-- ---------------------------------------------------------
CREATE TABLE prerrequisito (
    id_prerrequisito   SERIAL PRIMARY KEY,
    id_materia         INT NOT NULL REFERENCES materia(id_materia) ON DELETE CASCADE,
    id_materia_requisito INT NOT NULL REFERENCES materia(id_materia) ON DELETE CASCADE,
    UNIQUE (id_materia, id_materia_requisito)
);

-- ---------------------------------------------------------
-- docente
-- ---------------------------------------------------------
CREATE TABLE docente (
    id_docente      SERIAL PRIMARY KEY,
    nombre_docente  VARCHAR(100) NOT NULL,
    apellido_docente VARCHAR(100) NOT NULL,
    correo_docente  VARCHAR(150) UNIQUE,
    telefono_docente VARCHAR(30),
    categoria       VARCHAR(50)
);

-- ---------------------------------------------------------
-- docente_materia (tabla puente N:M)
-- ---------------------------------------------------------
CREATE TABLE docente_materia (
    id_docente INT NOT NULL REFERENCES docente(id_docente),
    id_materia INT NOT NULL REFERENCES materia(id_materia),
    PRIMARY KEY (id_docente, id_materia)
);

-- ---------------------------------------------------------
-- gestion_academica
-- ---------------------------------------------------------
CREATE TABLE gestion_academica (
    id_gestion               SERIAL PRIMARY KEY,
    nombre_gestion           VARCHAR(50) NOT NULL,
    fecha_inicio             DATE NOT NULL,
    fecha_fin                DATE NOT NULL,
    fecha_limite_inscripcion DATE NOT NULL,
    estado                   VARCHAR(20) NOT NULL DEFAULT 'planificada'
        CHECK (estado IN ('planificada','activa','cerrada'))
);

-- ---------------------------------------------------------
-- aula
-- ---------------------------------------------------------
CREATE TABLE aula (
    id_aula     SERIAL PRIMARY KEY,
    nombre_aula VARCHAR(50) NOT NULL,
    edificio    VARCHAR(50),
    capacidad   INT NOT NULL
);

-- ---------------------------------------------------------
-- grupo
-- ---------------------------------------------------------
CREATE TABLE grupo (
    id_grupo   SERIAL PRIMARY KEY,
    id_materia INT NOT NULL REFERENCES materia(id_materia),
    id_docente INT NOT NULL REFERENCES docente(id_docente),
    id_gestion INT NOT NULL REFERENCES gestion_academica(id_gestion),
    paralelo   VARCHAR(10) NOT NULL,
    cupo       INT NOT NULL
);

-- ---------------------------------------------------------
-- horario
-- ---------------------------------------------------------
CREATE TABLE horario (
    id_horario  SERIAL PRIMARY KEY,
    id_grupo    INT NOT NULL REFERENCES grupo(id_grupo) ON DELETE CASCADE,
    id_aula     INT NOT NULL REFERENCES aula(id_aula),
    dia         VARCHAR(15) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_final  TIME NOT NULL
);

-- ---------------------------------------------------------
-- historial (kardex)
-- ---------------------------------------------------------
CREATE TABLE historial (
    id_historial SERIAL PRIMARY KEY,
    cod_siss     INT NOT NULL REFERENCES estudiante(cod_siss),
    id_materia   INT NOT NULL REFERENCES materia(id_materia),
    id_gestion   INT NOT NULL REFERENCES gestion_academica(id_gestion),
    nota_final   NUMERIC(5,2),
    estado       VARCHAR(20) NOT NULL
        CHECK (estado IN ('APR','REP','ABN','CUR'))
);

-- ---------------------------------------------------------
-- inscripcion
-- ---------------------------------------------------------
CREATE TABLE inscripcion (
    id_inscripcion    SERIAL PRIMARY KEY,
    cod_siss          INT NOT NULL REFERENCES estudiante(cod_siss),
    id_grupo          INT NOT NULL REFERENCES grupo(id_grupo),
    fecha_inscripcion TIMESTAMP NOT NULL DEFAULT now(),
    estado            VARCHAR(20) NOT NULL DEFAULT 'inscrito'
        CHECK (estado IN ('inscrito','retirado'))
);

-- Solo puede haber UNA inscripción "activa" (inscrito) por estudiante/grupo.
-- Si se retira, la fila queda con estado='retirado' y sí puede volver a
-- inscribirse más adelante sin chocar con esta restricción.
CREATE UNIQUE INDEX inscripcion_activa_unica
    ON inscripcion (cod_siss, id_grupo)
    WHERE estado = 'inscrito';

-- Índices útiles
CREATE INDEX idx_materia_carrera ON materia(id_carrera);
CREATE INDEX idx_grupo_materia ON grupo(id_materia);
CREATE INDEX idx_grupo_gestion ON grupo(id_gestion);
CREATE INDEX idx_horario_grupo ON horario(id_grupo);
CREATE INDEX idx_historial_estudiante ON historial(cod_siss);
CREATE INDEX idx_inscripcion_estudiante ON inscripcion(cod_siss);
