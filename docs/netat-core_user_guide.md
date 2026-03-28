# Cam Nang Su Dung Module: netat-core

## 1. Module nay dung de lam gi?
- **Muc dich:** `netat-core` la module trung tam cua framework NetAT, cung cap implementation day du cho viec tuong tac voi UI (Web va Mobile) thong qua Selenium/Appium, kiem tra ket qua bang assertion (hard va soft), quan ly phien lam viec (session/driver), va tich hop bao cao Allure tu dong (screenshot, HTML snapshot, step reporting). Day la tang "nang" (heavy) chua tat ca logic thuc thi keyword, trong khi `netat-core-api` chi chua interface nhe.

## 2. Cach Tich Hop (Setup)
- **Maven Dependency:**
```xml
<dependency>
    <groupId>com.vtnet.netat</groupId>
    <artifactId>netat-core</artifactId>
    <version>2.0.0</version>
</dependency>
```

> **Luu y:** Module nay tu dong keo theo cac dependency: `netat-core-api`, `netat-driver`, `selenium-java`, `java-client` (Appium), `allure-testng`, `testng`, va `reflections`. Ban khong can khai bao rieng chung.

## 3. Cac Use-Case Chinh & Code Mau

---

### Use-Case 1: Khoi tao trinh duyet Web (DriverKeyword)
- **Mo ta:** Mo trinh duyet mac dinh (doc tu file config) hoac chi dinh cu the (chrome, firefox, edge, safari). Ket thuc phien bang `closeSession()`.
- **Class:** `com.vtnet.netat.core.keywords.DriverKeyword`
- **Code mau:**
```java
DriverKeyword driverKeyword = new DriverKeyword();

// Mo trinh duyet mac dinh (doc tu config)
driverKeyword.startBrowser();

// Mo trinh duyet cu the
driverKeyword.startBrowser("firefox");

// Dong phien hien tai
driverKeyword.closeSession();
```

---

### Use-Case 2: Khoi dong ung dung Mobile (DriverKeyword)
- **Mo ta:** Ho tro 3 cach khoi dong mobile: tu file APK/IPA, tu package da cai san, hoac tu config profile. Platform chi nhan "android" hoac "ios".
- **Code mau:**
```java
DriverKeyword driverKeyword = new DriverKeyword();

// Cach 1: Tu file APK
driverKeyword.startApplicationByPath("android", "C:/builds/app-debug.apk");

// Cach 2: Tu package da cai san
driverKeyword.startApplicationByPackage("android", "com.android.settings", ".Settings");

// Cach 3: Tu config profile mac dinh
driverKeyword.startApplication("android");
```

---

### Use-Case 3: Quan ly nhieu phien lam viec (Multi-Session)
- **Mo ta:** Tao nhieu session dong thoi (vi du: 2 user tren 2 trinh duyet), chuyen qua lai giua chung bang `switchSession()`. Cuoi cung goi `stopAllSessions()` de don dep.
- **Code mau:**
```java
DriverKeyword driver = new DriverKeyword();

// Tao 2 phien web
driver.startSession("user_A", "chrome");
driver.startSession("user_B", "firefox");

// Thao tac tren User A
driver.switchSession("user_A");
// ... thuc hien cac keyword UI ...

// Chuyen sang User B
driver.switchSession("user_B");
// ... kiem tra ket qua ...

// Don dep tat ca
driver.stopAllSessions();
```

---

### Use-Case 4: Tao phien Mobile nang cao voi JSON Capabilities (startMobileSession)
- **Mo ta:** Truyen `sessionName`, `platform`, `udid`, `appiumUrl`, va `capsJson` (JSON string chua capabilities). Ho tro `appium:settings`, Device Farm (`df:*`), va UDID tu dong (`auto` hoac `${ENV_VAR}`).
- **Code mau:**
```java
DriverKeyword driver = new DriverKeyword();

// Local Appium voi app path va Appium settings
driver.startMobileSession(
    "session1", "android", "emulator-5554",
    "http://127.0.0.1:4723/",
    "{\"appium:app\":\"/path/app.apk\",\"appium:settings\":{\"waitForIdleTimeout\":0}}"
);

// Device Farm (UDID = auto)
driver.startMobileSession(
    "df_session", "android", "auto",
    "https://df.company.com/wd/hub",
    "{\"df:app\":\"app-123\",\"df:tags\":[\"smoke\"],\"df:recordVideo\":true}"
);

// Phien mobile don gian (khong co caps bo sung)
driver.startMobileSession("session2", "ios", "UDID-12345", "http://127.0.0.1:4723/");
```

---

