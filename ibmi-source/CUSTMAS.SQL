-- DB2 for i: Customer Master Table Definition
CREATE OR REPLACE TABLE DEVLIB.CUSTMAS (
    CUSTID  DECIMAL(7, 0) NOT NULL PRIMARY KEY,
    NAME    CHAR(50)      NOT NULL DEFAULT '',
    CITY    CHAR(30)      NOT NULL DEFAULT '',
    STATE   CHAR(2)       NOT NULL DEFAULT '',
    BALANCE DECIMAL(9, 2) NOT NULL DEFAULT 0.00
);

LABEL ON TABLE DEVLIB.CUSTMAS IS 'Customer Master Table';
LABEL ON COLUMN DEVLIB.CUSTMAS (
    CUSTID  TEXT IS 'Customer Identifier',
    NAME    TEXT IS 'Customer Name',
    CITY    TEXT IS 'Customer City',
    STATE   TEXT IS 'State Code',
    BALANCE TEXT IS 'Current Account Balance'
);