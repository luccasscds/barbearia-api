CREATE TABLE Client (
    codClient       INT PRIMARY KEY AUTO_INCREMENT,
    nameClient      VARCHAR(100) NOT NULL,
    codCompany      INT NOT NULL,
    emailClient     VARCHAR(100),
    passwordClient  VARCHAR(500),
    numberPhone     VARCHAR(30),
    blocked         BOOLEAN NOT NULL,
    CONSTRAINT UC_name UNIQUE (nameClient)
);
/
CREATE TABLE Service (
    codService          INT PRIMARY KEY AUTO_INCREMENT,
    codCompany          INT NOT NULL,
    nameService         VARCHAR(50) NOT NULL,
    price               FLOAT(10, 2) NOT NULL,
    durationMin         INT NOT NULL,
    active              BOOLEAN NOT NULL,
    identificationColor VARCHAR(10),
);
/
-- CREATE TABLE ClientService (
--     codClientService    INT PRIMARY KEY AUTO_INCREMENT,
--     codClient           INT NOT NULL,
--     codService          INT NOT NULL
-- );
/
CREATE TABLE VirtualLine (
    codVirtual          INT PRIMARY KEY AUTO_INCREMENT,
    codCompany          INT NOT NULL,
    codClient           INT NOT NULL,
    codService          INT NOT NULL,
    codStatus           INT NOT NULL,
    codPayment          INT,
    dateVirtual         DATETIME NOT NULL,
    startTime           TIME NOT NULL,
    endTime             TIME NOT NULL,
    CONSTRAINT UC_client_service_date_startTime UNIQUE (codClient, codService, dateVirtual, startTime)
);
/
CREATE TABLE Timetable (
    codTime     INT PRIMARY KEY AUTO_INCREMENT,
    codCompany  INT NOT NULL,
    day         VARCHAR(13) NOT NULL,
    active      BOOLEAN NOT NULL,
    time01      TIME,
    time02      TIME,
    time03      TIME,
    time04      TIME
);
/
CREATE TABLE ConfigSchedule (
  codConfig   INT PRIMARY KEY,
  codCompany  INT NOT NULL,
  keyConfig   VARCHAR(100) NOT NULL,
  valueConfig VARCHAR(200) NOT NULL
);
/
CREATE TABLE Status (
  codStatus   INT PRIMARY KEY,
  name        VARCHAR(50) NOT NULL
);
/
CREATE TABLE Company (
  codCompany      INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(100),
  photo           MEDIUMTEXT,
  numberWhatsApp  VARCHAR(11),
  nameInstagram   VARCHAR(50),
  address         VARCHAR(100),
  emailCompany    VARCHAR(100) NOT NULL,
  password        VARCHAR(500) NOT NULL,
  slug            VARCHAR(50),
  blocked         BOOLEAN NOT NULL DEFAULT FALSE
);
/
CREATE TABLE CompanyClient (
  codCompanyClient  INT PRIMARY KEY AUTO_INCREMENT,
  codCompany        INT NOT NULL,
  codClient         INT NOT NULL,
  CONSTRAINT UC_codCompany_codClient UNIQUE (codCompany, codClient)
);
/
CREATE TABLE PaymentMethod (
  codPay      INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(50) NOT NULL
);

-- INSERTS
/
INSERT INTO Timetable (day, codCompany, active, time01, time02, time03, time04) VALUES
('Segunda-feira',   1, true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Terça-feira',     1, true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Quarta-feira',    1, true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Quinta-feira',    1, true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Sexta-feira',     1, true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Sábado',          1, true, '09:00:00', '17:00:00', '', ''),
('Domingo',         1, false, '', '', '', '');
/
Insert into ConfigSchedule (codConfig, keyConfig, valueConfig) values 
(1, 'timeIntervalMin', '15'),
(2, 'maxDay', '15'),
(3, 'cancelHoursBefore', '2'),
(4, 'textCancellationPolicy', 'Caso o cancelamento não seja feito 2h antes, será cobrado 50% do valor do serviço como multa por não comprimento com a as normas do estabelecimento'),
(5, 'allowCancellation', 'true'),
(6, 'textToClient', ''),
(7, 'pixRatePercentage', '50'),
(8, 'keyPix', '');
/
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
SELECT DISTINCT dateVirtual 
FROM VirtualLine 
WHERE MONTH(dateVirtual) = 2
/
select '2024-03-13' >= DATE_SUB(current_date, INTERVAL ? DAY) from dual