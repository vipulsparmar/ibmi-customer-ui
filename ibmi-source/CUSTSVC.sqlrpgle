**FREE
Ctl-Opt Nomain Option(*SrcStmt : *NoDebugIO) PGMINFO(*PCML : *MODULE);

// --------------------------------------------------
// Data Structures serialized to/from JSON by IWS
// --------------------------------------------------
Dcl-Ds Customer_t Qualified Template;
  Success    Ind;
  Message    VarChar(100);
  CustId     Int(10);
  Name       VarChar(50);
  City       VarChar(30);
  State      VarChar(2);
  Balance    Packed(9:2);
End-Ds;

// Input structure for POST & PUT request body
Dcl-Ds NewCustomer_t Qualified Template;
  CustId     Int(10);
  Name       VarChar(50);
  City       VarChar(30);
  State      VarChar(2);
  Balance    Packed(9:2);
End-Ds;

// --------------------------------------------------
// Prototypes
// --------------------------------------------------
Dcl-Pr GetCustomerInfo;
  pCustId    Int(10) Const;
  response   LikeDs(Customer_t);
End-Pr;

Dcl-Pr AddCustomer;
  inputData  LikeDs(NewCustomer_t) Const;
  response   LikeDs(Customer_t);
End-Pr;

Dcl-Pr UpdateCustomer;
  pCustId    Int(10) Const;
  inputData  LikeDs(NewCustomer_t) Const;
  response   LikeDs(Customer_t);
End-Pr;

Dcl-Pr DeleteCustomer;
  pCustId    Int(10) Const;
  response   LikeDs(Customer_t);
End-Pr;

// --------------------------------------------------
// GET Procedure: Fetch Customer Info
// --------------------------------------------------
Dcl-Proc GetCustomerInfo Export;
  Dcl-Pi *N;
    pCustId   Int(10) Const;
    response  LikeDs(Customer_t);
  End-Pi;

  Clear response;
  response.CustId = pCustId;

  Exec SQL Set Option Commit = *NONE, Naming = *SYS, DatFmt = *ISO;

  Exec SQL
    SELECT CUST_NAME, CITY, STATE, BALANCE
    INTO :response.Name, :response.City, :response.State, :response.Balance
    FROM DEVLIB/CUSTMAS
    WHERE CUST_ID = :pCustId;

  If SQLSTATE = '00000';
    response.Success = *On;
    response.Message = 'Customer retrieved successfully.';
  ElseIf SQLSTATE = '02000';
    response.Success = *Off;
    response.Message = 'Customer not found.';
  Else;
    response.Success = *Off;
    response.Message = 'SQL Error: ' + SQLSTATE;
  EndIf;
End-Proc;

// --------------------------------------------------
// POST Procedure: Insert New Customer
// --------------------------------------------------
Dcl-Proc AddCustomer Export;
  Dcl-Pi *N;
    inputData LikeDs(NewCustomer_t) Const;
    response  LikeDs(Customer_t);
  End-Pi;

  Clear response;
  response.CustId = inputData.CustId;

  Exec SQL
    INSERT INTO DEVLIB/CUSTMAS (CUST_ID, CUST_NAME, CITY, STATE, BALANCE)
    VALUES (
      :inputData.CustId,
      :inputData.Name,
      :inputData.City,
      :inputData.State,
      :inputData.Balance
    );

  If SQLSTATE = '00000';
    response.Success = *On;
    response.Message = 'Customer created successfully.';
    response.Name    = inputData.Name;
    response.City    = inputData.City;
    response.State   = inputData.State;
    response.Balance = inputData.Balance;
  ElseIf SQLSTATE = '23505';
    response.Success = *Off;
    response.Message = 'Customer ID already exists.';
  Else;
    response.Success = *Off;
    response.Message = 'SQL Error: ' + SQLSTATE;
  EndIf;
End-Proc;

// --------------------------------------------------
// PUT Procedure: Update Existing Customer
// --------------------------------------------------
Dcl-Proc UpdateCustomer Export;
  Dcl-Pi *N;
    pCustId   Int(10) Const;
    inputData LikeDs(NewCustomer_t) Const;
    response  LikeDs(Customer_t);
  End-Pi;

  Clear response;
  response.CustId = pCustId;

  Exec SQL
    UPDATE DEVLIB/CUSTMAS
       SET CUST_NAME = :inputData.Name,
           CITY      = :inputData.City,
           STATE     = :inputData.State,
           BALANCE   = :inputData.Balance
     WHERE CUST_ID   = :pCustId;

  If SQLSTATE = '00000';
    response.Success = *On;
    response.Message = 'Customer updated successfully.';
    response.Name    = inputData.Name;
    response.City    = inputData.City;
    response.State   = inputData.State;
    response.Balance = inputData.Balance;
  ElseIf SQLSTATE = '02000';
    response.Success = *Off;
    response.Message = 'Customer not found to update.';
  Else;
    response.Success = *Off;
    response.Message = 'SQL Error: ' + SQLSTATE;
  EndIf;
End-Proc;

// --------------------------------------------------
// DELETE Procedure: Remove Customer
// --------------------------------------------------
Dcl-Proc DeleteCustomer Export;
  Dcl-Pi *N;
    pCustId   Int(10) Const;
    response  LikeDs(Customer_t);
  End-Pi;

  Clear response;
  response.CustId = pCustId;

  Exec SQL
    DELETE FROM DEVLIB/CUSTMAS
     WHERE CUST_ID = :pCustId;

  If SQLSTATE = '00000';
    response.Success = *On;
    response.Message = 'Customer deleted successfully.';
  ElseIf SQLSTATE = '02000';
    response.Success = *Off;
    response.Message = 'Customer not found to delete.';
  Else;
    response.Success = *Off;
    response.Message = 'SQL Error: ' + SQLSTATE;
  EndIf;
End-Proc;