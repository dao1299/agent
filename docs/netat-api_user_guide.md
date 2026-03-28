# Cam Nang Su Dung Module: netat-api

## 1. Module nay dung de lam gi?
- **Muc dich:** `netat-api` la module cung cap cac keyword de thuc hien API automation testing (REST). Module bao gom cac chuc nang: gui HTTP request (GET, POST, PUT, DELETE, PATCH), xac thuc (Bearer, Basic, API Key, OAuth2), kiem tra response (status code, JSON path, headers, body), ho tro thuc thi truc tiep cURL command, va bao ve du lieu nhay cam (ma hoa/che dau token, password trong log va Allure report).

## 2. Cach Tich Hop (Setup)
- **Maven Dependency:**
```xml
<dependency>
    <groupId>com.vtnet.netat</groupId>
    <artifactId>netat-api</artifactId>
    <version>2.0.0</version>
</dependency>
```

Module nay phu thuoc vao `netat-core` (tu dong duoc keo theo), REST Assured, Jayway JsonPath, OkHttp, va Apache CXF. Java 11 tro len.

## 3. Cac Use-Case Chinh & Code Mau

### Use-Case 1: Gui GET request don gian
- **Mo ta:** Thiet lap base URL, gui GET request toi endpoint, kiem tra status code va trich xuat du lieu JSON tu response.
- **Code mau:**
```java
ApiKeyword api = new ApiKeyword();
ApiAssert verify = new ApiAssert();

// Cau hinh
api.setApiBaseUrl("https://api.example.com");
api.setRequestTimeout(30);
api.enableRequestLogging(true);

// Gui request
ApiResponse response = api.sendGetRequest("/users/1");

// Kiem tra
verify.statusCode(response, 200);
String name = api.extractJsonValue(response, "$.name");
int userId = api.extractJsonInt(response, "$.id");
```

### Use-Case 2: Gui POST voi JSON body
- **Mo ta:** Gui POST request voi JSON body. Co 2 cach: dung shortcut `sendPostWithJson` (1 buoc), hoac set body roi gui rieng.
- **Code mau:**
```java
ApiKeyword api = new ApiKeyword();
ApiAssert verify = new ApiAssert();

api.setApiBaseUrl("https://api.example.com");

// Cach 1: Shortcut (1 step)
ApiResponse response = api.sendPostWithJson("/users", "{\"name\":\"John\",\"email\":\"john@test.com\"}");
verify.statusCode(response, 201);
verify.jsonPathEquals(response, "$.name", "John");

// Cach 2: Set body truoc roi gui
api.setContentType("JSON");
api.setRequestBody("{\"name\":\"Jane\"}");
ApiResponse response2 = api.sendPostRequest("/users");
api.clearRequestBody();
```

### Use-Case 3: Xac thuc Bearer Token
- **Mo ta:** Thiet lap Bearer token (JWT) cho cac request can xac thuc. Token se duoc gui trong header `Authorization: Bearer <token>`.
- **Code mau:**
```java
ApiKeyword api = new ApiKeyword();

api.setApiBaseUrl("https://api.example.com");
api.setBearerToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");

ApiResponse response = api.sendGetRequest("/protected/resource");

// Xoa auth khi khong can nua
api.removeAuthentication();
```

### Use-Case 4: Xac thuc Basic Auth va API Key
- **Mo ta:** Ho tro Basic Authentication (username/password) va API Key (dat trong header hoac query param).
- **Code mau:**
```java
ApiKeyword api = new ApiKeyword();

// Basic Auth
api.setBasicAuth("admin", "password123");
ApiResponse resp1 = api.sendGetRequest("/admin/dashboard");

// API Key trong Header
api.removeAuthentication();
api.setApiKey("X-API-Key", "abc123xyz", "HEADER");
ApiResponse resp2 = api.sendGetRequest("/data");

// API Key trong Query parameter
api.setApiKey("api_key", "abc123xyz", "QUERY");
// URL se thanh: /data?api_key=abc123xyz
```

