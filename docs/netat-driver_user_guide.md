# Cam Nang Su Dung Module: netat-driver

## 1. Module nay dung de lam gi?
- **Muc dich:** Module `netat-driver` chiu trach nhiem khoi tao, quan ly va dong tat ca WebDriver (Selenium & Appium) cho cac nen tang web (Chrome, Firefox, Edge, Safari) va mobile (Android, iOS). No cung cap kha nang tu dong tai driver, cau hinh proxy, quan ly nhieu session dong thoi (ThreadLocal, Class-Based, Shared), va ho tro chay local hoac remote qua Selenium Grid.

## 2. Cach Tich Hop (Setup)

### Maven Dependency:
```xml
<dependency>
    <groupId>com.vtnet.netat</groupId>
    <artifactId>netat-driver</artifactId>
    <version>2.0.0</version>
</dependency>
```

### Cac dependency chinh cua module:
- `org.seleniumhq.selenium:selenium-java` - Selenium WebDriver
- `io.appium:java-client` - Appium client cho mobile testing
- `org.slf4j:slf4j-api` + `ch.qos.logback:logback-classic` - Logging

### File cau hinh (properties):
Tao file `config/default.properties` trong classpath (src/test/resources/) voi cac property can thiet. Co the override theo moi truong bang cach truyen `-Denv=<ten_moi_truong>` de load them file `config/config.<ten_moi_truong>.properties`.

**Cac property quan trong:**

| Property | Mo ta | Vi du |
|---|---|---|
| `platform.name` | Nen tang can chay test | `chrome`, `firefox`, `edge`, `safari`, `android`, `ios` |
| `execution.type` | Loai thuc thi | `local` (mac dinh) hoac `remote` |
| `grid.url` | URL cua Selenium Grid (khi `execution.type=remote`) | `http://localhost:4444` |
| `appium.server.url` | URL cua Appium server (cho mobile) | `http://127.0.0.1:4723/` |
| `proxy.host` | HTTP proxy host (moi truong noi bo) | `10.207.163.162` |
| `proxy.port` | HTTP proxy port | `3128` |
| `company` | Ten cong ty, dung de bat tinh nang auto-download driver | `ttcds` |
| `app.name` | Ten file ung dung mobile (.apk/.ipa) | `myapp.apk` |
| `webdriver.chrome.driver` | Duong dan thu cong toi chromedriver | `/path/to/chromedriver.exe` |
| `webdriver.edge.driver` | Duong dan thu cong toi msedgedriver | `/path/to/msedgedriver.exe` |
| `webdriver.gecko.driver` | Duong dan thu cong toi geckodriver | `/path/to/geckodriver.exe` |

**Cau hinh browser options qua properties:**

| Pattern | Mo ta | Vi du |
|---|---|---|
| `chrome.option.args` | Chrome arguments (phan cach bang `;`) | `--headless;--no-sandbox` |
| `chrome.option.binary` | Duong dan Chrome binary | `/usr/bin/google-chrome` |
| `chrome.option.excludeSwitches` | Loai bo switches | `enable-automation` |
| `chrome.option.extensions` | Duong dan file .crx (phan cach bang `;`) | `/path/ext1.crx;/path/ext2.crx` |
| `chrome.option.prefs.download.default_directory` | Chrome preferences | `./downloads` |
| `firefox.option.args` | Firefox arguments | `--headless` |
| `firefox.option.prefs.browser.download.dir` | Firefox preferences | `./downloads` |
| `edge.option.args` | Edge arguments | `--headless` |
| `edge.option.prefs.download.default_directory` | Edge preferences | `./downloads` |

**Cau hinh capabilities (W3C standard):**

| Pattern | Mo ta | Vi du |
|---|---|---|
| `capability.<vendor>.<key>` | Capability bat ky (dot dau tien -> colon) | `capability.appium.udid=DEVICE123` -> `appium:udid` |
| `capability.appium.appPackage` | Android app package | `com.example.myapp` |
| `capability.appium.appActivity` | Android app activity | `.MainActivity` |
| `capability.se.targetNodes` | Selenium Grid target nodes (ho tro list) | `[node-1,node-3]` |