### Use-Case 5: Hard Assertion - Kiem tra gia tri dung lai ngay khi sai (AssertionKeyword)
- **Mo ta:** Cac phuong thuc assert se DUNG test case ngay lap tuc khi dieu kien khong thoa man. Ho tro so sanh bang, khong bang, chua, lon hon, nho hon, true/false.
- **Class:** `com.vtnet.netat.core.keywords.AssertionKeyword`
- **Code mau:**
```java
AssertionKeyword assertion = new AssertionKeyword();

// So sanh 2 gia tri (tu dong chuyen sang String)
assertion.assertEquals(actualTitle, "Trang chu");
assertion.assertEquals(actualTitle, "Trang chu", "Tieu de trang khong dung");

// Kiem tra khong bang
assertion.assertNotEquals(currentStatus, "error", "Trang thai khong duoc la loi");

// Kiem tra chua chuoi con (phan biet hoa thuong)
assertion.assertContains(pageContent, "Dashboard");
assertion.assertNotContains(successMsg, "failed");

// Kiem tra boolean
assertion.assertTrue(isLoggedIn, "Nguoi dung phai da dang nhap");
assertion.assertFalse(hasError, "Khong duoc co loi");

// So sanh so (tu dong parse so tu String)
assertion.assertGreaterThan(totalAmount, 0);
assertion.assertGreaterThanOrEqual(score, 60, "Diem phai tu 60 tro len");
assertion.assertLessThan(responseTime, 3000);
assertion.assertLessThanOrEqual(attempts, 3);
```

---

### Use-Case 6: Soft Assertion - Ghi nhan loi nhung van tiep tuc chay (AssertionKeyword)
- **Mo ta:** Cac phuong thuc `softAssert*` ghi nhan loi nhung KHONG dung test. BAT BUOC phai goi `assertAll()` o cuoi de tong hop ket qua.
- **Code mau:**
```java
AssertionKeyword assertion = new AssertionKeyword();

// Kiem tra nhieu dieu kien, test van chay tiep
assertion.softAssertEquals(pageTitle, "Trang chu", "Tieu de trang khong dung");
assertion.softAssertTrue(isVisible, "Element phai hien thi");
assertion.softAssertContains(welcomeMsg, "Xin chao");
assertion.softAssertGreaterThan(productCount, 0, "Phai co it nhat 1 san pham");
assertion.softAssertNotEquals(userStatus, "INACTIVE");
assertion.softAssertFalse(isDisabled, "Nut khong duoc bi vo hieu hoa");
assertion.softAssertLessThanOrEqual(itemsInCart, 10);

// BAT BUOC: Tong hop ket qua cuoi test
assertion.assertAll();
// Hoac voi custom message:
assertion.assertAll("Kiem tra toan bo assertions cua test case dang nhap");
```

---

### Use-Case 7: Cac keyword tien ich (UtilityKeyword)
- **Mo ta:** Cung cap cac chuc nang xu ly ngay gio, chuoi, JSON, XML, tao du lieu ngau nhien, doc config, va ghi log.
- **Class:** `com.vtnet.netat.core.keywords.UtilityKeyword`
- **Code mau:**
```java
UtilityKeyword utility = new UtilityKeyword();

// --- Ngay gio ---
String now = utility.getCurrentDateTime("dd/MM/yyyy HH:mm:ss");
long timestamp = utility.getCurrentTimestamp();

// Cong/tru thoi gian: 7 ngay sau ke tu hom nay
String futureDate = utility.modifyDateTime("NOW", "", 7, "DAYS", "dd/MM/yyyy");
// 3 thang truoc ngay 15/09/2025
String pastDate = utility.modifyDateTime("15/09/2025", "dd/MM/yyyy", -3, "MONTHS", "dd/MM/yyyy");

// --- Chuoi & Du lieu ---
// Trich xuat bang regex
String orderCode = utility.extractTextByRegex("Ma don hang DH-12345", "DH-(\\d+)", 1);
// orderCode = "12345"

// Tao chuoi ngau nhien (ALPHABETIC, NUMERIC, ALPHANUMERIC)
String randomStr = utility.generateRandomString(10, "ALPHANUMERIC");

// Tao so ngau nhien trong khoang [18, 65]
int randomAge = utility.generateRandomIntegerNumber(18, 65);

// --- JSON & XML ---
String userName = utility.getValueFromJson(
    "{\"data\":{\"user\":{\"name\":\"John\"}}}", "/data/user/name");
// userName = "John"

String bookTitle = utility.getValueFromXml(
    "<books><book id='bk1'><title>Guide</title></book></books>",
    "//book[@id='bk1']/title/text()");

// --- He thong ---
utility.executeCommand("taskkill", "/F", "/IM", "chrome.exe");

// --- Config ---
String tenantId = utility.getProperty("tenant.id");

// --- Logging ---
utility.logMessage("Chuan bi thuc hien thanh toan...");
```