### Use-Case 5: Thuc thi cURL command truc tiep
- **Mo ta:** Copy cURL tu browser DevTools hoac Postman va paste truc tiep. Ho tro cac option: -X, -H, -d, -u, -k, -b, -F. Tra ve `ApiResponse`.
- **Code mau:**
```java
ApiKeyword api = new ApiKeyword();
ApiAssert verify = new ApiAssert();

// Tu cURL string
String curl = "curl -X POST 'https://api.example.com/users' " +
              "-H 'Content-Type: application/json' " +
              "-H 'Authorization: Bearer token123' " +
              "-d '{\"name\": \"John\"}'";
ApiResponse response = api.executeCurl(curl);
verify.statusCode(response, 201);

// Tu file
ApiResponse response2 = api.executeCurlFromFile("src/test/resources/curl/create_user.sh");

// Chi parse de debug, khong gui request
String info = api.parseCurl(curl);
System.out.println(info);
```

### Use-Case 6: GET voi query params va path params
- **Mo ta:** Them query parameters va path parameters vao request. Query params duoc them vao URL, path params thay the placeholder trong endpoint.
- **Code mau:**
```java
ApiKeyword api = new ApiKeyword();

api.setApiBaseUrl("https://api.example.com");

// Cach 1: Shortcut sendGetWithParams tu JSON string
ApiResponse response = api.sendGetWithParams("/users", "{\"page\":1,\"limit\":10}");
// => GET /users?page=1&limit=10

// Cach 2: Them tung param
api.addQueryParam("page", 1);
api.addQueryParam("limit", 10);
ApiResponse response2 = api.sendGetRequest("/users");
api.clearQueryParams();

// Path params
api.addPathParam("userId", 123);
ApiResponse response3 = api.sendGetRequest("/users/{userId}");
```

### Use-Case 7: Kiem tra response - JSON Path assertions
- **Mo ta:** Kiem tra gia tri JSON trong response bang JSON Path expression (cu phap `$.field.subfield`). Ho tro equals, not equals, exists, null, contains, va array assertions.
- **Code mau:**
```java
ApiAssert verify = new ApiAssert();

// Status assertions
verify.statusCode(response, 200);
verify.statusSuccess(response);        // 2xx
verify.statusClientError(response);    // 4xx
verify.statusServerError(response);    // 5xx
verify.statusIn(response, "200,201,204");

// JSON path assertions
verify.jsonPathEquals(response, "$.name", "John Doe");
verify.jsonPathNotEquals(response, "$.status", "error");
verify.jsonPathExists(response, "$.user.email");
verify.jsonPathNotExists(response, "$.user.password");  // security check
verify.jsonPathIsNull(response, "$.deletedAt");
verify.jsonPathNotNull(response, "$.user.id");
verify.jsonPathContains(response, "$.message", "success");

// Array assertions
verify.arraySize(response, "$.users", 10);
verify.arrayNotEmpty(response, "$.users");
verify.arrayIsEmpty(response, "$.errors");
verify.arrayContains(response, "$.roles", "admin");

// Body assertions
verify.bodyContains(response, "success");
verify.bodyNotContains(response, "error");
verify.bodyNotEmpty(response);

// Header assertions
verify.headerEquals(response, "Content-Type", "application/json");
verify.headerExists(response, "Authorization");
verify.headerContains(response, "Content-Type", "json");

// Performance assertion
verify.responseTimeLessThan(response, 2000);  // < 2 giay

// General assertions
verify.assertTrue(code > 0, "Code should be positive");
verify.assertFalse(hasError, "Should not have error");
verify.assertEquals(actualValue, expectedValue);
verify.assertNotNull(userId);
```

### Use-Case 8: Bao ve du lieu nhay cam (Sensitive Data Protection)
- **Mo ta:** Cac method co hau to `Sensitive` se giai ma du lieu da ma hoa va tu dong che dau trong log/Allure report. Gia tri that van duoc su dung trong request.
- **Code mau:**
```java
ApiKeyword api = new ApiKeyword();

// Header nhay cam (da ma hoa)
api.setHeaderSensitive("Authorization", encryptedToken);

// Bearer token nhay cam
api.setBearerTokenSensitive(encryptedToken);

// Basic auth voi password da ma hoa
api.setBasicAuthSensitive("admin", encryptedPassword);

// API Key nhay cam
api.setApiKeySensitive("X-API-Key", encryptedApiKey, "HEADER");

// Query param nhay cam
api.addQueryParamSensitive("access_token", encryptedToken);

// Request body nhay cam
api.setRequestBodySensitive(encryptedJsonBody);

// POST/PUT voi JSON nhay cam
ApiResponse response = api.sendPostWithJsonSensitive("/auth/login", encryptedLoginJson);
ApiResponse response2 = api.sendPutWithJsonSensitive("/users/1", encryptedUserJson);

// Trich xuat gia tri nhay cam tu response (se bi mask trong log)
String token = api.extractJsonValueSensitive(response, "$.access_token");
```

