# Cam Nang Su Dung Module: netat-core-api

## 1. Module nay dung de lam gi?
- **Muc dich:** `netat-core-api` la module nhe (lightweight) cung cap cac thanh phan nen tang cho toan bo platform NETAT: mo hinh du lieu UI (ObjectUI/Locator), he thong annotation cho keyword, doc du lieu test tu Excel/CSV, quan ly cau hinh, bao mat (ma hoa/giai ma AES-256-GCM), logging co context, va co che soft-assertion. Module nay **KHONG** phu thuoc vao Selenium, Appium, hay Allure -- chi chua logic core de cac module khac (netat-core, netat-playwright, netat-desktop...) ke thua va mo rong.

## 2. Cach Tich Hop (Setup)
- **Maven Dependency:**
```xml
<dependency>
    <groupId>com.vtnet.netat</groupId>
    <artifactId>netat-core-api</artifactId>
    <version>2.0.0</version>
</dependency>
```

Parent POM la `com.vtnet.netat:netat-libraries:2.0.0`. Cac dependency chinh duoc su dung ben trong:
- `slf4j-api` + `logback-classic` (logging)
- `commons-lang3`, `commons-io` (utilities)
- `jackson-databind` + `jackson-datatype-jsr310` (JSON)
- `poi-ooxml` (doc Excel)
- `snakeyaml` (doc YAML)

## 3. Cac Use-Case Chinh & Code Mau

### Use-Case 1: Dinh nghia Custom Keyword voi Annotation
- **Mo ta:** Su dung `@NetatKeyword` (keyword co san cua framework) hoac `@CustomKeyword` (keyword do nguoi dung tu viet) de danh dau method. Framework se tu dong log, report Allure, va xu ly loi. Method **phai la public**.
- **Code mau:**
```java
import com.vtnet.netat.core.BaseKeyword;
import com.vtnet.netat.core.annotations.CustomKeyword;
import com.vtnet.netat.core.ui.ObjectUI;

public class MyKeywords extends BaseKeyword {

    @CustomKeyword(
        name = "Login with credentials",
        description = "Dang nhap he thong voi username va password",
        category = "Authentication",
        subCategory = "Web Login",
        parameters = {"username: String - Ten dang nhap", "password: String - Mat khau"},
        explainer = "Login as {username}",
        example = "login(txtUser, txtPass, btnLogin, \"admin\", \"123456\")"
    )
    public void login(ObjectUI txtUser, ObjectUI txtPass, ObjectUI btnLogin,
                      String username, String password) {
        execute(() -> {
            // Logic tuong tac UI o day (sendKeys, click, v.v.)
            // Cac method sendKeys/click do lop con cung cap (AllureBaseKeyword)
            return null;
        }, txtUser, txtPass, btnLogin, username, password);
    }
}
```

**Cac truong cua `@NetatKeyword`:**
| Truong | Bat buoc | Mo ta |
|---|---|---|
| `name` | Co | Ten keyword hien thi trong log va Allure |
| `description` | Co | Mo ta chi tiet |
| `category` | Co | Phan loai (vd: "Browser", "Element") |
| `subCategory` | Khong | Phan loai con |
| `parameters` | Khong | Mo ta tung tham so, format: `"paramName: Type - mo ta"` |
| `returnValue` | Khong | Mo ta gia tri tra ve (mac dinh: `"void"`) |
| `explainer` | Khong | Template ten dong, ho tro `{paramName}` hoac `{0}`, `{1}` |
| `example` | Khong | Vi du su dung |
| `note` | Khong | Ghi chu them |

**Cac truong cua `@CustomKeyword`:** Tuong tu `@NetatKeyword` nhung khong co `returnValue` va `note`.

### Use-Case 2: Doc du lieu test tu Excel hoac CSV (Data-Driven Testing)
- **Mo ta:** Su dung `DataFileHelper.getTestData(relativePath)` de doc file cau hinh JSON, tu do doc du lieu test tu file Excel (.xlsx) hoac CSV. Tra ve `Object[][]` de dung voi TestNG `@DataProvider`.
- **Code mau:**

