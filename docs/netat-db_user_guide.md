# Cam Nang Su Dung Module: netat-db

## 1. Module nay dung de lam gi?
- **Muc dich:** `netat-db` la module cung cap cac keyword de tuong tac voi database trong automation test. Module ho tro ket noi, truy van, verify du lieu, quan ly transaction, va export ket qua tu nhieu loai database (MySQL, MariaDB, PostgreSQL, Oracle, SQL Server, H2, SQLite) thong qua HikariCP connection pooling, voi tich hop san Allure reporting va logging tu dong.

## 2. Cach Tich Hop (Setup)

### Maven Dependency:
```xml
<dependency>
    <groupId>com.vtnet.netat</groupId>
    <artifactId>netat-db</artifactId>
    <version>2.0.0</version>
</dependency>
```

### Cac dependency di kem (da co san trong module):
- `netat-core` - Framework core (AllureBaseKeyword, NetatLogger)
- `HikariCP` - Connection pooling
- `mariadb-java-client` - MariaDB JDBC driver
- `jackson-databind` + `jackson-datatype-jsr310` - JSON processing
- `allure-testng` - Allure reporting
- `testng` - Test framework

### Cau hinh logging (tuy chon):
Tao file `src/test/resources/database-logging.properties`:
```properties
db.logging.level=INFO
db.logging.format=TEXT
db.logging.masking.enabled=true
db.logging.slowquery.warning.threshold=1000
db.logging.slowquery.critical.threshold=5000
db.logging.json.prettyPrint=false
```

### Cau truc thu muc test:
```
src/test/resources/
  database_profiles/     # Chua file JSON cau hinh database profile
    dev/mysql.json
  sql_queries/           # Chua file .sql de tai su dung
    users/get_active.sql
```

## 3. Cac Use-Case Chinh & Code Mau

### Use-Case 1: Ket noi database dong (khong can file config)
- **Mo ta:** Truyen truc tiep thong tin ket noi (host, port, username, password, database type). Tra ve void, throw `DatabaseException` neu khong the ket noi.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Ket noi MariaDB
db.connectDatabase(
    "dbLocal",          // profileName - dung cho cac operations sau
    "mariadb",          // databaseType
    "localhost",        // host
    3306,               // port
    "quanlysinhvien",   // database name
    "root",             // username
    "123qwe!@#"         // password
);

// Ket noi PostgreSQL
db.connectDatabase("postgres-dev", "postgresql", "192.168.1.100", 5432,
    "myapp", "admin", "secretpass");

// Ket noi H2 in-memory cho testing
db.connectDatabase("h2-test", "h2", "mem", 0, "testdb", "sa", "");
```
**Database types ho tro:** mysql, mariadb, postgresql (postgres), oracle, sqlserver (mssql), h2, sqlite

---

### Use-Case 2: Thuc thi SELECT query
- **Mo ta:** `executeQuery(profileName, query, params...)` - Tra ve `List<Map<String, Object>>`, moi Map la 1 row voi key = column name. Tra ve empty list neu khong co ket qua.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Query voi parameter
List<Map<String, Object>> users = db.executeQuery(
    "dbLocal",
    "SELECT * FROM users WHERE email = ?",
    "john@test.com"
);
System.out.println("User ID: " + users.get(0).get("id"));
System.out.println("User Name: " + users.get(0).get("name"));

// Query voi nhieu parameters
List<Map<String, Object>> orders = db.executeQuery(
    "dbLocal",
    "SELECT * FROM orders WHERE user_id = ? AND status = ?",
    123, "completed"
);

for (Map<String, Object> order : orders) {
    System.out.println("Order ID: " + order.get("id"));
}
```

---

### Use-Case 3: Thuc thi INSERT / UPDATE / DELETE
- **Mo ta:** `executeUpdate(profileName, query, params...)` - Tra ve `int` so luong rows bi anh huong.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Insert
int inserted = db.executeUpdate(
    "dbLocal",
    "INSERT INTO users (name, email, status) VALUES (?, ?, ?)",
    "John Doe", "john@test.com", "active"
);
System.out.println("Inserted " + inserted + " row(s)");

// Update
int updated = db.executeUpdate(
    "dbLocal",
    "UPDATE users SET status = ? WHERE email = ?",
    "inactive", "john@test.com"
);

