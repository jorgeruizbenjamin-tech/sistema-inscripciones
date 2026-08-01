-- ============================================================
-- Datos de ejemplo (seed) - SIS Académico
-- Contraseña de todos los estudiantes de prueba: "Umss2026!"
-- (hash bcrypt generado por backend/db/hash-demo.js)
-- ============================================================

INSERT INTO facultad (nombre_facultad, sigla_facultad) VALUES
('Facultad de Ciencias y Tecnología', 'FCyT');

INSERT INTO carrera (id_facultad, nombre_carrera, codigo_carrera, duracion_semestres) VALUES
(1, 'Ingeniería de Sistemas', '411702', 10);

-- password_hash se reemplaza en tiempo de ejecución por backend/db/seed.js (usa bcrypt real)
INSERT INTO estudiante (cod_siss, id_carrera, nombre_estudiante, apellido_estudiante, ci, correo, telefono, fecha_nacimiento, password_hash) VALUES
(202500350, 1, 'Benjamin Jorge', 'Ruiz', '8746351', 'benjamin.ruiz@est.umss.edu', '+591 76543210', '2005-09-24', '$2b$10$REEMPLAZAR_EN_SEED_JS');

INSERT INTO materia (id_carrera, codigo, nombre_materia, creditos, semestre) VALUES
(1, '201101', 'Introducción a la Programación', 5, 1),
(1, '201102', 'Álgebra I', 5, 1),
(1, '201103', 'Física General', 5, 1),
(1, '201104', 'Elementos de Programación y Estructura de Datos', 5, 2),
(1, '201105', 'Cálculo I', 5, 2),
(1, '201201', 'Metodologías de Análisis y Diseño de Sistemas', 5, 3),
(1, '201202', 'Bases de Datos I', 5, 3),
(1, '201203', 'Álgebra II', 5, 3),
(1, '201204', 'Taller de Sistemas Operativos', 4, 4),
(1, '201301', 'Sistemas de Información I', 5, 5),
(1, '201302', 'Bases de Datos II', 5, 5),
(1, '201303', 'Ingeniería de Software', 5, 5),
(1, '201304', 'Redes de Computadoras', 4, 5),
(1, '201305', 'Programación Web', 5, 5);

-- Prerrequisito de ejemplo: Redes de Computadoras requiere Álgebra II
INSERT INTO prerrequisito (id_materia, id_materia_requisito)
SELECT m1.id_materia, m2.id_materia
FROM materia m1, materia m2
WHERE m1.codigo = '201304' AND m2.codigo = '201203';

INSERT INTO docente (nombre_docente, apellido_docente, correo_docente, telefono_docente, categoria) VALUES
('Juan', 'Perez', 'jperez@umss.edu', '70000001', 'Titular'),
('Martha', 'Torrico', 'mtorrico@umss.edu', '70000002', 'Titular'),
('Waldo', 'Guzman', 'wguzman@umss.edu', '70000003', 'Adjunto'),
('Carlos', 'Lopez', 'clopez@umss.edu', '70000004', 'Adjunto'),
('Ana', 'Salazar', 'asalazar@umss.edu', '70000005', 'Auxiliar');

INSERT INTO aula (nombre_aula, edificio, capacidad) VALUES
('617', 'Edificio Central', 45),
('691B', 'Módulo B', 40),
('624', 'Edificio Central', 35),
('692C', 'Módulo C', 30);

INSERT INTO gestion_academica (nombre_gestion, fecha_inicio, fecha_fin, fecha_limite_inscripcion, estado) VALUES
('II/2026', '2026-08-03', '2026-12-18', CURRENT_DATE + INTERVAL '30 days', 'activa');

-- Grupos para la gestión II/2026
INSERT INTO grupo (id_materia, id_docente, id_gestion, paralelo, cupo)
SELECT m.id_materia, d.id_docente, g.id_gestion, v.paralelo, v.cupo
FROM (VALUES
  ('201301', 'jperez@umss.edu', '1', 45),
  ('201302', 'mtorrico@umss.edu', '2', 12),
  ('201303', 'wguzman@umss.edu', '1', 8),
  ('201304', 'clopez@umss.edu', '3', 0),
  ('201305', 'asalazar@umss.edu', '1', 28)
) AS v(codigo_materia, correo_docente, paralelo, cupo)
JOIN materia m ON m.codigo = v.codigo_materia
JOIN docente d ON d.correo_docente = v.correo_docente
JOIN gestion_academica g ON g.nombre_gestion = 'II/2026';

-- Horarios de cada grupo
INSERT INTO horario (id_grupo, id_aula, dia, hora_inicio, hora_final)
SELECT gr.id_grupo, au.id_aula, v.dia, v.hora_inicio::time, v.hora_final::time
FROM (VALUES
  ('201301', '617',  'Lunes',     '08:15', '09:45'),
  ('201301', '617',  'Miércoles', '08:15', '09:45'),
  ('201302', '691B', 'Martes',    '09:45', '11:15'),
  ('201302', '691B', 'Jueves',    '09:45', '11:15'),
  ('201303', '624',  'Viernes',   '14:15', '15:45'),
  ('201304', '692C', 'Lunes',     '11:15', '12:45'),
  ('201305', '617',  'Sábado',    '08:15', '12:45')
) AS v(codigo_materia, nombre_aula, dia, hora_inicio, hora_final)
JOIN grupo gr ON gr.id_materia = (SELECT id_materia FROM materia WHERE codigo = v.codigo_materia)
JOIN aula au ON au.nombre_aula = v.nombre_aula;

-- Historial académico (kardex) del estudiante de prueba
INSERT INTO gestion_academica (nombre_gestion, fecha_inicio, fecha_fin, fecha_limite_inscripcion, estado) VALUES
('I/2024', '2024-02-01', '2024-07-01', '2024-03-01', 'cerrada'),
('II/2024', '2024-08-01', '2024-12-15', '2024-09-01', 'cerrada'),
('I/2025', '2025-02-01', '2025-07-01', '2025-03-01', 'cerrada'),
('II/2025', '2025-08-01', '2025-12-15', '2025-09-01', 'cerrada');

INSERT INTO historial (cod_siss, id_materia, id_gestion, nota_final, estado)
SELECT 202500350, m.id_materia, g.id_gestion, v.nota, v.estado
FROM (VALUES
  ('201101', 'I/2024', 71.6, 'APR'),
  ('201102', 'I/2024', 51.3, 'APR'),
  ('201103', 'I/2024', 30.0, 'REP'),
  ('201104', 'II/2024', 81.6, 'APR'),
  ('201105', 'II/2024', 61.3, 'APR'),
  ('201103', 'II/2024', 51.0, 'APR'),
  ('201201', 'I/2025', 77.3, 'APR'),
  ('201202', 'I/2025', 26.6, 'REP'),
  ('201203', 'I/2025', 0.0, 'ABN'),
  ('201204', 'II/2025', 65.3, 'APR')
) AS v(codigo_materia, nombre_gestion, nota, estado)
JOIN materia m ON m.codigo = v.codigo_materia
JOIN gestion_academica g ON g.nombre_gestion = v.nombre_gestion;

-- Inscripción activa de ejemplo (2 materias ya inscritas para II/2026)
INSERT INTO inscripcion (cod_siss, id_grupo, estado)
SELECT 202500350, gr.id_grupo, 'inscrito'
FROM grupo gr
JOIN materia m ON m.id_materia = gr.id_materia
WHERE m.codigo IN ('201301', '201302');
