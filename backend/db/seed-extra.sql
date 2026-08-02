INSERT INTO estudiante (cod_siss, id_carrera, nombre_estudiante, apellido_estudiante, ci, correo, telefono, fecha_nacimiento, password_hash)
VALUES
(202400120, 1, 'Camila Andrea', 'Fernandez', '9012345', 'camila.fernandez@est.umss.edu', '+591 71122334', '2004-03-12', (SELECT password_hash FROM estudiante WHERE cod_siss=202500350)),
(202398450, 1, 'Diego Mauricio', 'Quispe', '8123456', 'diego.quispe@est.umss.edu', '+591 76655443', '2003-11-05', (SELECT password_hash FROM estudiante WHERE cod_siss=202500350))
ON CONFLICT (cod_siss) DO NOTHING;

INSERT INTO historial (cod_siss, id_materia, id_gestion, nota_final, estado)
SELECT 202400120, m.id_materia, g.id_gestion, v.nota, v.estado
FROM (VALUES
 ('201101','I/2024',75.0,'APR'), ('201102','I/2024',68.0,'APR'), ('201103','I/2024',80.0,'APR'),
 ('201104','II/2024',72.0,'APR'), ('201105','II/2024',85.0,'APR'),
 ('201201','I/2025',77.0,'APR'), ('201202','I/2025',66.0,'APR'), ('201203','I/2025',70.0,'APR'),
 ('201204','II/2025',60.0,'APR')
) AS v(codigo_materia, nombre_gestion, nota, estado)
JOIN materia m ON m.codigo = v.codigo_materia
JOIN gestion_academica g ON g.nombre_gestion = v.nombre_gestion
WHERE NOT EXISTS (
  SELECT 1 FROM historial h WHERE h.cod_siss = 202400120 AND h.id_materia = m.id_materia AND h.id_gestion = g.id_gestion
);

INSERT INTO historial (cod_siss, id_materia, id_gestion, nota_final, estado)
SELECT 202398450, m.id_materia, g.id_gestion, v.nota, v.estado
FROM (VALUES
 ('201101','I/2024',65.0,'APR'), ('201102','I/2024',25.0,'REP'), ('201103','I/2024',0.0,'ABN'),
 ('201102','II/2024',58.0,'APR'), ('201104','II/2024',55.0,'APR'), ('201105','II/2024',30.0,'REP'),
 ('201201','I/2025',60.0,'APR'), ('201202','I/2025',28.0,'REP'), ('201203','I/2025',35.0,'REP'),
 ('201204','II/2025',0.0,'ABN')
) AS v(codigo_materia, nombre_gestion, nota, estado)
JOIN materia m ON m.codigo = v.codigo_materia
JOIN gestion_academica g ON g.nombre_gestion = v.nombre_gestion
WHERE NOT EXISTS (
  SELECT 1 FROM historial h WHERE h.cod_siss = 202398450 AND h.id_materia = m.id_materia AND h.id_gestion = g.id_gestion
);

INSERT INTO inscripcion (cod_siss, id_grupo, estado)
SELECT 202398450, gr.id_grupo, 'inscrito'
FROM grupo gr JOIN materia m ON m.id_materia = gr.id_materia
WHERE m.codigo IN ('201305','201301')
ON CONFLICT DO NOTHING;