**Buoc 1: Tao file cau hinh JSON** (dat tai `src/test/java/automationtest/datafile/`)
```json
{
    "name": "LoginData",
    "driver": "ExcelFile",
    "filePath": "src/test/resources/data/login_data.xlsx",
    "sheetName": "Sheet1",
    "containsHeaders": true
}
```

Doi voi CSV:
```json
{
    "name": "LoginData",
    "driver": "CSVFile",
    "filePath": "src/test/resources/data/login_data.csv",
    "csvSeparator": ",",
    "containsHeaders": true
}
```

**Buoc 2: Su dung trong TestNG DataProvider**
```java
import com.vtnet.netat.core.utils.DataFileHelper;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import java.util.Map;

public class LoginTest {

    @DataProvider(name = "loginData")
    public Object[][] getLoginData() {
        // relativePath tinh tu src/test/java/automationtest/datafile/
        return DataFileHelper.getTestData("login/login_data");
    }

    @Test(dataProvider = "loginData")
    public void testLogin(Map<String, String> data) {
        String username = data.get("username");
        String password = data.get("password");
        // ... thuc hien test
    }
}
```

**Doc truc tiep khong qua JSON config:**
```java
import com.vtnet.netat.core.data.ExcelDataReader;
import com.vtnet.netat.core.data.CsvDataReader;
import java.util.List;
import java.util.Map;

// Doc Excel
ExcelDataReader excelReader = new ExcelDataReader();
List<Map<String, String>> data = excelReader.readData(
    "path/to/file.xlsx",  // duong dan file
    "Sheet1",             // ten sheet (null = sheet dau tien)
    true                  // co header hay khong
);

// Doc CSV
CsvDataReader csvReader = new CsvDataReader();
List<Map<String, String>> csvData = csvReader.readData(
    "path/to/file.csv",  // duong dan file
    ",",                  // separator (null = mac dinh dau phay)
    true                  // co header hay khong
);
```

### Use-Case 3: Quan ly cau hinh voi ConfigurationManager
- **Mo ta:** Lay gia tri cau hinh theo thu tu uu tien: System Properties > Registered config provider > `config/default.properties` tren classpath. Ho tro tu dong giai ma gia tri dang `ENC(...)`.
- **Code mau:**
```java
import com.vtnet.netat.core.utils.ConfigurationManager;

// Lay String property
String baseUrl = ConfigurationManager.getProperty("base.url");

// Lay voi gia tri mac dinh
String browser = ConfigurationManager.getProperty("browser", "chrome");

// Lay boolean
boolean headless = ConfigurationManager.getBoolean("headless", false);

// Lay int
int timeout = ConfigurationManager.getInt("timeout.seconds", 30);

// Lay long
long pollInterval = ConfigurationManager.getLong("poll.interval.ms", 500L);

// Gia tri ma hoa trong file properties se tu dong duoc giai ma:
// db.password=ENC(base64_ciphertext_here)
String dbPassword = ConfigurationManager.getProperty("db.password"); // -> plaintext
```

**Dang ky config provider tu module khac:**
```java
// Duoc goi tu module netat-driver (ConfigReader) luc startup
ConfigurationManager.setConfigProvider(key -> myConfigReader.get(key));
```

### Use-Case 4: Giai ma du lieu nhay cam (Secret Decryption)
- **Mo ta:** Giai ma cac gia tri da duoc ma hoa bang AES-256-GCM. Master key lay tu bien moi truong `NETAT!!_MASTER@@_KEY##`. Format ciphertext: `Base64(salt[16] + iv[12] + encrypted_data)`.
- **Code mau:**
```java
import com.vtnet.netat.core.secret.SecretDecryptor;
import com.vtnet.netat.core.secret.MasterKeyProvider;

// Kiem tra master key da duoc cau hinh chua
boolean configured = MasterKeyProvider.isConfigured();

// Giai ma voi master key tu ENV
String plainText = SecretDecryptor.decrypt(encryptedBase64String);

// Giai ma voi master key tu cung cap
String plainText2 = SecretDecryptor.decrypt(encryptedBase64String, "myMasterKey");

// Giai ma neu la ciphertext, tra ve nguyen ban neu khong phai
String value = SecretDecryptor.decryptIfEncrypted(someValue);

// Kiem tra mot gia tri co phai ciphertext hay khong
boolean encrypted = SecretDecryptor.isEncrypted(someValue);

// Xac minh master key co dung khong
boolean valid = SecretDecryptor.verifyMasterKey(ciphertext, "candidateKey");
```