// Delete
int deleted = db.executeUpdate(
    "dbLocal",
    "DELETE FROM users WHERE id = ?",
    123
);
```

---

### Use-Case 4: Batch operations (insert/update nhieu records cung luc)
- **Mo ta:** `executeBatch(profileName, query, batchParams)` - Truyen vao `List<Object[]>`, tra ve `int[]` so rows affected cho moi batch.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

List<Object[]> batchParams = new ArrayList<>();
batchParams.add(new Object[]{"John Doe", "john@test.com", "active"});
batchParams.add(new Object[]{"Jane Smith", "jane@test.com", "active"});
batchParams.add(new Object[]{"Bob Johnson", "bob@test.com", "inactive"});

int[] results = db.executeBatch(
    "dbLocal",
    "INSERT INTO users (name, email, status) VALUES (?, ?, ?)",
    batchParams
);
System.out.println("Inserted " + results.length + " users");
```

---

### Use-Case 5: Thuc thi SQL script (nhieu statements)
- **Mo ta:** `executeScript(profileName, script)` - Cac statements phan cach bang dau `;`. Neu 1 statement fail thi cac statement sau se khong duoc execute.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

String script =
    "CREATE TABLE IF NOT EXISTS test_users (" +
    "    id INT PRIMARY KEY AUTO_INCREMENT," +
    "    name VARCHAR(100)," +
    "    email VARCHAR(100)" +
    ");" +
    "INSERT INTO test_users (name, email) VALUES ('John', 'john@test.com');" +
    "INSERT INTO test_users (name, email) VALUES ('Jane', 'jane@test.com');";

db.executeScript("dbLocal", script);
```

---

### Use-Case 6: Verify du lieu trong database
- **Mo ta:** Cac keyword verify se throw `AssertionError` neu dieu kien khong thoa man.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Verify record ton tai
db.verifyRecordExists(
    "dbLocal",
    "SELECT * FROM users WHERE email = ?",
    "john@test.com"
);

// Verify record KHONG ton tai (sau khi delete)
db.verifyRecordNotExists(
    "dbLocal",
    "SELECT * FROM users WHERE email = ?",
    "deleted@test.com"
);

// Verify so luong rows
db.verifyRowCount(
    "dbLocal",
    "SELECT * FROM users WHERE status = ?",
    5,          // expectedCount
    "active"    // param
);

// Verify gia tri cua 1 column cu the (first row)
db.verifyColumnValue(
    "dbLocal",
    "SELECT status FROM users WHERE id = ?",
    new Object[]{123},    // params
    "status",             // columnName
    "active"              // expectedValue
);
```

---

### Use-Case 7: Lay gia tri scalar (COUNT, MAX, MIN, AVG, SUM)
- **Mo ta:** `getScalarValue(profileName, query, params...)` - Tra ve `Object` (can cast ve dung type). Tra ve null neu khong co result.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Dem so luong users
Object countObj = db.getScalarValue("dbLocal", "SELECT COUNT(*) FROM users");
int totalUsers = ((Number) countObj).intValue();

// Lay ten user theo ID
String userName = (String) db.getScalarValue(
    "dbLocal", "SELECT name FROM users WHERE id = ?", 123
);

// Lay max order amount
double maxAmount = ((Number) db.getScalarValue(
    "dbLocal", "SELECT MAX(amount) FROM orders WHERE user_id = ?", 123
)).doubleValue();
```

---

### Use-Case 8: Lay danh sach gia tri cua 1 column
- **Mo ta:** `getColumnValues(profileName, query, columnName, params...)` - Tra ve `List<Object>`.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

List<Object> emails = db.getColumnValues(
    "dbLocal",
    "SELECT email FROM users WHERE status = ?",
    "email",
    "active"
);

if (emails.contains("john@test.com")) {
    System.out.println("John's email found in active users");
}
```

---

### Use-Case 9: Dem so luong rows
- **Mo ta:** `getRowCount(profileName, queryOrTable, params...)` - Co the truyen ten table hoac SELECT query. Tra ve `int`.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Tu table name (tu dong tao COUNT query)
int totalUsers = db.getRowCount("dbLocal", "users");

