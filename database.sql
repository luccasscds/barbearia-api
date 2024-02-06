CREATE TABLE Client (
    codClient       INT PRIMARY KEY AUTO_INCREMENT,
    nameClient      VARCHAR(100) NOT NULL,
    emailClient     VARCHAR(100),
    passwordClient  VARCHAR(500),
    isADM           BOOLEAN,
    numberPhone     VARCHAR(30),
    CONSTRAINT UC_name UNIQUE (nameClient)
);
/
CREATE TABLE Service (
    codService  INT PRIMARY KEY AUTO_INCREMENT,
    nameService VARCHAR(50) NOT NULL,
    price       FLOAT(10, 2) NOT NULL,
    durationMin INT NOT NULL,
    active      BOOLEAN NOT NULL,
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
    codClient           INT NOT NULL,
    codService          INT NOT NULL,
    codStatus           INT NOT NULL,
    dateVirtual         DATETIME NOT NULL,
    startTime           TIME NOT NULL,
    endTime             TIME NOT NULL,
    CONSTRAINT UC_client_service_date_startTime UNIQUE (codClient, codService, dateVirtual, startTime)
);
/
CREATE TABLE Timetable (
    codTime     INT PRIMARY KEY AUTO_INCREMENT,
    day         VARCHAR(13) NOT NULL,
    active      BOOLEAN NOT NULL,
    time01      TIME,
    time02      TIME,
    time03      TIME,
    time04      TIME
);
/
CREATE TABLE ConfigSchedule (
  codConfig INT PRIMARY KEY,
  keyConfig VARCHAR(100) NOT NULL,
  valueConfig VARCHAR(200) NOT NULL
);
/
CREATE TABLE Status (
  codStatus INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);
/
CREATE TABLE Company (
  codCompany      INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(100),
  photo           MEDIUMTEXT,
  numberWhatsApp  VARCHAR(11),
  nameInstagram   VARCHAR(50),
  address         VARCHAR(100)
);


-- INSERTS

INSERT INTO Client (nameClient, emailClient) VALUES 
('João Silva',      'joao.silva@email.com'),
('Maria Oliveira',  'maria.oliveira@email.com'),
('Pedro Santos',    'pedro.santos@email.com'),
('Ana Pereira',     'ana.pereira@email.com'),
('Carlos Rocha',    'carlos.rocha@email.com');
/
INSERT INTO Service (nameService, price, durationMin) VALUES 
('Corte de Cabelo',                     30.00, 30),
('Barba Tradicional',                   20.00, 20),
('Pacote Completo (Cabelo + Barba)',    45.00, 60),
('Design de Sobrancelhas',              15.00, 15),
('Tratamento Capilar',                  40.00, 45);
-- /
-- INSERT INTO ClientService (codClient, codService) VALUES 
-- (1, 1),
-- (1, 2),
-- (1, 4),
-- (2, 4),
-- (2, 5),
-- (3, 3),
-- (3, 4),
-- (4, 5),
-- (5, 2);
/
INSERT INTO VirtualLine (codClient, codService, status, dateVirtual) VALUES 
(1, 1, 'Tempo estimado', current_date),
(1, 2, 'Tempo estimado', current_date),
(1, 4, 'Tempo estimado', current_date),
(2, 4, 'Tempo estimado', current_date),
(2, 5, 'Tempo estimado', current_date),
(3, 3, 'Tempo estimado', current_date),
(3, 4, 'Tempo estimado', current_date),
(4, 5, 'Tempo estimado', current_date),
(5, 2, 'Tempo estimado', current_date);
/
INSERT INTO Timetable (day, active, time01, time02, time03, time04) VALUES
('Segunda-feira',   true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Terça-feira',     true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Quarta-feira',    true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Quinta-feira',    true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Sexta-feira',     true, '09:00:00', '12:00:00', '15:00:00', '19:00:00'),
('Sábado',          true, '09:00:00', '17:00:00', '', ''),
('Domingo',         false, '', '', '', '');
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
INSERT INTO Company (name, photo, numberWhatsApp, nameInstagram, address) VALUES
('💈Franskym Santos💈', 'https://d118if3nwdjtgn.cloudfront.net/487248/PAGE_BIO_IMAGE/-1075275270', '5586998350894', 'franskym_santos', '');