### Use-Case 5: Bao ve du lieu nhay cam trong log va report (SensitiveDataProtection)
- **Mo ta:** Tu dong phat hien va che (mask) cac gia tri nhay cam (password, token, credit card, CMND...) trong log va Allure report. Phat hien dua tren ten cua ObjectUI, description, hoac locator value.
- **Code mau:**
```java
import com.vtnet.netat.core.secret.SensitiveDataProtection;
import com.vtnet.netat.core.ui.ObjectUI;

SensitiveDataProtection protection = SensitiveDataProtection.getInstance();

// Kiem tra ObjectUI co nhay cam khong (dua tren ten, description, locator)
boolean sensitive = protection.isSensitive(myPasswordField);

// Che gia tri neu ObjectUI nhay cam
String displayValue = protection.maskIfSensitive(myPasswordField, "mySecretPass123");
// -> "*****" neu ten field chua "password", nguoc lai tra ve "mySecretPass123"

// Che truc tiep mot gia tri
String masked = protection.mask("anyValue"); // -> "*****"

// Them keyword nhan dien nhay cam tuy chinh
protection.addKeyword("mapin", "sothe", "the_ngan_hang");

// Danh dau thu cong mot object la nhay cam
protection.markAsSensitive("LoginPage/txtSecretCode");

// Che tat ca gia tri nhay cam da biet trong mot chuoi text (dung cho log)
String safeLog = protection.maskAllKnownValues(rawLogText);

// Bat/tat tinh nang
protection.setEnabled(false);  // tat
protection.setEnabled(true);   // bat lai

// Reset cache
protection.clearValuesCache();
protection.reset(); // reset toan bo (ca object cache va values cache)
```

### Use-Case 6: Su dung SecureText de bao ve password trong log
- **Mo ta:** Boc gia tri nhay cam vao `SecureText`. Khi `toString()` duoc goi (vd: trong log), no chi hien thi `********`, nhung goi `getValue()` van tra ve gia tri that.
- **Code mau:**
```java
import com.vtnet.netat.core.utils.SecureText;

SecureText password = new SecureText("mySecretPassword");

// In ra log -> chi hien thi "********"
System.out.println("Password: " + password); // -> "Password: ********"

// Lay gia tri that khi can
String realValue = password.getValue(); // -> "mySecretPassword"
```

### Use-Case 7: Dinh nghia ObjectUI va Locator
- **Mo ta:** `ObjectUI` la mo hinh du lieu cho mot element UI, chua danh sach `Locator` voi nhieu strategy (XPATH, CSS_SELECTOR, ID, PLAYWRIGHT_SELECTOR, v.v.). Moi ObjectUI luu duoi dang file JSON rieng.
- **Code mau:**

**File JSON** (vd: `object/LoginPage/txtUsername.json`):
```json
{
    "uuid": "login-username-001",
    "name": "txtUsername",
    "type": "textbox",
    "description": "Username input field on login page",
    "locators": [
        {
            "strategy": "XPATH",
            "value": "//input[@id='username']",
            "active": true,
            "default": true
        },
        {
            "strategy": "CSS_SELECTOR",
            "value": "#username",
            "active": true,
            "default": false
        }
    ]
}
```

**Su dung trong Java:**
```java
import com.vtnet.netat.core.ui.ObjectUI;
import com.vtnet.netat.core.ui.Locator;
import java.util.List;
import java.util.Optional;

ObjectUI obj = ...; // duoc load tu JSON boi UiObjectHelper.getObject(...)

// Lay tat ca locator dang active
List<Locator> activeLocators = obj.getActiveLocators();

// Lay locator mac dinh
Optional<Locator> defaultLoc = obj.getDefaultLocator();
defaultLoc.ifPresent(loc -> {
    Locator.Strategy strategy = loc.getStrategy();  // vd: XPATH
    String value = loc.getValue();                    // vd: "//input[@id='username']"
});

// Chuyen ObjectUI thanh JSON
String json = obj.toJson();
```