## 3. Cac Use-Case Chinh & Code Mau

### Use-Case 1: Khoi tao WebDriver don gian (doc platform tu config)
- **Mo ta:** Goi `DriverManager.initDriver()` se doc `platform.name` tu file properties va tao driver tuong ung. Sau do dung `DriverManager.getDriver()` de lay WebDriver instance. Ket thuc test goi `DriverManager.quit()`.
- **Code mau:**
```java
import com.vtnet.netat.driver.DriverManager;
import org.openqa.selenium.WebDriver;

// Trong @BeforeMethod hoac @BeforeClass
DriverManager.initDriver();  // Doc platform.name tu config/default.properties

// Trong test method
WebDriver driver = DriverManager.getDriver();
driver.get("https://example.com");

// Trong @AfterMethod hoac @AfterClass
DriverManager.quit();
```

### Use-Case 2: Khoi tao WebDriver voi platform cu the va override capabilities
- **Mo ta:** Truyen vao `platform` (String) va `overrideCapabilities` (Map). Map nay se ghi de len cac capability da load tu properties. Tra ve WebDriver da san sang.
- **Code mau:**
```java
import com.vtnet.netat.driver.DriverManager;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> overrides = new HashMap<>();
overrides.put("appium.udid", "DEVICE_SERIAL_123");
overrides.put("appium.noReset", false);

DriverManager.initDriver("android", overrides);

// Lay driver va thao tac
WebDriver driver = DriverManager.getDriver();

// Kiem tra driver da khoi tao chua
boolean ready = DriverManager.isDriverInitialized(); // true

// Lay platform hien tai
String platform = DriverManager.getCurrentPlatform(); // "android"

// Dong driver
DriverManager.quit();
```

### Use-Case 3: Quan ly nhieu session (multi-session) voi SessionManager
- **Mo ta:** `SessionManager` cho phep quan ly nhieu WebDriver session cung luc tren cung mot thread. Co the add, switch, va stop tung session rieng le.
- **Code mau:**
```java
import com.vtnet.netat.driver.SessionManager;
import org.openqa.selenium.WebDriver;

SessionManager sm = SessionManager.getInstance();

// Them session thu 2
WebDriver secondDriver = /* tao driver khac */;
sm.addSession("admin-session", secondDriver);

// Chuyen sang session khac
sm.switchSession("admin-session");
WebDriver current = sm.getCurrentDriver(); // tra ve secondDriver

// Lay danh sach session
List<String> names = sm.getSessionNames(); // ["default", "admin-session"]

// Kiem tra session con song
boolean alive = sm.isSessionAlive("admin-session"); // true/false

// Lay ten session hien tai
String currentName = sm.getCurrentSessionName(); // "admin-session"

// Chuyen ve session mac dinh
sm.switchSession(SessionManager.DEFAULT_SESSION);

// Dong mot session cu the
sm.stopSession("admin-session");

// Dong tat ca session
sm.stopAllSessions();
```

### Use-Case 4: Su dung Class-Based Mode (chia se driver trong cung 1 test class)
- **Mo ta:** Khi cac test method trong cung 1 class can dung chung driver, su dung `setClassBasedMode()`. Tat ca thread chay method cua class do se truy cap cung WebDriver.
- **Code mau:**
```java
import com.vtnet.netat.driver.SessionManager;

SessionManager sm = SessionManager.getInstance();

// Trong @BeforeClass
sm.setClassBasedMode("com.example.LoginTest");
DriverManager.initDriver("chrome", null);

// Trong moi @Test method (co the chay tren thread khac)
sm.setClassBasedMode("com.example.LoginTest"); // set lai context
WebDriver driver = sm.getCurrentDriver(); // lay chung driver

// Trong @AfterClass
sm.stopAllSessionsForClass("com.example.LoginTest");
```