### Use-Case 9: Quan ly Headers va tat SSL
- **Mo ta:** Them/xoa headers, thiet lap Content-Type/Accept, va tat SSL verification cho moi truong test.
- **Code mau:**
```java
ApiKeyword api = new ApiKeyword();

// Headers
api.addHeader("X-Request-ID", "12345");
api.setContentType("JSON");         // => application/json
api.setAcceptHeader("XML");         // => application/xml
api.removeHeader("X-Custom-Header");
api.clearAllHeaders();

// SSL - chi dung cho moi truong test!
api.disableSslVerification();
ApiResponse response = api.sendGetRequest("https://self-signed.example.com/api");
api.enableSslVerification();  // bat lai

// Reset toan bo context
api.resetApiContext();
// Hoac chi xoa request settings (giu lai auth, base URL)
api.clearAllRequestSettings();
```

### Use-Case 10: Doc du lieu tu ApiResponse
- **Mo ta:** ApiResponse cung cap nhieu cach trich xuat du lieu: body as string, JSON path, XML path, headers, cookies, deserialize thanh object.
- **Code mau:**
```java
ApiKeyword api = new ApiKeyword();
ApiResponse response = api.sendGetRequest("/users/1");

// Basic info
int statusCode = api.getStatusCode(response);
long responseTime = api.getResponseTime(response);
String body = api.getBody(response);

// JSON extraction
String name = api.extractJsonValue(response, "$.name");
int id = api.extractJsonInt(response, "$.id");
double price = api.extractJsonDouble(response, "$.price");
boolean active = api.extractJsonBoolean(response, "$.active");
int count = api.getArraySize(response, "$.items");

// Response header
String contentType = api.getHeader(response, "Content-Type");

// Truy cap truc tiep ApiResponse object (advanced)
ApiResponse resp = api.sendGetRequest("/data");
Map<String, Object> bodyMap = resp.getBodyAsMap();
String cookie = resp.getCookie("session_id");
Map<String, String> allHeaders = resp.getHeaders();
String prettyBody = resp.getPrettyBody();
String xmlValue = resp.getXPath("//user/name");
```

## 4. Cac Data Models (DTOs/POJOs) Thuong Dung

### 4.1. `ApiContext` (`com.vtnet.netat.api.core.ApiContext`)
Luu tru trang thai cau hinh cho moi request. Thread-safe (moi thread co context rieng).