---

### Use-Case 8: Quan ly Execution Context (ExecutionContext)
- **Mo ta:** `ExecutionContext` la doi tuong ThreadLocal luu tru trang thai chay cua moi thread: driver hien tai, soft assert, test data, bien global, cau hinh moi truong, va ket qua cac step. Ho tro parallel testing.
- **Class:** `com.vtnet.netat.core.context.ExecutionContext`
- **Code mau:**
```java
ExecutionContext ctx = ExecutionContext.getInstance();

// Lay driver hien tai
WebDriver driver = ctx.getWebDriver();
AppiumDriver mobileDriver = ctx.getMobileDriver();

// Luu/doc du lieu chia se giua cac keyword trong 1 test
ctx.setTestData("orderId", "DH-12345");
String orderId = ctx.getTestData("orderId", String.class);

// Bien toan cuc (chia se trong 1 thread)
ctx.setGlobalVariable("baseUrl", "https://example.com");

// Cau hinh moi truong
ctx.setEnvironment("staging");
ctx.setBaseUrl("https://staging.example.com");

// Soft Assert
SoftAssert sa = ctx.getSoftAssert();
ctx.assertAllSoftAndReset(); // Tong hop va reset

// Timeout
ctx.setTimeout(60, TimeUnit.SECONDS);

// Ket qua step
long failedSteps = ctx.countFailedSteps();

// Don dep cuoi test
ExecutionContext.reset();
```

---

### Use-Case 9: Chuyen doi Locator sang Selenium By (LocatorConverter)
- **Mo ta:** Chuyen doi doi tuong `Locator` (tu core-api) sang `org.openqa.selenium.By`. Ho tro: ID, NAME, XPATH, CSS_SELECTOR, CLASS_NAME, LINK_TEXT, PARTIAL_LINK_TEXT, TAG_NAME, ACCESSIBILITY_ID, ANDROID_UIAUTOMATOR, IOS_PREDICATE_STRING, IOS_CLASS_CHAIN.
- **Class:** `com.vtnet.netat.core.ui.LocatorConverter`
- **Code mau:**
```java
import com.vtnet.netat.core.ui.LocatorConverter;
import com.vtnet.netat.core.ui.Locator;
import org.openqa.selenium.By;

Locator locator = new Locator(Locator.Strategy.XPATH, "//input[@id='username']");
By by = LocatorConverter.convertToBy(locator);
// Ket qua: By.xpath("//input[@id='username']")
```

## 4. Cac Data Models (DTOs/POJOs) Thuong Dung

### 4.1. ExecutionContext (Thread-local context)
| Field | Type | Mo ta |
|-------|------|-------|
| `currentTestCase` | `String` | Ten test case dang chay |
| `currentTestSuite` | `String` | Ten test suite dang chay |
| `currentKeyword` | `String` | Ten keyword dang thuc thi |
| `defaultTimeout` | `int` | Timeout mac dinh (giay), default = 30 |
| `timeoutUnit` | `TimeUnit` | Don vi thoi gian, default = SECONDS |
| `screenshotEnabled` | `boolean` | Bat/tat chup anh man hinh, default = true |
| `videoRecordingEnabled` | `boolean` | Bat/tat quay video, default = false |
| `testData` | `Map<String, Object>` | Du lieu chia se trong 1 test (thread-local) |
| `globalVariables` | `Map<String, Object>` | Bien toan cuc trong 1 thread |
| `stepResults` | `List<StepResult>` | Ket qua cac step da thuc thi |
| `environment` | `String` | Ten moi truong (default, staging, production...) |
| `baseUrl` | `String` | URL goc cua ung dung |
| `environmentConfig` | `Map<String, String>` | Cau hinh rieng cua moi truong |
| `softAssert` | `SoftAssert` | Instance AllureSoftAssert, tu dong tao khi goi `getSoftAssert()` |

### 4.2. AllureSoftAssert (extends SoftAssert)
- Mo rong `TestNG SoftAssert` de tu dong danh dau `SoftFailContext` khi co assertion that bai, giup `AllureBaseKeyword` biet duoc step cha can report FAIL tren Allure.

### 4.3. ScreenshotBuffer.Entry (internal)
| Field | Type | Mo ta |
|-------|------|-------|
| `imageBytes` | `byte[]` | Bytes anh da nen |
| `mimeType` | `String` | "image/jpeg" hoac "image/png" |
| `extension` | `String` | ".jpg" hoac ".png" |
| `keywordName` | `String` | Ten keyword tuong ung |
| `timestamp` | `String` | Thoi diem chup (HH:mm:ss.SSS) |

## 5. Cam nang Troubleshooting & Directives

### 5.1. Loi thuong gap