**Cac Locator Strategy ho tro:**
`ID`, `NAME`, `XPATH`, `CSS_SELECTOR`, `CLASS_NAME`, `LINK_TEXT`, `PARTIAL_LINK_TEXT`, `TAG_NAME`, `ACCESSIBILITY_ID`, `ANDROID_UIAUTOMATOR`, `IOS_PREDICATE_STRING`, `IOS_CLASS_CHAIN`, `IMAGE`, `JQUERY`, `TEXT`, `ROLE`, `TEST_ID`, `PLAYWRIGHT_SELECTOR`

### Use-Case 8: Logging voi NetatLogger
- **Mo ta:** Logger wrapper cung cap cac method log co nghi thuc (keyword start/end, test case start/end, assertion, screenshot) va tu dong enrich MDC voi test context.
- **Code mau:**
```java
import com.vtnet.netat.core.logging.NetatLogger;

NetatLogger logger = NetatLogger.getInstance(MyClass.class);

// Log thong thuong
logger.info("Navigating to {}", url);
logger.debug("Element found: {}", element);
logger.warn("Timeout exceeded, retrying...");
logger.error("Failed to click element", exception);

// Log keyword lifecycle
logger.logKeywordStart("Click", "btnSubmit");
logger.logKeywordEnd("Click", true, 150);  // name, success, durationMs

// Log test case lifecycle
logger.logTestCaseStart("TC_LOGIN_001");
logger.logTestCaseEnd("TC_LOGIN_001", true, 5000);

// Log assertion
logger.logAssertion("Title equals 'Dashboard'", true);

// Log screenshot
logger.logScreenshot("/screenshots/fail_001.png");
```

**Dang ky LogContextProvider** (tu dong boi core-impl):
```java
import com.vtnet.netat.core.logging.LogContextProvider;

NetatLogger.setLogContextProvider(new LogContextProvider() {
    @Override public String getTestCase()  { return "TC_LOGIN_001"; }
    @Override public String getTestSuite() { return "LoginSuite"; }
    @Override public String getKeyword()   { return "Click"; }
});
```

### Use-Case 9: Soft Assertion voi SoftFailContext
- **Mo ta:** Cho phep ghi nhan nhieu loi trong mot keyword ma khong dung test ngay lap tuc. Loi duoc tich luy va xu ly sau (boi AllureBaseKeyword trong module netat-core).
- **Code mau:**
```java
import com.vtnet.netat.core.assertion.SoftFailContext;
import com.vtnet.netat.core.assertion.SoftStepFail;

// Danh dau loi (khong throw exception)
SoftFailContext.markFailed("Expected 'Dashboard' but got 'Login'");
SoftFailContext.markFailed("Button 'Save' is not visible");

// Kiem tra co loi khong va lay message (dong thoi reset)
boolean hasFail = SoftFailContext.consumeHasFail();
String allMessages = SoftFailContext.consumeMessages();

// Reset truoc moi keyword (duoc goi tu dong boi BaseKeyword)
SoftFailContext.reset();

// Throw SoftStepFail khi can
throw new SoftStepFail("Verification failed: expected value mismatch");
```

### Use-Case 10: Trich xuat Keyword Metadata
- **Mo ta:** Su dung `KeywordMetaExtractor` de kiem tra va lay metadata tu annotation tren method. Huu ich khi can reflection hoac build documentation tu dong.
- **Code mau:**
```java
import com.vtnet.netat.core.annotations.KeywordMetaExtractor;
import com.vtnet.netat.core.annotations.KeywordMeta;
import java.lang.reflect.Method;

Method method = MyKeywords.class.getMethod("login",
    ObjectUI.class, ObjectUI.class, ObjectUI.class, String.class, String.class);

// Kiem tra co phai keyword method khong
boolean isKeyword = KeywordMetaExtractor.isKeywordMethod(method);

// Lay metadata
KeywordMeta meta = KeywordMetaExtractor.extract(method);
String name = meta.getName();             // "Login with credentials"
String[] params = meta.getParameters();   // ["username: String - ...", ...]
String explainer = meta.getExplainer();   // "Login as {username}"
```

