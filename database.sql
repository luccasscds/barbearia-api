-- Current database SQLite

CREATE TABLE Client (
    codClient       INTEGER PRIMARY KEY AUTOINCREMENT,
    nameClient      VARCHAR(100) NOT NULL,
    codCompany      INTEGER NOT NULL,
    emailClient     VARCHAR(100),
    passwordClient  VARCHAR(500),
    numberPhone     VARCHAR(30),
    blocked         BOOLEAN NOT NULL,
    dateCreated     DATETIME NOT NULL,
    CONSTRAINT UC_name_codCompany UNIQUE (nameClient, codCompany)
);

CREATE TABLE Service (
    codService          INTEGER PRIMARY KEY AUTOINCREMENT,
    codCompany          INTEGER NOT NULL,
    nameService         VARCHAR(50) NOT NULL,
    price               REAL NOT NULL,
    durationMin         INTEGER NOT NULL,
    active              BOOLEAN NOT NULL,
    identificationColor VARCHAR(10)
);

CREATE TABLE VirtualLine (
    codVirtual          INTEGER PRIMARY KEY AUTOINCREMENT,
    codCompany          INTEGER NOT NULL,
    codClient           INTEGER NOT NULL,
    codService          INTEGER NOT NULL,
    codStatus           INTEGER NOT NULL,
    codPayment          INTEGER,
    dateVirtual         DATETIME NOT NULL,
    startTime           TIME NOT NULL,
    endTime             TIME NOT NULL,
    CONSTRAINT UC_client_service_date_startTime UNIQUE (codClient, codService, dateVirtual, startTime)
);

CREATE TABLE Timetable (
    codTime     INTEGER PRIMARY KEY AUTOINCREMENT,
    codCompany  INTEGER NOT NULL,
    day         VARCHAR(13) NOT NULL,
    active      BOOLEAN NOT NULL,
    time01      TIME,
    time02      TIME,
    time03      TIME,
    time04      TIME
);

CREATE TABLE ConfigSchedule (
    codConfig   INTEGER PRIMARY KEY AUTOINCREMENT,
    codCompany  INTEGER NOT NULL,
    keyConfig   VARCHAR(100) NOT NULL,
    valueConfig VARCHAR(200) NOT NULL
);

CREATE TABLE Status (
    codStatus   INTEGER PRIMARY KEY,
    name        VARCHAR(50) NOT NULL
);

CREATE TABLE Company (
    codCompany      INTEGER PRIMARY KEY AUTOINCREMENT,
    name            VARCHAR(100),
    nameSecund      VARCHAR(100),
    photo           MEDIUMTEXT,
    numberWhatsApp  VARCHAR(11),
    nameInstagram   VARCHAR(50),
    address         VARCHAR(100),
    emailCompany    VARCHAR(100) NOT NULL,
    password        VARCHAR(500) NOT NULL,
    slug            VARCHAR(50),
    blocked         BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT UCompany_email UNIQUE (emailCompany)
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
/
INSERT INTO PaymentMethod (codPay, name) VALUES
(1, 'Nenhum'),
(2, 'Dinheiro'),
(3, 'Transferência/PIX'),
(4, 'Cartão de Crédito'),
(5, 'Cartão de Débito'),
(6, 'Cheque'),
(7, 'Cortesia');
/
-- select count(c.codClient) from Client c
-- where c.emailClient = 'pedro@email.com'
-- and exists (
--     select 1 from CompanyClient cc
--     where cc.codClient = c.codClient
--     and cc.codCompany = c.codCompany
-- );

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