// Tu SELECT query
int activeCount = db.getRowCount(
    "dbLocal",
    "SELECT * FROM users WHERE status = ?",
    "active"
);
```

---

### Use-Case 10: Transaction management
- **Mo ta:** `beginTransaction`, `commitTransaction`, `rollbackTransaction` - Quan ly transaction voi isolation level tuy chon.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Begin transaction (default: READ_COMMITTED)
db.beginTransaction("dbLocal");
try {
    db.executeUpdate("dbLocal",
        "UPDATE accounts SET balance = balance - ? WHERE id = ?", 100.0, 1);
    db.executeUpdate("dbLocal",
        "UPDATE accounts SET balance = balance + ? WHERE id = ?", 100.0, 2);

    db.commitTransaction("dbLocal");
    System.out.println("Transaction committed");
} catch (Exception e) {
    db.rollbackTransaction("dbLocal", "Error: " + e.getMessage());
    System.out.println("Transaction rolled back");
}

// Voi isolation level cu the
db.beginTransaction("dbLocal", "SERIALIZABLE");
// ... operations ...
db.commitTransaction("dbLocal");
```
**Isolation levels ho tro:** READ_UNCOMMITTED, READ_COMMITTED (default), REPEATABLE_READ, SERIALIZABLE

---

### Use-Case 11: Connection management
- **Mo ta:** Kiem tra connection, lay pool stats, doi connection available, ngat ket noi.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Check connection health
if (db.checkConnection("dbLocal")) {
    System.out.println("Connection is healthy");
}

// Lay pool statistics
Map<String, Object> stats = db.getConnectionPoolStats("dbLocal");
System.out.println("Pool Size: " + stats.get("poolSize"));
System.out.println("Active: " + stats.get("activeConnections"));
System.out.println("Idle: " + stats.get("idleConnections"));
System.out.println("Waiting: " + stats.get("waitingThreads"));
System.out.println("Utilization: " + stats.get("utilizationPercent") + "%");

// Doi connection available (voi timeout)
db.waitForConnectionAvailable("dbLocal", 5000);

// Ngat ket noi va cleanup pool
db.disconnectDatabase("dbLocal");
```

---

### Use-Case 12: Table management
- **Mo ta:** Kiem tra table ton tai, lay danh sach columns, truncate, drop table.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Check table ton tai
if (db.tableExists("dbLocal", "users")) {
    System.out.println("Table 'users' exists");
}

// Lay danh sach columns
List<String> columns = db.getTableColumns("dbLocal", "users");
// => ["id", "name", "email", "created_at"]

// Truncate table (xoa data, reset auto-increment)
db.truncateTable("dbLocal", "temp_users");

// Drop table (IF EXISTS)
db.dropTable("dbLocal", "old_data");
```

---

### Use-Case 13: Utility keywords
- **Mo ta:** Doi row count dat expected value, so sanh 2 queries, export CSV, lay query results dang String table.
- **Code mau:**
```java
DatabaseKeyword db = new DatabaseKeyword();

// Doi async operation hoan thanh (polling 500ms, timeout 30s)
db.waitForRowCount(
    "dbLocal",
    "SELECT * FROM imported_data",
    100,     // expectedCount
    30000    // timeoutMs
);

// So sanh ket qua 2 queries
boolean isSame = db.compareQueryResults(
    "dbLocal",
    "SELECT * FROM users ORDER BY id",
    "SELECT * FROM users_backup ORDER BY id"
);

// Export query results ra CSV
db.exportQueryToCSV(
    "dbLocal",
    "SELECT id, name, email FROM users",
    "/tmp/users_export.csv"
);

// Lay results dang formatted table string (de debug/log)
String tableStr = db.getQueryResultsAsString(
    "dbLocal",
    "SELECT id, name, email FROM users WHERE status = ?",
    "active"
);
System.out.println(tableStr);
// Output:
// +----+-----------+-------------------+
// | id | name      | email             |
// +----+-----------+-------------------+
// | 1  | John Doe  | john@example.com  |
// +----+-----------+-------------------+
```

---

