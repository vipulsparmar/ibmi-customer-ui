-- DB2 for i: Customer Master Table Definition
CREATE OR REPLACE TABLE DEVLIB.CUSTMAS (
    CUSTID  NUMERIC(7, 0) NOT NULL PRIMARY KEY,
    NAME    CHAR(50),
    CITY    CHAR(30),
    STATE   CHAR(2),
    BALANCE DECIMAL(9, 2)
);

LABEL ON TABLE DEVLIB.CUSTMAS IS 'Customer Master Table';
LABEL ON COLUMN DEVLIB.CUSTMAS (
    CUSTID  TEXT IS 'Customer Identifier',
    NAME    TEXT IS 'Customer Name',
    CITY    TEXT IS 'Customer City',
    STATE   TEXT IS 'State Code',
    BALANCE TEXT IS 'Current Account Balance'
);
