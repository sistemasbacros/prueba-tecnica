/* =====================================================================
   Prueba Técnica - Sistema de Mantenimiento
   01-schema.sql : creación de base de datos, login de aplicación y tablas
   Idempotente: puede ejecutarse varias veces sin error.
   ===================================================================== */

IF DB_ID('MantenimientoDB') IS NULL
BEGIN
    CREATE DATABASE MantenimientoDB;
END
GO

/* Login de aplicación (evita que el backend use `sa`) */
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'mantenimiento_app')
BEGIN
    CREATE LOGIN mantenimiento_app WITH PASSWORD = 'App2026!Mant', CHECK_POLICY = OFF;
END
GO

USE MantenimientoDB;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'mantenimiento_app')
BEGIN
    CREATE USER mantenimiento_app FOR LOGIN mantenimiento_app;
    ALTER ROLE db_datareader ADD MEMBER mantenimiento_app;
    ALTER ROLE db_datawriter ADD MEMBER mantenimiento_app;
END
GO

/* ------------------------------------------------------------------ */
/* Usuarios                                                            */
/* ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios (
        IdUsuario       INT           NOT NULL IDENTITY(1,1),
        NombreUsuario   VARCHAR(100)  NOT NULL,
        PasswordHash    VARCHAR(255)  NOT NULL,   -- bcrypt
        Correo          VARCHAR(150)  NOT NULL,
        Rol             VARCHAR(30)   NOT NULL,
        Activo          BIT           NOT NULL CONSTRAINT DF_Usuarios_Activo DEFAULT (1),
        CONSTRAINT PK_Usuarios            PRIMARY KEY (IdUsuario),
        CONSTRAINT UQ_Usuarios_Nombre     UNIQUE (NombreUsuario),
        CONSTRAINT UQ_Usuarios_Correo     UNIQUE (Correo),
        CONSTRAINT CK_Usuarios_Rol        CHECK (Rol IN ('ADMINISTRADOR', 'SUPERVISOR', 'TECNICO'))
    );
END
GO

/* ------------------------------------------------------------------ */
/* Contratos                                                           */
/* ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.Contratos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Contratos (
        IdContrato            INT           NOT NULL IDENTITY(1,1),
        NumeroContrato        VARCHAR(50)   NOT NULL,
        NombreContrato        VARCHAR(200)  NOT NULL,
        FechaInicio           DATE          NOT NULL,
        FechaFin              DATE          NOT NULL,
        Estatus               VARCHAR(30)   NOT NULL,
        IdUsuarioResponsable  INT           NOT NULL,
        CONSTRAINT PK_Contratos             PRIMARY KEY (IdContrato),
        CONSTRAINT UQ_Contratos_Numero      UNIQUE (NumeroContrato),
        CONSTRAINT CK_Contratos_Estatus     CHECK (Estatus IN ('ACTIVO', 'FINALIZADO', 'CANCELADO')),
        CONSTRAINT CK_Contratos_Fechas      CHECK (FechaFin >= FechaInicio),
        CONSTRAINT FK_Contratos_Responsable FOREIGN KEY (IdUsuarioResponsable) REFERENCES dbo.Usuarios (IdUsuario)
    );
    CREATE INDEX IX_Contratos_Responsable ON dbo.Contratos (IdUsuarioResponsable);
END
GO

/* ------------------------------------------------------------------ */
/* Tickets                                                             */
/* ------------------------------------------------------------------ */
IF OBJECT_ID('dbo.Tickets', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tickets (
        IdTicket           INT           NOT NULL IDENTITY(1,1),
        IdContrato         INT           NOT NULL,
        Tipo               VARCHAR(30)   NOT NULL,
        Descripcion        VARCHAR(500)  NOT NULL,
        FechaSolicitud     DATETIME      NOT NULL CONSTRAINT DF_Tickets_FechaSolicitud DEFAULT (GETDATE()),
        Estatus            VARCHAR(30)   NOT NULL CONSTRAINT DF_Tickets_Estatus DEFAULT ('PENDIENTE'),
        IdUsuarioAsignado  INT           NULL,     -- NULL = sin asignar
        CONSTRAINT PK_Tickets           PRIMARY KEY (IdTicket),
        CONSTRAINT CK_Tickets_Tipo      CHECK (Tipo IN ('PREVENTIVO', 'CORRECTIVO', 'EMERGENCIA')),
        CONSTRAINT CK_Tickets_Estatus   CHECK (Estatus IN ('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO')),
        CONSTRAINT FK_Tickets_Contrato  FOREIGN KEY (IdContrato)        REFERENCES dbo.Contratos (IdContrato),
        CONSTRAINT FK_Tickets_Asignado  FOREIGN KEY (IdUsuarioAsignado) REFERENCES dbo.Usuarios (IdUsuario)
    );
    CREATE INDEX IX_Tickets_Contrato ON dbo.Tickets (IdContrato);
    CREATE INDEX IX_Tickets_Asignado ON dbo.Tickets (IdUsuarioAsignado);
    CREATE INDEX IX_Tickets_Estatus  ON dbo.Tickets (Estatus);
END
GO