## 4. Cac Data Models (DTOs/POJOs) Thuong Dung

### 4.1 `ObjectUI` (`com.vtnet.netat.core.ui.ObjectUI`)
Mo hinh du lieu cho mot element UI.
| Field | Type | Mo ta |
|---|---|---|
| `uuid` | `String` | ID duy nhat |
| `name` | `String` | Ten element (vd: `txtUsername`) |
| `type` | `String` | Loai element (vd: `textbox`, `button`) |
| `description` | `String` | Mo ta |
| `locators` | `List<Locator>` | Danh sach cac locator |

**Method quan trong:**
- `List<Locator> getActiveLocators()` -- tra ve cac locator co `active=true`
- `Optional<Locator> getDefaultLocator()` -- tra ve locator co `default=true`
- `String toJson()` -- chuyen sang JSON string

### 4.2 `Locator` (`com.vtnet.netat.core.ui.Locator`)
Mo hinh cho mot locator cua element UI.
| Field | Type | Mo ta |
|---|---|---|
| `strategy` | `Locator.Strategy` (enum) | Chien luoc dinh vi (XPATH, CSS_SELECTOR, ID, PLAYWRIGHT_SELECTOR, v.v.) |
| `value` | `String` | Gia tri locator |
| `active` | `boolean` | Locator co dang hoat dong khong |
| `isDefault` | `boolean` | Co phai locator mac dinh khong (JSON key: `"default"`) |

**Method:** `toJson()`, `Locator.fromJson(String json)`

### 4.3 `DataSource` (`com.vtnet.netat.core.data.DataSource`)
Cau hinh nguon du lieu test.
| Field | Type | Mac dinh | Mo ta |
|---|---|---|---|
| `name` | `String` | | Ten nguon du lieu |
| `driver` | `String` | | `"ExcelFile"` hoac `"CSVFile"` |
| `filePath` | `String` | | Duong dan toi file du lieu |
| `sheetName` | `String` | | Ten sheet (chi cho Excel) |
| `csvSeparator` | `String` | | Ky tu phan cach (chi cho CSV) |
| `containsHeaders` | `boolean` | `true` | File co dong header hay khong |

**Method:** `static DataSource fromJson(String json)`

### 4.4 `StepResult` (`com.vtnet.netat.core.reporting.StepResult`)
Ket qua thuc thi cua mot keyword/step, dung cho reporting.
| Field | Type | Mo ta |
|---|---|---|
| `keywordName` | `String` | Ten keyword |
| `description` | `String` | Mo ta |
| `parameters` | `String` | Cac tham so |
| `status` | `StepResult.Status` | `PASSED`, `FAILED`, `SKIPPED`, `WARNING`, `INFO` |
| `result` | `Object` | Ket qua tra ve |
| `startTime` | `LocalDateTime` | Thoi diem bat dau |
| `endTime` | `LocalDateTime` | Thoi diem ket thuc |
| `durationMs` | `long` | Thoi gian thuc thi (ms) |
| `error` | `Exception` | Loi (neu co) |
| `errorMessage` | `String` | Thong bao loi |
| `stackTrace` | `String` | Stack trace |
| `screenshotPath` | `String` | Duong dan screenshot |
| `videoPath` | `String` | Duong dan video |
| `attachments` | `List<String>` | Danh sach file dinh kem |
| `category` | `String` | Phan loai |
| `stepNumber` | `int` | So thu tu step |
| `testCaseName` | `String` | Ten test case |
| `testSuiteName` | `String` | Ten test suite |

**Method quan trong:** `getDurationFormatted()`, `isPassed()`, `isFailed()`, `isSkipped()`

