/* =====================================================================
   Prueba Técnica - Sistema de Mantenimiento
   02-seed.sql : datos iniciales
   Idempotente: solo inserta si la tabla está vacía.

   Contraseñas (hash bcrypt, cost 10):
     administrador  -> Admin2026!
     supervisor     -> Supervisor2026!
     tecnico01..04  -> Tecnico2026!
   tecnico04 está INACTIVO (Activo = 0) y no debe poder iniciar sesión.
   ===================================================================== */

USE MantenimientoDB;
GO

/* ------------------------------------------------------------------ */
/* Usuarios                                                            */
/* ------------------------------------------------------------------ */
IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios)
BEGIN
    SET IDENTITY_INSERT dbo.Usuarios ON;

    INSERT INTO dbo.Usuarios (IdUsuario, NombreUsuario, PasswordHash, Correo, Rol, Activo) VALUES
    (1, 'administrador', '$2a$10$cqq4ptadJsHWIytsphjSq.vj9RhHQWInMGQ1jbTkoHKEjpMNa3/7u', 'admin@empresa.com',      'ADMINISTRADOR', 1),
    (2, 'supervisor',    '$2a$10$pb07F0a0hHbuQMul6iz5ce9ZmGaKwkIK/zTHWb1jQ6X24qLTMDUCe', 'supervisor@empresa.com', 'SUPERVISOR',    1),
    (3, 'tecnico01',     '$2a$10$RzwRBEBMdUsEqAsDDVqTpOmPnqnZfpTXtxd//fqynWYzZQLKb51R6', 'tecnico1@empresa.com',   'TECNICO',       1),
    (4, 'tecnico02',     '$2a$10$eqAvK2DrfZTrhwI5SugnkusCMlFZmBTx8nx80fkmyEeMS6qfm1EH6', 'tecnico2@empresa.com',   'TECNICO',       1),
    (5, 'tecnico03',     '$2a$10$/yfPV43AUgbYrtr1LWE68eAordn3E7w7/pumnKnRQ35JnZ8R3YE16', 'tecnico3@empresa.com',   'TECNICO',       1),
    (6, 'tecnico04',     '$2a$10$Ah471yvif5Mt107v/FpbZujrI0w9AJkohGST3X4IVPqcBQM9GDeam', 'tecnico4@empresa.com',   'TECNICO',       0);

    SET IDENTITY_INSERT dbo.Usuarios OFF;
END
GO

/* ------------------------------------------------------------------ */
/* Contratos                                                           */
/* ------------------------------------------------------------------ */
IF NOT EXISTS (SELECT 1 FROM dbo.Contratos)
BEGIN
    SET IDENTITY_INSERT dbo.Contratos ON;

    INSERT INTO dbo.Contratos (IdContrato, NumeroContrato, NombreContrato, FechaInicio, FechaFin, Estatus, IdUsuarioResponsable) VALUES
    (1, 'CON-001', 'Mantenimiento Planta Norte', '2026-01-01', '2026-12-31', 'ACTIVO',     2),
    (2, 'CON-002', 'Mantenimiento Planta Sur',   '2026-03-01', '2027-02-28', 'ACTIVO',     2),
    (3, 'CON-003', 'Mantenimiento Oficinas',     '2025-01-01', '2025-12-31', 'FINALIZADO', 1);

    SET IDENTITY_INSERT dbo.Contratos OFF;
END
GO

/* ------------------------------------------------------------------ */
/* Tickets (15)                                                        */
/*   PENDIENTE: 5 | ASIGNADO: 2 | EN_PROCESO: 3 | FINALIZADO: 4 | CANCELADO: 1 */
/* ------------------------------------------------------------------ */
IF NOT EXISTS (SELECT 1 FROM dbo.Tickets)
BEGIN
    SET IDENTITY_INSERT dbo.Tickets ON;

    INSERT INTO dbo.Tickets (IdTicket, IdContrato, Tipo, Descripcion, FechaSolicitud, Estatus, IdUsuarioAsignado) VALUES
    -- CON-001 Planta Norte
    (101, 1, 'PREVENTIVO', 'Revisión de motor principal línea 1',              '2026-09-01 08:30:00', 'ASIGNADO',   3),
    (102, 1, 'CORRECTIVO', 'Reparación de banda transportadora',               '2026-09-03 10:15:00', 'EN_PROCESO', 4),
    (103, 1, 'EMERGENCIA', 'Fuga de aceite en compresor principal',            '2026-09-05 06:45:00', 'PENDIENTE',  NULL),
    (104, 1, 'PREVENTIVO', 'Lubricación de rodamientos área de prensas',       '2026-08-12 09:00:00', 'FINALIZADO', 3),
    (105, 1, 'CORRECTIVO', 'Cambio de filtros de aire en cabina de pintura',   '2026-09-10 14:20:00', 'PENDIENTE',  NULL),
    (106, 1, 'PREVENTIVO', 'Inspección eléctrica trimestral de tableros',      '2026-09-15 11:00:00', 'EN_PROCESO', 5),
    -- CON-002 Planta Sur
    (107, 2, 'PREVENTIVO', 'Revisión de sistema hidráulico de prensa 3',       '2026-09-02 08:00:00', 'ASIGNADO',   4),
    (108, 2, 'EMERGENCIA', 'Paro de línea por falla en PLC',                   '2026-09-08 07:10:00', 'EN_PROCESO', 5),
    (109, 2, 'CORRECTIVO', 'Sustitución de válvula de presión en caldera',     '2026-09-12 13:30:00', 'PENDIENTE',  NULL),
    (110, 2, 'PREVENTIVO', 'Calibración de sensores de temperatura',           '2026-09-18 09:45:00', 'PENDIENTE',  NULL),
    (111, 2, 'CORRECTIVO', 'Reparación de montacargas eléctrico',              '2026-08-20 16:00:00', 'CANCELADO',  3),
    (112, 2, 'PREVENTIVO', 'Mantenimiento anual de caldera',                   '2026-09-22 10:00:00', 'PENDIENTE',  NULL),
    -- CON-003 Oficinas (contrato finalizado)
    (113, 3, 'PREVENTIVO', 'Revisión de aire acondicionado piso 1',            '2025-06-10 09:00:00', 'FINALIZADO', 3),
    (114, 3, 'CORRECTIVO', 'Reparación de iluminación piso 2',                 '2025-08-05 15:30:00', 'FINALIZADO', 4),
    (115, 3, 'EMERGENCIA', 'Corto circuito en tablero principal',              '2025-11-20 07:50:00', 'FINALIZADO', 5);

    SET IDENTITY_INSERT dbo.Tickets OFF;
END
GO
