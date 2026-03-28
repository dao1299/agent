# Cam Nang Su Dung Module: netat-custom

## 1. Module nay dung de lam gi?
- **Muc dich:** `netat-custom` cung cap lop co so truu tuong `CustomKeyword` de nguoi dung tu dinh nghia cac keyword (method) tu dong hoa rieng. Lop nay tong hop tat ca cac module cua netAT (web, mobile, api, db, driver, assertion, utility) vao mot noi duy nhat, giup nguoi dung viet logic nghiep vu phuc tap ma chi can `extends CustomKeyword`.

## 2. Cach Tich Hop (Setup)
- **Maven Dependency:**

```xml
<dependency>
    <groupId>com.vtnet.netat</groupId>
    <artifactId>netat-custom</artifactId>
    <version>2.0.0</version>
</dependency>
```

Module nay tu dong keo theo tat ca cac dependency con:
- `netat-web` — Tuong tac Web UI (Selenium/Playwright)
- `netat-mobile` — Tuong tac Mobile (Appium)
- `netat-api` — Goi REST API
- `netat-db` — Truy van Database

## 3. Cac Use-Case Chinh & Code Mau

### Use-Case 1: Tao mot Custom Keyword co su dung Web UI
- **Mo ta:** Tao class ke thua `CustomKeyword`, su dung `web()` de tuong tac voi trinh duyet (click, setText, getText, openUrl). Method phai duoc boc trong `execute(() -> { ... }, params)` de tich hop Allure report.
- **Code mau:**

```java
import com.vtnet.netat.custom.CustomKeyword;

public class MyWebKeywords extends CustomKeyword {

    public void loginAndVerifyWelcome(String user, String pass) {
        execute(() -> {
            web().openUrl("https://example.com/login");
            web().setText(getObject("LoginPage/txtUsername"), user);
            web().setText(getObject("LoginPage/txtPassword"), pass);
            web().click(getObject("LoginPage/btnLogin"));

            String welcomeText = web().getText(getObject("HomePage/lblWelcome"));
            assertion().assertEquals(welcomeText, "Welcome " + user, "Kiem tra loi chao");
            return null;
        }, user, pass);
    }
}
```

### Use-Case 2: Tao Custom Keyword ket hop API va Database
- **Mo ta:** Goi API de tao du lieu, sau do kiem tra ket qua trong database. Su dung `api()` de goi REST endpoint va `db()` de truy van SQL.
- **Code mau:**

```java
import com.vtnet.netat.custom.CustomKeyword;

public class MyApiDbKeywords extends CustomKeyword {

    public void createUserAndVerifyInDb(String userName) {
        execute(() -> {
            // Goi API tao user
            api().setApiBaseUrl("https://api.example.com");
            api().setBearerToken("my-token");
            api().setRequestBody("{\"name\":\"" + userName + "\"}");
            api().post("/users");

            // Kiem tra record trong DB
            db().connectDatabase("local", "mysql", "localhost", 3306, "mydb", "root", "pass");
            db().verifyRecordExists("local",
                "SELECT 1 FROM users WHERE name = ?", userName);
            db().disconnectDatabase("local");

            return null;
        }, userName);
    }
}
```

### Use-Case 3: Tao Custom Keyword cho Mobile
- **Mo ta:** Su dung `mobile()` de tuong tac voi ung dung di dong (tap, sendText, swipe). Ket hop `getAppiumDriver()` khi can truy cap truc tiep AppiumDriver.
- **Code mau:**

```java
import com.vtnet.netat.custom.CustomKeyword;

public class MyMobileKeywords extends CustomKeyword {

    public void mobileLogin(String user, String pass) {
        execute(() -> {
            mobile().sendText(getObject("LoginPage/txtUser"), user);
            mobile().sendText(getObject("LoginPage/txtPass"), pass);
            mobile().tap(getObject("LoginPage/btnLogin"));
            mobile().swipeUp();
            mobile().hideKeyboard();
            return null;
        }, user, pass);
    }
}
```

### Use-Case 4: Su dung Utility va Driver truc tiep
- **Mo ta:** Su dung `utility()` cho cac thao tac tien ich (lay ngay gio, parse JSON, regex), `driver()` de quan ly browser, va `getDriver()` de truy cap WebDriver goc.
- **Code mau:**

```java
import com.vtnet.netat.custom.CustomKeyword;
import org.openqa.selenium.WebDriver;

public class MyUtilityKeywords extends CustomKeyword {

    public void setupAndCapture() {
        execute(() -> {
            // Doc config
            String timeout = getConfig("element.timeout.primary", "30");

            // Lay thoi gian hien tai
            String now = utility().getCurrentDateTime("yyyy-MM-dd HH:mm:ss");

            // Truy cap WebDriver goc
            if (isDriverReady()) {
                WebDriver wd = getDriver();
                wd.navigate().refresh();
                wd.manage().window().maximize();
            }

            return null;
        });
    }
}
```

