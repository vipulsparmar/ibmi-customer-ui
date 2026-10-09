# IBM i RPGLE Modernization: RESTful Microservices & Next.js Dashboard

![IBM i](https://img.shields.io/badge/IBM%20i-OS%20400-052FAD?style=for-the-badge&logo=ibm)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Postman](https://img.shields.io/badge/Postman-Automated%20Tests-orange?style=for-the-badge&logo=postman)
![DB2](https://img.shields.io/badge/DB2-SQLRPGLE-blue?style=for-the-badge)

An end-to-end legacy modernization project demonstrating how to transform traditional IBM i (AS/400) DB2 applications into decoupled, modern cloud-native architectures. 

This repository exposes an RPGLE service program (`CUSTSVC`) over HTTP using **IBM Integrated Web Services (IWS)**, validates full CRUD operations via an automated **Postman regression suite**, and provides a responsive management dashboard built with **Next.js (App Router)**.

---

## Architecture

```
+---------------------------------------------------------------------------------+
|                               CLIENT WORKSPACE                                  |
|                                                                                 |
|  +--------------------+         +--------------------+         +-------------+  |
|  | Next.js Dashboard  |         |   Postman Suite    |         | Web Browser |  |
|  | (localhost:3000)   |         | (Automated Runner) |         | (Admin UI)  |  |
|  +---------+----------+         +---------+----------+         +------+------+  |
|            |                              |                           |         |
|            | (/api/customers rewrite)     |                           |         |
|            v                              v                           v         |
|       Local Port 10010              Local Port 10010            Local Port 2001 |
+------------+------------------------------+---------------------------+---------+
|                              |                           |
+------------------------------+---------------------------+
|
[ SSH Tunnel on Port 22 ]
|
+-------------------------------------------v-------------------------------------+
|                                REMOTE IBM i HOST                                |
|                                                                                 |
|   +------------------------------------+   +---------------------------------+  |
|   | IBM Web Administration (Port 2001) |   | Integrated Web Services (10010) |  |
|   | Subsystem: QHTTPSVR / *ADMIN       |   | URI: /web/services/Customer...  |  |
|   +------------------------------------+   +----------------+----------------+  |
|                                                             |                   |
|                                                (Calls ILE Service Program)      |
|                                                             v                   |
|                                            +---------------------------------+  |
|                                            | RPGLE Service Program (CUSTSVC) |  |
|                                            | - cust_create (INSERT)          |  |
|                                            | - cust_get    (SELECT)          |  |
|                                            | - cust_update (UPDATE)          |  |
|                                            | - cust_delete (DELETE)          |  |
|                                            +----------------+----------------+  |
|                                                             |                   |
|                                                    (Embedded SQL)               |
|                                                             v                   |
|                                            +---------------------------------+  |
|                                            |        DB2 Physical File        |  |
|                                            |         DEVLIB/CUSTMAS          |  |
|                                            +---------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## Tech Stack & Components

* **Backend Engine:** IBM i OS (ILE RPG, Embedded SQL / SQLRPGLE)
* **API Middleware:** IBM Integrated Web Services (IWS) REST Engine
* **Database:** IBM DB2 for i (`DEVLIB/CUSTMAS`)
* **Transport / Security:** SSH Local Port Forwarding (Ports 10010, 2001, 2002)
* **API Validation:** Postman Collection Runner / Newman CLI
* **Frontend:** Next.js (App Router, JavaScript), Next.js Server Rewrites

---

## 1. Database & RPG Business Logic

The database layer runs on DB2 physical file `DEVLIB/CUSTMAS`:

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `CUSTID` | `DECIMAL(7,0)` | Unique Customer ID (Primary Key) |
| `NAME` | `CHAR(50)` | Customer / Company Name (Nullable) |
| `CITY` | `CHAR(30)` | City (Nullable) |
| `STATE` | `CHAR(2)` | State Code (Nullable) |
| `BALANCE` | `DECIMAL(9,2)` | Current Account Balance (Nullable, PACKED 5 bytes) |

Business operations are encapsulated inside service program `DEVLIB/CUSTSVC`:
* **`cust_create`**: Executes SQL `INSERT INTO CUSTMAS`. Handles duplicate key conflicts gracefully.
* **`cust_get`**: Executes SQL `SELECT` to fetch customer details by ID.
* **`cust_update`**: Updates record fields for an existing customer ID.
* **`cust_delete`**: Removes the record from `CUSTMAS`.

All subprocedures serialize a standard response payload returning `SUCCESS` (`1` or `0`), diagnostic messages, and record state.

---

## 2. REST API Endpoints (IWS)

The REST service is deployed via IBM Web Administration (`*ADMIN`) under the context root `/web/services/CustomerService` on port `10010`:

| HTTP Method | Endpoint URI | Operation | Mapped Subprocedure |
| :--- | :--- | :--- | :--- |
| **POST** | `/customers` | Create Customer | `cust_create` |
| **GET** | `/customers/{id}` | Read Customer | `cust_get` |
| **PUT** | `/customers/{id}` | Update Customer | `cust_update` |
| **DELETE** | `/customers/{id}` | Delete Customer | `cust_delete` |

---

## 3. Automated API Regression Suite

An automated Postman collection verifies the complete lifecycle sequentially:

1. **`POST /customers`** → Asserts HTTP 200 and `RESPONSE.SUCCESS === "1"`.
2. **`GET /customers/{{custId}}`** → Verifies created record data in DB2.
3. **`PUT /customers/{{custId}}`** → Modifies customer details and asserts successful update.
4. **`DELETE /customers/{{custId}}`** → Removes the customer record.
5. **`GET /customers/{{custId}}`** → Verifies record no longer exists (`RESPONSE.SUCCESS === "0"`).

The suite can also run headlessly via Newman:

```bash
npx newman run tests/CustomerService_tests.json
```

---

## 4. Frontend Web Dashboard (Next.js)

To prevent browser Cross-Origin Resource Sharing (CORS) blocks without modifying IBM i Apache configurations, Next.js rewrites proxy API traffic:

```javascript
// next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/customers/:path*',
        destination: 'http://127.0.0.1:10010/web/services/CustomerService/customers/:path*',
      },
      {
        source: '/api/customers',
        destination: 'http://127.0.0.1:10010/web/services/CustomerService/customers',
      },
    ];
  },
};

export default nextConfig;
```

---

## Quickstart Guide

### 1. Establish Secure Tunnel
Forward the remote IBM i IWS and Administration ports to your local interface:

```bash
ssh -L 10010:127.0.0.1:10010 -L 2001:127.0.0.1:2001 -L 2002:127.0.0.1:2002 <user>@<ibmi-host>
```

### 2. Run the Frontend App
```bash
cd ibmi-customer-ui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to interact with your live DB2 customer data.