| Loi | Nguyen nhan | Cach xu ly |
|-----|-------------|------------|
| `IllegalArgumentException: Platform 'android' is a mobile platform` | Goi `startBrowser("android")` thay vi `startApplication()` | Dung `startApplication("android")` hoac `startApplicationByPath()` cho mobile |
| `IllegalStateException: Session 'xxx' not found` | Goi `switchSession()` truoc khi `startSession()` | Dam bao `startSession()` duoc goi truoc |
| `NoSuchElementException: Cannot find element 'xxx'` | Element khong ton tai hoac locator sai | Kiem tra lai locator trong file ObjectUI JSON. Tang timeout neu can |
| `StepFailException` | Keyword bi loi runtime (khong phai assertion) | Xem chi tiet trong Allure report (screenshot + HTML snapshot duoc dinh kem tu dong) |
| `NumberFormatException` trong `assertGreaterThan` | Gia tri truyen vao khong phai la so | Dam bao ca `actualValue` va `expectedValue` chuyen duoc sang so |

### 5.2. Cac config quan trong (dat trong default.properties hoac config.{env}.properties)

| Key | Default | Mo ta |
|-----|---------|-------|
| `element.timeout.primary` | 30 (giay) | Timeout chinh khi tim element |
| `element.timeout.secondary` | 15 (giay) | Timeout phu |
| `smart.wait.enabled` | true | Bat/tat smart wait (document ready + AJAX) |
| `smart.wait.document.ready.timeout` | 5 (giay) | Timeout cho DOM ready |
| `smart.wait.ajax.timeout` | 5 (giay) | Timeout cho jQuery AJAX hoan tat |
| `smart.wait.polling.interval` | 100 (ms) | Khoang thoi gian giua cac lan kiem tra |
| `screenshot.compress.enabled` | true | Nen screenshot tu PNG sang JPEG |
| `screenshot.jpeg.quality` | 0.75 | Chat luong JPEG (0.0 - 1.0) |
| `screenshot.history.enabled` | false | Bat buffer luu N screenshot gan nhat |
| `screenshot.history.size` | 3 | So buoc luu trong buffer (toi da 10) |
| `execution.type` | local | "local" hoac "remote" (Selenium Grid) |

### 5.3. Luu y quan trong

1. **Soft Assert bat buoc goi `assertAll()`:** Neu dung bat ky phuong thuc `softAssert*` nao, PHAI goi `assertAll()` o cuoi method `@Test`. Neu khong, cac loi se bi mat va test se bao PASS sai.

2. **Thread safety:** `ExecutionContext` su dung `ThreadLocal`, moi thread co instance rieng. Luon goi `ExecutionContext.reset()` trong `@AfterMethod` hoac `@AfterClass` de don dep.

3. **Smart Wait:** Mac dinh bat (`smart.wait.enabled=true`). Se tu dong cho document ready va AJAX complete truoc khi tim element. Chi ap dung cho Web, khong ap dung cho Mobile (AppiumDriver).

4. **Screenshot tu dong khi loi:** Khi keyword fail, framework tu dong chup screenshot (co highlight element loi bang vien do), luu HTML snapshot, va dinh kem len Allure report. Khong can goi thu cong.

5. **Click thong minh:** Method `click()` tu dong thu 3 chien luoc: Normal click -> Actions click -> JavaScript click. Neu element bi stale, se tu dong retry toi 3 lan. Cung tu dong cho animation ket thuc truoc khi click.

6. **Bao mat:** Method `sendKeysSensitive()` trong `BaseUiKeyword` ho tro nhap du lieu da ma hoa (encrypted). Gia tri se duoc decrypt tu `SecretDecryptor` va mask trong log (vi du: "S*****3").

7. **CoreImplInitializer:** Tu dong chay khi bat ky class keyword nao duoc load. Dang ky `ExecutionContextLogProvider` va `ConfigReader` lam provider. Khong can goi thu cong.

### 5.4. Cau truc ke thua cac class keyword

```
BaseKeyword (core-api, lightweight)
  └── AllureBaseKeyword (core, Allure step lifecycle + screenshot + soft-assert)
        ├── BaseUiKeyword (core, UI interactions: click, sendKeys, getText, findElement, assertions)
        │     └── [Cac keyword class trong module khac: WebKeyword, MobileKeyword, DesktopKeyword...]
        ├── DriverKeyword (core, session & driver management)
        ├── AssertionKeyword (core, hard assert & soft assert)
        └── UtilityKeyword (core, date/string/json/xml/command/config/logging)
```

> Khi tao keyword class moi, hay extend `AllureBaseKeyword` (neu khong can tuong tac UI) hoac `BaseUiKeyword` (neu can tuong tac voi UI elements).
