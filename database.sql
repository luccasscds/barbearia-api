-- Current database SQLite

CREATE TABLE Company (
    codCompany          INTEGER PRIMARY KEY AUTOINCREMENT,
    nameCompany         VARCHAR(100) NOT NULL UNIQUE,
    numberWhatsApp      VARCHAR(11),
    nameInstagram       VARCHAR(50),
    address             VARCHAR(100),
    slug                VARCHAR(50),
    photo               MEDIUMTEXT
);

CREATE TABLE Client (
    codClient       INTEGER PRIMARY KEY AUTOINCREMENT,
    nameClient      VARCHAR(100) NOT NULL,
    codCompany      INTEGER NOT NULL,
    emailClient     VARCHAR(100),
    passwordClient  VARCHAR(500),
    numberPhone     VARCHAR(30),
    blocked         BOOLEAN NOT NULL,
    dateCreated     DATETIME NOT NULL,
    birthdayDate    DATE,
    photo           VARCHAR(100),
    CONSTRAINT UC_name_codCompany UNIQUE (nameClient, codCompany)
);

CREATE TABLE Service (
    codService          INTEGER PRIMARY KEY AUTOINCREMENT,
    codCompany          INTEGER NOT NULL,
    codCategory         INTEGER,
    nameService         VARCHAR(50) NOT NULL,
    price               REAL NOT NULL,
    durationMin         INTEGER NOT NULL,
    active              BOOLEAN NOT NULL,
    identificationColor VARCHAR(10),
    FOREIGN KEY (codCompany) REFERENCES Company (codCompany) ON DELETE CASCADE
);

CREATE TABLE Category (
  codCategory   INTEGER PRIMARY KEY AUTOINCREMENT,
  codCompany    INTEGER NOT NULL,
  nameCategory  VARCHAR(50)
);

CREATE TABLE VirtualLine (
    codVirtual          INTEGER PRIMARY KEY AUTOINCREMENT,
    codCompany          INTEGER NOT NULL,
    codEmployee         INTEGER NOT NULL,
    codClient           INTEGER NOT NULL,
    codService          INTEGER NOT NULL,
    codStatus           INTEGER NOT NULL,
    codPayment          INTEGER,
    dateVirtual         DATETIME NOT NULL,
    startTime           TIME NOT NULL,
    endTime             TIME NOT NULL,
    typeVirtual         VARCHAR(50) NOT NULL DEFAULT 'normal',
    description         VARCHAR(50),
    CONSTRAINT UC_VirtualLine UNIQUE (codClient, codEmployee, codService, dateVirtual, startTime)
);

CREATE TABLE Timetable (
    codTime     INTEGER PRIMARY KEY AUTOINCREMENT,
    codCompany  INTEGER NOT NULL,
    day         VARCHAR(13) NOT NULL,
    active      BOOLEAN NOT NULL,
    time01      TIME,
    time02      TIME,
    time03      TIME,
    time04      TIME,
    CONSTRAINT UC_Timetable UNIQUE (codCompany, day),
    FOREIGN KEY (codCompany) REFERENCES Company(codCompany) ON DELETE CASCADE
);

CREATE TABLE ConfigSchedule (
    codConfig   INTEGER PRIMARY KEY AUTOINCREMENT,
    codCompany  INTEGER NOT NULL,
    keyConfig   VARCHAR(100) NOT NULL,
    valueConfig VARCHAR(200) NOT NULL,
    FOREIGN KEY (codCompany) REFERENCES Company(codCompany) ON DELETE CASCADE
);

CREATE TABLE Status (
    codStatus   INTEGER PRIMARY KEY,
    name        VARCHAR(50) NOT NULL
);

CREATE TABLE Employee (
    codEmployee                 INTEGER PRIMARY KEY AUTOINCREMENT,
    codCompany                  INTEGER NOT NULL,
    nameEmployee                VARCHAR(100) NOT NULL,
    emailEmployee               VARCHAR(100) NOT NULL UNIQUE,
    password                    VARCHAR(500),
    photo                       VARCHAR(100),
    CPF                         VARCHAR(11),
    CNPJ                        VARCHAR(14),
    commissionInPercentage      INTEGER,
    dateCreated                 DATETIME NOT NULL,
    isMaster                    BOOLEAN NOT NULL DEFAULT FALSE,
    canSchedule                 BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (codCompany) REFERENCES Company (codCompany) ON DELETE CASCADE
);

CREATE TABLE Permissions (
    codPermission     INTEGER PRIMARY KEY AUTOINCREMENT,
    name              VARCHAR(50) NOT NULL,
    abbreviated       VARCHAR(5) NOT NULL
);

CREATE TABLE AccessProfile (
  codAccessProfile  INTEGER PRIMARY KEY AUTOINCREMENT,
  nameAccess        VARCHAR(50) NOT NULL
);