### Use-Case 5: Su dung Shared Mode (chia se driver giua nhieu class)
- **Mo ta:** Khi nhieu test class can dung chung 1 driver (vi du: suite-level setup), su dung `setSharedMode()` voi mot shared key chung.
- **Code mau:**
```java
import com.vtnet.netat.driver.SessionManager;

SessionManager sm = SessionManager.getInstance();

// Trong @BeforeSuite
sm.setSharedMode("suite-driver");
DriverManager.initDriver("chrome", null);

// Hoac truyen driver truc tiep
sm.setSharedMode("suite-driver", existingDriver);

// Trong bat ky test class nao
sm.setSharedMode("suite-driver");
WebDriver driver = sm.getCurrentDriver(); // lay driver chung

// Trong @AfterSuite
sm.stopAllSessionsForSharedKey("suite-driver");

// Hoac cleanup toan bo
sm.cleanupAll();
```

### Use-Case 6: Chay test tren Selenium Grid (Remote)
- **Mo ta:** Dat `execution.type=remote` va `grid.url` trong config. `DriverManager` se tu dong su dung `RemoteDriverFactory` de tao `RemoteWebDriver` ket noi toi Grid Hub.
- **Code mau:**
```properties
# Trong config/default.properties
platform.name=chrome
execution.type=remote
grid.url=http://selenium-hub:4444
```
```java
// Code khong doi so voi local
DriverManager.initDriver();
WebDriver driver = DriverManager.getDriver(); // RemoteWebDriver -> Grid
driver.get("https://example.com");
DriverManager.quit();
```

### Use-Case 7: Doc cau hinh voi ConfigReader
- **Mo ta:** `ConfigReader` doc properties tu `config/default.properties` (va file theo moi truong). Ho tro doc String, boolean, int, long. System properties (`-D`) luon duoc uu tien hon file.
- **Code mau:**
```java
import com.vtnet.netat.driver.ConfigReader;

// Load properties (tu dong goi khi can, nhung co the goi truoc)
ConfigReader.loadProperties();

// Doc gia tri
String platform = ConfigReader.getProperty("platform.name");
String gridUrl = ConfigReader.getProperty("grid.url", "http://localhost:4444"); // voi default value
boolean headless = ConfigReader.getBoolean("browser.headless", false);
int timeout = ConfigReader.getInt("implicit.wait", 10);
long longVal = ConfigReader.getLong("max.wait.ms", 30000L);

// Kiem tra property co ton tai
boolean has = ConfigReader.hasProperty("grid.url");

// Lay moi truong hien tai
String env = ConfigReader.getEnvironment(); // gia tri cua -Denv=xxx

// Reload cau hinh (khi can cap nhat)
ConfigReader.reload();

// Clear toan bo (dung trong cleanup)
ConfigReader.clear();
```

### Use-Case 8: Tu dong cap nhat ChromeDriver / EdgeDriver
- **Mo ta:** Khi `company=ttcds`, `LocalDriverFactory` tu dong goi `UpdateChromeHelper` hoac `UpdateEdgeHelper` de download driver phu hop voi phien ban browser dang cai. Co the goi truc tiep de quan ly driver thu cong.
- **Code mau:**
```java
import com.vtnet.netat.driver.UpdateChromeHelper;
import com.vtnet.netat.driver.UpdateEdgeHelper;

// Tu dong cap nhat Chrome driver
UpdateChromeHelper chromeHelper = new UpdateChromeHelper();
String chromeVersion = chromeHelper.updateAutomaticallyChromeDriver();
// Tra ve version string, vd: "120.0.6099.109"

// Xem version Chrome hien tai
String currentVersion = chromeHelper.getCurrentChromeDriverVersion();

// Xoa driver cu
chromeHelper.deleteOldChromeDriver();

// Tuong tu cho Edge
UpdateEdgeHelper edgeHelper = new UpdateEdgeHelper();
String edgeVersion = edgeHelper.updateAutomaticallyEdgeDriver();
String currentEdge = edgeHelper.getCurrentEdgeVersion();
edgeHelper.deleteOldEdgeDriver();
```