### Use-Case 14: Load database profile tu file JSON
- **Mo ta:** `DatabaseHelper.getProfile(relativePath)` - Doc file JSON tu `src/test/resources/database_profiles/`. Tra ve `DatabaseProfile`.
- **Code mau:**
```java
import static com.vtnet.netat.db.utils.DatabaseHelper.getProfile;
import com.vtnet.netat.db.config.DatabaseProfile;
import com.vtnet.netat.db.connection.ConnectionManager;

// Load profile tu file JSON
DatabaseProfile profile = getProfile("dev/mysql");
// => Doc file: src/test/resources/database_profiles/dev/mysql.json

// Dang ky profile vao ConnectionManager
ConnectionManager.registerProfile(profile);

// Hoac tao profile bang code (Builder pattern)
DatabaseProfile customProfile = DatabaseProfile.builder()
    .name("my-db")
    .jdbcUrl("jdbc:mariadb://localhost:3306/testdb")
    .username("root")
    .password("password")
    .driverClassName("org.mariadb.jdbc.Driver")
    .poolSize(10)              // default: 10
    .connectionTimeout(30000)  // default: 30000ms
    .build();
ConnectionManager.registerProfile(customProfile);
```

---

### Use-Case 15: Load SQL query tu file
- **Mo ta:** `QueryHelper.getQuery(relativePath)` - Doc file .sql tu `src/test/resources/sql_queries/`. Tra ve `String`.
- **Code mau:**
```java
import static com.vtnet.netat.db.utils.QueryHelper.getQuery;

// Doc file: src/test/resources/sql_queries/users/get_active.sql
String query = getQuery("users/get_active");

DatabaseKeyword db = new DatabaseKeyword();
List<Map<String, Object>> results = db.executeQuery("dbLocal", query);
```

## 4. Cac Data Models (DTOs/POJOs) Thuong Dung

### DatabaseProfile (config)
```
name             : String  - Ten profile (unique identifier)
jdbcUrl          : String  - JDBC connection URL
username         : String  - Database username
password         : String  - Database password
driverClassName  : String  - JDBC driver class name
poolSize         : int     - So luong connections trong pool (default: 10)
connectionTimeout: long    - Timeout ket noi (ms, default: 30000)
```
Tao bang Builder pattern: `DatabaseProfile.builder().name("...").jdbcUrl("...").build()`

### PoolStats (logging model)
```
poolSize          : int    - Tong so connections trong pool
activeConnections : int    - So connections dang su dung
idleConnections   : int    - So connections ranh
waitingThreads    : int    - So threads dang doi connection
```
Method: `getUtilizationPercent()` => `double` (% su dung pool)

### QueryExecutionLog (logging model)
```
logId        : String   - UUID cua log entry
timestamp    : Instant  - Thoi diem thuc thi
profileName  : String   - Ten database profile
query        : String   - Cau SQL
parameters   : Object[] - Cac tham so
durationMs   : long     - Thoi gian thuc thi (ms)
rowsAffected : int      - So rows bi anh huong
success      : boolean  - Thanh cong hay khong
errorMessage : String   - Thong bao loi (neu co)
threadName   : String   - Ten thread
```

### ConnectionLifecycleLog (logging model)
```
timestamp    : Instant   - Thoi diem event
event        : Event     - Loai event (OPEN, CLOSE, TIMEOUT, REFUSED, POOL_EXHAUSTED)
profileName  : String    - Ten database profile
jdbcUrl      : String    - JDBC URL
durationMs   : long      - Thoi gian (ms)
poolStats    : PoolStats - Thong ke pool tai thoi diem event
errorMessage : String    - Thong bao loi (neu co)
```

### TransactionLog (logging model)
```
transactionId  : String       - UUID cua transaction
startTime      : Instant      - Thoi diem bat dau
endTime        : Instant      - Thoi diem ket thuc
profileName    : String       - Ten database profile
isolationLevel : String       - Isolation level
status         : Status       - Trang thai (ACTIVE, COMMITTED, ROLLED_BACK)
operations     : List<String> - Danh sach operations trong transaction
rollbackReason : String       - Ly do rollback (neu co)
```

### ErrorSeverity (enum)
```
CRITICAL (1) - Loi nghiem trong, he thong khong the tiep tuc
ERROR    (2) - Loi, operation that bai nhung he thong van chay
WARNING  (3) - Canh bao, operation hoan thanh nhung co van de
INFO     (4) - Thong tin, khong co loi
```