CREATE TABLE AccessProfile_Permissions (
    codAccessProfile  INTEGER NOT NULL,
    codPermission     INTEGER NOT NULL,
    FOREIGN KEY (codAccessProfile) REFERENCES AccessProfile (codAccessProfile),
    FOREIGN KEY (codPermission) REFERENCES Permissions (codPermission)
);

CREATE TABLE Employee_Permissions (
    codEmployee         INTEGER NOT NULL,
    codPermission       INTEGER NOT NULL,
    codAccessProfile    INTEGER NOT NULL,
    accessGranted       BOOLEAN NOT NULL,
    PRIMARY KEY (codEmployee, codPermission),
    FOREIGN KEY (codEmployee) REFERENCES Employee (codEmployee),
    FOREIGN KEY (codPermission) REFERENCES Permissions (codPermission),
    FOREIGN KEY (codAccessProfile) REFERENCES AccessProfile (codAccessProfile)
);

CREATE TABLE Employee_Service (
    codEmployee   INTEGER NOT NULL,
    codService    INTEGER NOT NULL,
    accessGranted BOOLEAN NOT NULL,
    FOREIGN KEY (codEmployee) REFERENCES Employee(codEmployee) ON DELETE CASCADE,
    FOREIGN KEY (codService) REFERENCES Service(codService),
    CONSTRAINT UC_Employee_Service UNIQUE (codEmployee, codService)
);

CREATE TABLE TimetableEmployee (
    codTime     INTEGER PRIMARY KEY AUTOINCREMENT,
    codEmployee INTEGER NOT NULL,
    day         VARCHAR(13) NOT NULL,
    active      BOOLEAN NOT NULL,
    time01      TIME,
    time02      TIME,
    time03      TIME,
    time04      TIME,
    CONSTRAINT UC_TimetableEmployee UNIQUE (codEmployee, day),
    FOREIGN KEY (codEmployee) REFERENCES Employee(codEmployee) ON DELETE CASCADE
);

CREATE TABLE PaymentMethod (
    codPay      INTEGER PRIMARY KEY AUTOINCREMENT,
    name        VARCHAR(50) NOT NULL
);


-- INSERTS

INSERT INTO Status (codStatus, name) VALUES
(1, 'Nenhum'),
(2, 'Confirmado'),
(3, 'Não confirmou'),
(4, 'Atrasou'),
(5, 'Cancelado'),
(6, 'Não comparecimento'),
(7, 'Pagou a taxa'),
(8, 'Pago');

INSERT INTO PaymentMethod (codPay, name) VALUES
(1, 'Nenhum'),
(2, 'Dinheiro'),
(3, 'Transferência/PIX'),
(4, 'Cartão de Crédito'),
(5, 'Cartão de Débito'),
(6, 'Cheque'),
(7, 'Cortesia');

INSERT INTO Permissions (abbreviated, name) VALUES
('PRA', 'Pode realizar agendamentos'),
('PAO', 'Pode acessar a agenda de outros profissionais'),
('PCC', 'Pode visualizar contato do cliente'),
('PEA', 'Pode editar agendamentos'),
('PDA', 'Pode deletar agendamentos'),
('PMC', 'Pode acessar menu Clientes'),
('PMS', 'Pode acessar menu Serviços'),
('PCR', 'Pode visualizar comissões a receber'),
('PPC', 'Pode visualizar pagamentos de comissão'),
('PFT', 'Pode fazer tudo');

INSERT INTO AccessProfile (nameAccess) VALUES
('Secretário'),
('Funcionário'),
('Administrador');

INSERT INTO AccessProfile_Permissions (codAccessProfile, codPermission) VALUES
-- Secretário
(1, 7),
-- Funcionário
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 9),
-- Administrador
(3, 10);

-------------------------------------------------------

-- -- TRIGGER
-- CREATE TRIGGER T_insert_client_CompanyClient
--   AFTER INSERT ON Client
-- BEGIN
--   INSERT INTO CompanyClient
--   (codClient, codCompany) VALUES ( new.codClient, new.codCompany );
-- END;

-- CREATE TRIGGER T_delete_client_CompanyClient
--     AFTER DELETE ON Client
-- BEGIN
--     DELETE FROM CompanyClient
--     WHERE codClient = old.codClient
--     and codCompany = old.codCompany;
-- END;

-- Teste ainda não implementado
CREATE TRIGGER T_DELETE_COMPANY
    AFTER DELETE ON Company
BEGIN
    DELETE FROM Client
    WHERE codCompany = old.codCompany;
    DELETE FROM Service
    WHERE codCompany = old.codCompany;
    DELETE FROM Category
    WHERE codCompany = old.codCompany;
    DELETE FROM VirtualLine
    WHERE codCompany = old.codCompany;
    DELETE FROM Timetable
    WHERE codCompany = old.codCompany;
    DELETE FROM ConfigSchedule
    WHERE codCompany = old.codCompany;
    DELETE FROM Employee
    WHERE codCompany = old.codCompany;
END;