### Use-Case 9: Tao Capabilities thu cong cho Mobile
- **Mo ta:** `CapabilityFactory` cung cap cac method tien ich de tao capabilities cho Android/iOS ma khong can khai bao day du trong properties file.
- **Code mau:**
```java
import com.vtnet.netat.driver.CapabilityFactory;
import org.openqa.selenium.MutableCapabilities;

// Tao capabilities cho Android
MutableCapabilities caps = CapabilityFactory.buildMobileCapabilities(
    "android",           // platformName
    "DEVICE_SERIAL_123", // udid (co the null)
    "UiAutomator2"       // automationName (co the null, se dung default)
);

// Them app path
CapabilityFactory.setAppPath(caps, "/path/to/myapp.apk");

// Hoac chi dinh app package + activity (Android)
CapabilityFactory.setAppPackage(caps, "com.example.myapp", ".MainActivity");

// Cho iOS: chi dinh bundle ID
CapabilityFactory.setBundleId(caps, "com.example.myapp");

// Tao capabilities tu config voi override
Map<String, Object> overrides = new HashMap<>();
overrides.put("appium.udid", "NEW_DEVICE");
MutableCapabilities finalCaps = CapabilityFactory.getCapabilities("android", overrides);
```

## 4. Cac Class Chinh & Method Signatures

### 4.1. `DriverManager` (final class)
Lop trung tam de khoi tao va quan ly WebDriver. Tat ca method deu la `static`.

| Method | Mo ta |
|---|---|
| `static void initDriver()` | Khoi tao driver tu `platform.name` trong config |
| `static void initDriver(String platform, Map<String, Object> overrideCapabilities)` | Khoi tao driver voi platform va capabilities tuy chinh |
| `static WebDriver getDriver()` | Lay WebDriver hien tai cua thread |
| `static boolean isDriverInitialized()` | Kiem tra driver da duoc khoi tao chua |
| `static String getCurrentPlatform()` | Lay ten platform hien tai |
| `static void quit()` | Dong tat ca driver session cua thread hien tai |
| `static void quitDriver()` | **(Deprecated)** Tuong tu `quit()` |

### 4.2. `SessionManager` (final class, Singleton)
Quan ly nhieu WebDriver session voi 3 mode: THREAD_LOCAL, CLASS_BASED, SHARED.

| Method | Mo ta |
|---|---|
| `static SessionManager getInstance()` | Lay singleton instance |
| `void setThreadLocalMode()` | Chuyen sang mode ThreadLocal (mac dinh) |
| `void setClassBasedMode(String className)` | Chuyen sang mode Class-Based |
| `void setSharedMode(String sharedKey)` | Chuyen sang mode Shared |
| `void setSharedMode(String sharedKey, WebDriver driver)` | Chuyen sang mode Shared va dang ky driver |
| `String getExecutionMode()` | Lay mode hien tai |
| `String getCurrentContextKey()` | Lay context key hien tai |
| `boolean isThreadLocalMode()` | Kiem tra co phai mode ThreadLocal |
| `boolean isClassBasedMode()` | Kiem tra co phai mode Class-Based |
| `boolean isSharedMode()` | Kiem tra co phai mode Shared |
| `void addSession(String sessionName, WebDriver driver)` | Them session moi |
| `WebDriver getCurrentDriver()` | Lay driver cua session hien tai |
| `WebDriver getSession(String sessionName)` | Lay driver theo ten session |
| `void switchSession(String sessionName)` | Chuyen sang session khac |
| `List<String> getSessionNames()` | Lay danh sach ten cac session |
| `Map<String, WebDriver> getAllSessions()` | Lay tat ca session |
| `String getCurrentSessionName()` | Lay ten session hien tai |
| `boolean isSessionAlive(String sessionName)` | Kiem tra session con song khong |
| `void removeDeadSession(String sessionName)` | Xoa session da chet |
| `void stopSession(String sessionName)` | Dong 1 session (quit driver + xoa) |
| `void stopAllSessions()` | Dong tat ca session trong context hien tai |
| `void stopAllSessionsForClass(String className)` | Dong tat ca session cua 1 class |
| `void stopAllSessionsForSharedKey(String sharedKey)` | Dong tat ca session cua 1 shared key |
| `void cleanupThread()` | Cleanup toan bo ThreadLocal data |
| `void cleanupAll()` | Cleanup tat ca (ThreadLocal + Class-Based + Shared) |
| `void printCurrentState()` | In trang thai hien tai ra log |
| `String getDebugInfo()` | Lay debug info dang String |