### LogLevel (enum)
```
TRACE (0), DEBUG (1), INFO (2), WARN (3), ERROR (4), OFF (5)
```

### Exception Hierarchy
```
DatabaseException (abstract base)
  +-- GenericDatabaseException
  +-- ConnectionException
  |     +-- ConnectionTimeoutException
  |     +-- ConnectionPoolExhaustedException
  |     +-- ConnectionRefusedException
  +-- QueryExecutionException
  |     +-- QueryTimeoutException
  |     +-- QuerySyntaxException
  |     +-- ConstraintViolationException
  +-- TransactionException
  |     +-- TransactionTimeoutException
  |     +-- TransactionRollbackException
  |     +-- DeadlockException
  +-- ConfigurationException
  |     +-- InvalidProfileException
  |     +-- InvalidConnectionStringException
  |     +-- MissingPropertyException
  +-- DataValidationException
        +-- DataFormatException
        +-- DataTypeMismatchException
        +-- NullValueException
```

## 5. Cam nang Troubleshooting & Directives

### Loi thuong gap

| Loi | Nguyen nhan | Cach xu ly |
|-----|-------------|------------|
| `Pool for profile 'xxx' not found` | Chua goi `connectDatabase()` hoac `registerProfile()` | Goi `connectDatabase()` truoc khi thuc thi query |
| `ConnectionRefusedException` | Database server khong chay hoac sai host/port | Kiem tra database server dang chay, kiem tra host va port |
| `ConnectionPoolExhaustedException` | Qua nhieu connections dong thoi | Tang `poolSize` trong profile hoac dung `waitForConnectionAvailable()` |
| `QuerySyntaxException` | Sai cu phap SQL | Kiem tra lai cau SQL, dung ten table/column chinh xac |
| `ConstraintViolationException` | Vi pham constraint (unique, foreign key, not null) | Kiem tra du lieu truoc khi insert/update |
| `No active transaction for profile` | Goi commit/rollback khi chua goi beginTransaction | Dam bao goi `beginTransaction()` truoc |
| `Unable to read query file` | File .sql khong ton tai tai path da cho | Kiem tra file ton tai tai `src/test/resources/sql_queries/` |
| `Unable to read database profile file` | File JSON profile khong ton tai | Kiem tra file ton tai tai `src/test/resources/database_profiles/` |

### Luu y quan trong

1. **Luon cleanup connection:** Goi `disconnectDatabase()` trong `@AfterTest` hoac `@AfterSuite` de tranh resource leak.

2. **Transaction phai co try-catch:** Luon su dung pattern `beginTransaction` -> try { operations + `commitTransaction` } catch { `rollbackTransaction` } de dam bao transaction duoc close.

3. **Sensitive data tu dong duoc mask trong log:** Cac column nhu password, token, credit_card, ssn se tu dong bi mask thanh `***` trong log output.

4. **Slow query detection:** Mac dinh warning tai 1000ms, critical tai 5000ms. Co the tuy chinh qua file `database-logging.properties`.

5. **Parameter binding:** Luon dung `?` placeholder va truyen params rieng de tranh SQL injection, KHONG duoc noi chuoi truc tiep vao query.

6. **Batch operations:** Dung `executeBatch()` thay vi loop `executeUpdate()` khi can insert/update >= 10 records de tang hieu suat.

7. **TRUNCATE vs DELETE:** `truncateTable()` nhanh hon nhung khong the rollback va reset auto-increment. Dung trong test cleanup.

8. **Thread safety:** `ConnectionManager` su dung `ConcurrentHashMap` nen an toan khi chay parallel tests. Moi thread lay connection rieng tu pool.

9. **Retry logic:** Su dung `SqlStateMapper.isRetryable(exception)` va `SqlStateMapper.getRetryDelay(exception, attemptNumber)` de xu ly loi tam thoi (deadlock, timeout, pool exhausted).

10. **JdbcUrlBuilder:** Co the su dung `JdbcUrlBuilder.buildUrl(dbType, host, port, databaseName)` de tao JDBC URL tu cac thanh phan rieng le. Ho tro: mariadb, mysql, postgresql, sqlserver, oracle, clickhouse.