### 4.5 `KeywordMeta` (`com.vtnet.netat.core.annotations.KeywordMeta`)
POJO chua metadata duoc trich xuat tu annotation.
| Field | Type | Mo ta |
|---|---|---|
| `name` | `String` | Ten keyword |
| `parameters` | `String[]` | Mo ta tham so |
| `explainer` | `String` | Template ten hien thi dong |

### 4.6 `SecureText` (`com.vtnet.netat.core.utils.SecureText`)
Bao boc gia tri nhay cam, `toString()` tra ve `"********"`.
| Field | Type | Mo ta |
|---|---|---|
| `value` | `String` (private) | Gia tri that, lay qua `getValue()` |

### 4.7 `StepFailException` (`com.vtnet.netat.core.exceptions.StepFailException`)
Exception khi mot keyword/step that bai.
| Field | Type | Mo ta |
|---|---|---|
| `keywordName` | `String` | Ten keyword bi loi |
| `screenshotPath` | `String` | Duong dan screenshot |

### 4.8 `SoftStepFail` (`com.vtnet.netat.core.assertion.SoftStepFail`)
Exception cho soft assertion (loi khong dung test ngay).

## 5. Cam nang Troubleshooting & Directives

### 5.1 Loi thuong gap

| Loi | Nguyen nhan | Cach xu ly |
|---|---|---|
| `MasterKeyNotFoundException` | Chua set bien moi truong `NETAT!!_MASTER@@_KEY##` | Set env var: `export NETAT!!_MASTER@@_KEY##=your_key` |
| `SecretDecryptionException` | Master key sai hoac ciphertext bi hong | Kiem tra lai master key va dam bao ciphertext la Base64 hop le |
| `IllegalArgumentException: Method not annotated` | Method khong co `@NetatKeyword` hoac `@CustomKeyword` | Them annotation cho method |
| `RuntimeException: Unable to read Excel file` | File khong ton tai hoac format sai | Kiem tra duong dan va dam bao file la .xlsx hop le |
| `RuntimeException: Sheet not found` | Ten sheet khong dung | Kiem tra ten sheet trong file Excel |
| `Unsupported driver` | Gia tri `driver` trong JSON khong phai `ExcelFile` hoac `CSVFile` | Chi su dung `"ExcelFile"` hoac `"CSVFile"` |

### 5.2 Luu y quan trong

1. **Method keyword phai la `public`**: Framework su dung reflection de scan method. Neu method la `private` hoac `protected`, no se khong duoc nhan dien.

2. **Goi `execute()` ben trong method keyword**: Moi method duoc danh dau `@NetatKeyword` hoac `@CustomKeyword` can goi `execute(() -> { ... }, params)` de duoc tu dong log, report, va xu ly loi.

3. **Thu tu uu tien cau hinh**: System Properties (`-D`) > Registered config provider > `config/default.properties`.

4. **Gia tri ma hoa**: Trong file properties, boc gia tri bang `ENC(...)`. `ConfigurationManager` se tu dong giai ma khi master key da duoc cau hinh.

5. **SensitiveDataProtection la singleton**: Luon goi `SensitiveDataProtection.getInstance()`, khong `new`.

6. **NetatLogger la cached**: `NetatLogger.getInstance(MyClass.class)` tra ve cung instance cho cung class name. Khong can luu tru rieng.

7. **SoftFailContext su dung ThreadLocal**: An toan khi chay parallel test. Moi thread co context rieng.

8. **DataReaderFactory hien tai bi comment out**: Su dung truc tiep `ExcelDataReader` hoac `CsvDataReader`, hoac thong qua `DataFileHelper.getTestData()`.

9. **Locator.Strategy bao gom ca mobile va Playwright**: Module nay ho tro da nen tang -- cac strategy nhu `ANDROID_UIAUTOMATOR`, `IOS_PREDICATE_STRING`, `PLAYWRIGHT_SELECTOR` deu san sang su dung. Viec chuyen doi sang `By` cua Selenium do module `netat-core` (LocatorConverter) xu ly.

10. **ObjectUI la POJO thuan tuy**: Khong chua logic tuong tac UI. Viec tuong tac (click, sendKeys...) do cac keyword class trong module con xu ly.