**Hang so:**
- `SessionManager.DEFAULT_SESSION = "default"` - Ten session mac dinh
- `SessionManager.MODE_THREAD_LOCAL = "THREAD_LOCAL"`
- `SessionManager.MODE_CLASS_BASED = "CLASS_BASED"`
- `SessionManager.MODE_SHARED = "SHARED"`

### 4.3. `ConfigReader` (final class)
Doc va quan ly cau hinh tu properties file. Tat ca method deu la `static`.

| Method | Mo ta |
|---|---|
| `static void loadProperties()` | Load properties (thread-safe, chi load 1 lan) |
| `static String getProperty(String key)` | Doc gia tri (uu tien System property) |
| `static String getProperty(String key, String defaultValue)` | Doc gia tri voi default |
| `static boolean getBoolean(String key, boolean defaultValue)` | Doc boolean |
| `static int getInt(String key, int defaultValue)` | Doc int |
| `static long getLong(String key, long defaultValue)` | Doc long |
| `static Properties getProperties()` | Lay ban sao tat ca properties |
| `static String getEnvironment()` | Lay ten moi truong hien tai |
| `static boolean hasProperty(String key)` | Kiem tra property ton tai |
| `static void reload()` | Reload lai toan bo properties |
| `static void clear()` | Xoa toan bo properties |

**Thu tu uu tien config:**
1. System properties (`-Dkey=value`) - cao nhat
2. File `config/config.<env>.properties` (neu co `-Denv=<env>`)
3. File `config/default.properties` - thap nhat

### 4.4. `CapabilityFactory` (class)
Tao `MutableCapabilities` cho moi platform tu config properties.

| Method | Mo ta |
|---|---|
| `static MutableCapabilities getCapabilities(String platform)` | Tao capabilities tu config |
| `static MutableCapabilities getCapabilities(String platform, Map<String, Object> overrideCapabilities)` | Tao capabilities voi override |
| `static MutableCapabilities buildMobileCapabilities(String platformName, String udid, String automationName)` | Tao capabilities mobile thu cong |
| `static void setAppPath(MutableCapabilities caps, String appPath)` | Dat duong dan app vao capabilities |
| `static void setAppPackage(MutableCapabilities caps, String appPackage, String appActivity)` | Dat app package + activity (Android) |
| `static void setBundleId(MutableCapabilities caps, String bundleId)` | Dat bundle ID (iOS) |

**Default mobile capabilities (tu dong ap dung cho Android/iOS):**
- `appium:noReset = true`
- `appium:autoGrantPermissions = true`
- `appium:newCommandTimeout = 300`
- `df:recordVideo = true`
- `df:liveVideo = true`

### 4.5. `IDriverFactory` (interface)
Interface chung cho tat ca driver factory.

```java
public interface IDriverFactory {
    WebDriver createDriver(String platform, MutableCapabilities capabilities);
}
```

### 4.6. `BaseDriverFactory` (abstract class)
Lop co so cho cac web driver factory, cung cap:
- `setupProxy()` - Cau hinh JVM proxy tu config
- `getDriverPath(String driverPropertyKey)` - Tim duong dan driver tu config

### 4.7. `LocalDriverFactory` (class extends BaseDriverFactory)
Tao driver chay tren may local. Ho tro auto-download driver khi `company=ttcds`.

### 4.8. `RemoteDriverFactory` (class extends BaseDriverFactory)
Tao `RemoteWebDriver` ket noi toi Selenium Grid qua `grid.url`.

### 4.9. `MobileDriverFactory` (class implements IDriverFactory)
Tao AndroidDriver/IOSDriver ket noi toi Appium server. Co:
- Health check Appium server truoc khi tao driver
- Retry logic (mac dinh 3 lan, delay 2s)
- Validation dau vao chi tiet