## 4. Cac Data Models (DTOs/POJOs) Thuong Dung

Module `netat-custom` **khong dinh nghia DTO/POJO rieng**. Cac data model duoc su dung den tu cac module dependency:

| Class | Module goc | Mo ta |
|-------|-----------|-------|
| `ObjectUI` | `netat-core` (`com.vtnet.netat.core.ui.ObjectUI`) | Dai dien cho mot UI element (locator) |
| `WebDriver` | Selenium (`org.openqa.selenium.WebDriver`) | Interface driver trinh duyet |
| `AppiumDriver` | Appium (`io.appium.java_client.AppiumDriver`) | Driver cho mobile testing |

## 5. Cac Class & Method Cong Khai

### `CustomKeyword` (abstract class)
- **Package:** `com.vtnet.netat.custom`
- **Ke thua:** `AllureBaseKeyword` (tu `netat-core`)
- **Vai tro:** Lop co so duy nhat cho moi custom keyword do nguoi dung tao.

#### Module Accessors (protected)

| Method | Kieu tra ve | Mo ta |
|--------|------------|-------|
| `web()` | `WebKeyword` | Truy cap Web UI keywords: click, setText, getText, openUrl, ... |
| `mobile()` | `MobileKeyword` | Truy cap Mobile keywords: tap, sendText, swipe, hideKeyboard, ... |
| `api()` | `ApiKeyword` | Truy cap API keywords: get, post, put, delete, setApiBaseUrl, setBearerToken, ... |
| `db()` | `DatabaseKeyword` | Truy cap Database keywords: connectDatabase, executeQuery, verifyRecordExists, ... |
| `driver()` | `DriverKeyword` | Truy cap Driver keywords: startBrowser, stopBrowser, startApplication, ... |
| `assertion()` | `AssertionKeyword` | Truy cap Assertion keywords: assertEquals, assertNotEquals, assertAll, ... |
| `utility()` | `UtilityKeyword` | Truy cap Utility keywords: getCurrentDateTime, extractTextByRegex, getValueFromJson, ... |

#### Convenience Methods (protected)

| Method | Kieu tra ve | Mo ta |
|--------|------------|-------|
| `getDriver()` | `WebDriver` | Lay WebDriver hien tai. Throw `IllegalStateException` neu chua khoi tao. |
| `getAppiumDriver()` | `AppiumDriver` | Lay AppiumDriver hien tai (cast tu WebDriver). Throw `ClassCastException` neu driver khong phai Appium. |
| `isDriverReady()` | `boolean` | Kiem tra driver da duoc khoi tao chua. |
| `getConfig(String key)` | `String` | Doc gia tri config property. Tra ve `null` neu khong tim thay. |
| `getConfig(String key, String defaultValue)` | `String` | Doc gia tri config property voi gia tri mac dinh. |

> **Luu y:** Tat ca cac keyword instance (webKeyword, mobileKeyword, ...) deu duoc **lazy-initialized** — chi tao khi goi lan dau tien.

## 6. Cam Nang Troubleshooting & Directives

### Loi thuong gap

| Loi | Nguyen nhan | Cach xu ly |
|-----|------------|------------|
| `IllegalStateException: Driver chua duoc khoi tao` | Goi `getDriver()` hoac `web()` truoc khi khoi tao browser | Goi `driver().startBrowser("chrome")` truoc |
| `ClassCastException` khi goi `getAppiumDriver()` | Driver hien tai la WebDriver (khong phai Appium) | Chi goi `getAppiumDriver()` trong context mobile test |
| `NullPointerException` tu `getConfig()` | Property khong ton tai trong file config | Su dung `getConfig(key, defaultValue)` de tranh null |

### Directives quan trong

1. **Luon ke thua `CustomKeyword`** — Day la diem vao duy nhat. Khong ke thua truc tiep `AllureBaseKeyword` hay cac keyword class khac.
2. **Boc logic trong `execute()`** — De dam bao Allure report ghi nhan dung cac buoc va ket qua.
3. **Method phai la `public`** — De framework co the goi duoc keyword.
4. **Khong tao instance keyword bang tay** — Su dung cac accessor method (`web()`, `api()`, `db()`, ...) thay vi `new WebKeyword()` truc tiep.
5. **Goi `driver().startBrowser()` truoc khi thao tac web/mobile** — Cac keyword web/mobile can driver da duoc khoi tao.
6. **Goi `db().disconnectDatabase()` sau khi dung xong** — Tranh leak connection.
7. **Su dung `isDriverReady()` de kiem tra an toan** — Truoc khi goi `getDriver()` trong logic co dieu kien.