| Field | Type | Default | Mo ta |
|-------|------|---------|-------|
| baseUri | String | null | URL goc (VD: https://api.example.com) |
| timeout | int | 30 | Thoi gian cho toi da (giay) |
| logRequests | boolean | false | Bat/tat log chi tiet |
| sslVerificationEnabled | boolean | true | Bat/tat kiem tra SSL |
| headers | Map<String, String> | {} | HTTP headers |
| queryParams | Map<String, Object> | {} | Query parameters |
| pathParams | Map<String, Object> | {} | Path parameters |
| formParams | Map<String, Object> | {} | Form parameters |
| requestBody | Object | null | Noi dung body |
| contentType | String | null | Content-Type header |
| authType | AuthType | NONE | Loai xac thuc |
| bearerToken | String | null | Bearer/JWT token |
| basicUsername | String | null | Username cho Basic Auth |
| basicPassword | String | null | Password cho Basic Auth |
| apiKeyName | String | null | Ten API Key |
| apiKeyValue | String | null | Gia tri API Key |
| apiKeyLocation | ApiKeyLocation | null | Vi tri API Key (HEADER/QUERY) |
| oauth2Token | String | null | OAuth2 token |

**Enum `AuthType`:** NONE, BEARER, BASIC, API_KEY, OAUTH2

**Enum `ApiKeyLocation`:** HEADER, QUERY

### 4.2. `ApiResponse` (`com.vtnet.netat.api.core.ApiResponse`)
Wrapper cua REST Assured Response, tu dong attach vao Allure Report.

| Method | Return Type | Mo ta |
|--------|-------------|-------|
| getStatusCode() | int | HTTP status code |
| getStatusLine() | String | Status line (VD: "HTTP/1.1 200 OK") |
| getResponseTime() | long | Response time (ms) |
| getContentType() | String | Content-Type cua response |
| getBody() | String | Body as string |
| getPrettyBody() | String | Body formatted (pretty print) |
| getBodyAsByteArray() | byte[] | Body as byte array |
| getBodyAs(Class<T>) | T | Deserialize body thanh object |
| getBodyAsMap() | Map<String, Object> | Parse body thanh Map |
| getJsonPath(String) | String | Trich xuat gia tri tu JSON path |
| getJsonPathAsInt(String) | Integer | Trich xuat int tu JSON path |
| getJsonPathAsDouble(String) | Double | Trich xuat double tu JSON path |
| getJsonPathAsBoolean(String) | Boolean | Trich xuat boolean tu JSON path |
| getJsonPathAsList(String) | List<T> | Trich xuat list tu JSON path |
| getXPath(String) | String | Trich xuat gia tri tu XPath (XML) |
| getXPathAsList(String) | List<String> | Trich xuat list tu XPath |
| getHeader(String) | String | Lay gia tri header |
| getHeaders() | Map<String, String> | Lay tat ca headers |
| hasHeader(String) | boolean | Kiem tra header ton tai |
| getCookie(String) | String | Lay gia tri cookie |
| getCookies() | Map<String, String> | Lay tat ca cookies |
| hasCookie(String) | boolean | Kiem tra cookie ton tai |
| getRestAssuredResponse() | Response | Lay raw REST Assured Response |

### 4.3. `CurlParser.ParsedCurl` (`com.vtnet.netat.api.curl.CurlParser.ParsedCurl`)
Ket qua parse tu cURL command.

| Field | Type | Mo ta |
|-------|------|-------|
| method | String | HTTP method (GET, POST, PUT...) |
| url | String | URL |
| headers | Map<String, String> | Headers |
| body | String | Request body |
| basicAuthUser | String | Basic Auth username |
| basicAuthPassword | String | Basic Auth password |
| insecure | boolean | Tat SSL verification (-k) |
| cookies | Map<String, String> | Cookies |
| formData | Map<String, String> | Form data |
| isFormData | boolean | Co phai form data hay khong |

### 4.4. `CurlParser` (`com.vtnet.netat.api.curl.CurlParser`)
Utility class de parse cURL command.

| Method | Mo ta |
|--------|-------|
| `static ParsedCurl parse(String curlCommand)` | Parse cURL command thanh ParsedCurl object |
| `static boolean isValidCurl(String command)` | Kiem tra cURL command co hop le khong |

### 4.5. `CurlExecutor` (`com.vtnet.netat.api.curl.CurlExecutor`)
Thuc thi ParsedCurl hoac cURL string truc tiep.

| Method | Mo ta |
|--------|-------|
| `static ApiResponse execute(ParsedCurl parsedCurl)` | Thuc thi ParsedCurl |
| `static ApiResponse execute(ParsedCurl parsedCurl, ApiContext ctx)` | Thuc thi voi context bo sung |
| `static ApiResponse execute(String curlCommand)` | Thuc thi cURL string truc tiep |
| `static ApiResponse execute(String curlCommand, ApiContext ctx)` | Thuc thi cURL string voi context |

### 4.6. `BaseApiKeyword` (`com.vtnet.netat.api.core.BaseApiKeyword`)
Abstract class cha cua ApiKeyword va ApiAssert. Ke thua tu `AllureBaseKeyword` (netat-core).

| Method | Visibility | Mo ta |
|--------|-----------|-------|
| getContext() | protected | Lay ApiContext cua thread hien tai |
| resetContext() | protected | Reset context ve mac dinh |
| cleanupThreadLocal() | public static | Xoa ThreadLocal (goi trong @AfterMethod) |
| executeGet/Post/Put/Patch/Delete/Head/Options(endpoint) | protected | Thuc thi HTTP request |
| executeMultipartUpload(endpoint, filePath, fileFieldName) | protected | Upload file |
| executeMultipartUploadWithMetadata(endpoint, filePath, fileFieldName, metadata) | protected | Upload file kem metadata |
| convertToMimeType(String shortForm) | protected | Chuyen "JSON" -> "application/json" |
| waitForCondition(Supplier, timeoutSec, pollMs) | protected | Polling cho condition |

## 5. Cam nang Troubleshooting & Directives

### 5.1. Loi thuong gap

| Loi | Nguyen nhan | Cach xu ly |
|-----|-------------|------------|
| `IllegalArgumentException: Endpoint cannot be null` | Truyen endpoint null/rong | Kiem tra endpoint truoc khi goi |
| `RuntimeException: Cannot parse response body as Map` | Response body khong phai JSON hop le | Dung `getBody()` thay vi `getBodyAsMap()` |
| `RuntimeException: Cannot extract int from path: ...` | JSON path khong ton tai hoac gia tri khong phai so | Dung `extractJsonValue()` de lay String truoc |
| `IllegalArgumentException: No URL found in cURL command` | cURL command thieu URL | Kiem tra lai cURL syntax |
| `IllegalArgumentException: Command must start with 'curl'` | cURL command khong bat dau bang "curl" | Them "curl" vao dau command |
| SSL Certificate Error | Moi truong test dung self-signed cert | Goi `api.disableSslVerification()` truoc khi gui request |

### 5.2. Luu y quan trong

1. **Thread-Safety:** `ApiContext` duoc luu trong `ThreadLocal`, moi thread co context rieng. An toan khi chay parallel tests.

2. **Cleanup ThreadLocal:** Luon goi `BaseApiKeyword.cleanupThreadLocal()` trong `@AfterMethod` de tranh memory leak:
```java
@AfterMethod
public void tearDown() {
    BaseApiKeyword.cleanupThreadLocal();
}
```

3. **SSL Verification:** `disableSslVerification()` CHI DUNG CHO MOI TRUONG TEST. Khong bao gio dung trong production.

4. **Clear request body:** Cac shortcut method (`sendPostWithJson`, `sendPutWithJson`, `sendGetWithParams`) tu dong clear body/params sau khi gui. Nhung neu dung `setRequestBody()` + `sendPostRequest()` rieng le, can goi `clearRequestBody()` sau do.

5. **JSON Path syntax:** Ho tro ca cu phap co `$` prefix va khong co. Vi du: `$.user.name` va `user.name` deu hop le. Uu tien dung Jayway JsonPath syntax (`$.field`).

6. **Sensitive methods:** Cac method co hau to `Sensitive` (VD: `setBearerTokenSensitive`) yeu cau gia tri da duoc ma hoa boi `SecretDecryptor` tu netat-core. Gia tri se duoc giai ma runtime va che dau trong log bang `*****`.

7. **Content-Type shortcut:** `setContentType()` chap nhan ca ten ngan va MIME type day du:
   - `"JSON"` => `application/json`
   - `"XML"` => `application/xml`
   - `"FORM"` => `application/x-www-form-urlencoded`
   - `"TEXT"` => `text/plain`
   - `"HTML"` => `text/html`
   - `"MULTIPART"` => `multipart/form-data`

8. **Allure Report:** `ApiResponse` tu dong attach response body vao Allure Report khi duoc tao. Moi assertion method trong `ApiAssert` deu co `@Step` annotation de hien thi trong report.

9. **cURL support:** `CurlParser` ho tro cac option: `-X`, `-H`, `-d`/`--data`/`--data-raw`/`--data-binary`, `--data-urlencode`, `-F`/`--form`, `-u`, `-k`/`--insecure`, `-b`/`--cookie`, `-A`, `-e`, `--compressed`, `-L`. Ho tro multiline voi backslash (`\`).

10. **Reset vs Clear:** `resetApiContext()` xoa TAT CA (bao gom auth, base URL, timeout). `clearAllRequestSettings()` chi xoa headers, params, body nhung GIU LAI auth va base URL.