| Property cau hinh | Mo ta | Default |
|---|---|---|
| `appium.server.url` | URL Appium server | `http://127.0.0.1:4723/` |
| `appium.connection.retries` | So lan retry | 3 |
| `appium.connection.retry.delay.ms` | Delay giua cac lan retry (ms) | 2000 |
| `appium.healthcheck.timeout.ms` | Timeout health check (ms) | 5000 |

### 4.10. `UpdateChromeHelper` (class)
Tu dong download ChromeDriver phu hop voi version Chrome dang cai.

| Method | Mo ta |
|---|---|
| `String getCurrentChromeDriverVersion()` | Lay version Chrome hien tai (Windows) |
| `String updateAutomaticallyChromeDriver()` | Tu dong download va giai nen ChromeDriver |
| `void deleteOldChromeDriver()` | Xoa cac version ChromeDriver cu |

### 4.11. `UpdateEdgeHelper` (class)
Tu dong download EdgeDriver phu hop voi version Edge dang cai.

| Method | Mo ta |
|---|---|
| `String getCurrentEdgeVersion()` | Lay version Edge hien tai (Windows) |
| `String updateAutomaticallyEdgeDriver()` | Tu dong download va giai nen EdgeDriver |
| `void deleteOldEdgeDriver()` | Xoa cac version EdgeDriver cu |

## 5. Cam nang Troubleshooting & Directives

### Loi thuong gap:

**1. `IllegalArgumentException: Property 'platform.name' is not defined`**
- Nguyen nhan: Chua cau hinh `platform.name` trong properties file.
- Cach xu ly: Them `platform.name=chrome` vao `config/default.properties` hoac truyen `-Dplatform.name=chrome` khi chay.

**2. `Platform not supported: xxx. Supported platforms: chrome, firefox, edge, safari, android, ios`**
- Nguyen nhan: Gia tri `platform.name` khong hop le.
- Cach xu ly: Chi su dung 1 trong 6 gia tri: `chrome`, `firefox`, `edge`, `safari`, `android`, `ios`.

**3. `Cannot connect to Appium server at 'http://...'`**
- Nguyen nhan: Appium server chua khoi dong hoac URL sai.
- Cach xu ly: Kiem tra Appium server da chay, URL dung, firewall khong chan.

**4. `Failed to create driver after 3 attempts`**
- Nguyen nhan: Khong ket noi duoc toi thiet bi mobile.
- Cach xu ly: Kiem tra thiet bi da ket noi (`adb devices` cho Android, `xcrun xctrace list devices` cho iOS), capabilities dung, file .apk/.ipa ton tai.

**5. `The Grid URL is invalid`**
- Nguyen nhan: `grid.url` trong config khong phai URL hop le.
- Cach xu ly: Kiem tra format URL, vi du `http://selenium-hub:4444`.

**6. Driver khong tu dong download**
- Nguyen nhan: Tinh nang auto-download chi hoat dong khi `company=ttcds` va `execution.type=local`.
- Cach xu ly: Neu khong thuoc truong hop tren, Selenium Manager se tu dong download. Dam bao co ket noi internet va proxy dung.

### Luu y quan trong:

- **Thread-safety:** `DriverManager` va `SessionManager` su dung `ThreadLocal` nen an toan khi chay parallel voi TestNG. Moi thread co driver rieng.
- **Cleanup:** Luon goi `DriverManager.quit()` hoac `SessionManager.cleanupAll()` trong `@AfterMethod`/`@AfterClass`/`@AfterSuite` de tranh leak driver process.
- **Proxy:** Neu o moi truong mang noi bo, cau hinh `proxy.host` va `proxy.port` de driver download va Grid connection hoat dong dung.
- **W3C Capability Convention:** Khi khai bao capability trong properties, su dung dot (`.`) thay cho colon (`:`). Vi du: `capability.appium.udid` se tu dong chuyen thanh `appium:udid`.
- **System property override:** Moi property trong config deu co the bi override boi `-D` flag. Vi du: `-Dplatform.name=firefox` se ghi de gia tri trong file.
- **Session timeout:** Khi quit driver, `SessionManager` dat timeout 10 giay. Neu driver khong phan hoi, se force close qua Grid API (cho `RemoteWebDriver`).
