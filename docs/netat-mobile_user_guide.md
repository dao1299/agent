# Cam Nang Su Dung Module: netat-mobile

## 1. Module nay dung de lam gi?
- **Muc dich:** `netat-mobile` cung cap bo keyword (method) toan dien de tu dong hoa kiem thu ung dung di dong (Android va iOS) tren nen tang Appium. Module bao gom cac thao tac: quan ly vong doi app, tuong tac element, cu chi (gesture), dong bo hoa (wait), assertion, quan ly thiet bi, file, notification, va cac tinh nang nang cao nhu biometric authentication, performance monitoring.

## 2. Cach Tich Hop (Setup)
- **Maven Dependency:**
```xml
<dependency>
    <groupId>com.vtnet.netat</groupId>
    <artifactId>netat-mobile</artifactId>
    <version>2.0.0</version>
</dependency>
```

Module nay phu thuoc vao:
- `netat-driver` - Quan ly Appium driver
- `netat-core` - Base keyword, annotations, ObjectUI
- `netat-web` - Chia se logic UI chung
- `io.appium:java-client` - Appium Java client
- `org.seleniumhq.selenium:selenium-api`
- `org.testng:testng`

## 3. Cac Use-Case Chinh & Code Mau

### Use-Case 1: Quan Ly Vong Doi Ung Dung (App Lifecycle)
- **Mo ta:** Cai dat, go bo, khoi dong, dung, reset ung dung. Truyen vao appPath hoac appId (package name Android / bundle ID iOS).

**Code mau:**
```java
MobileKeyword mobileKeyword = new MobileKeyword();

// Cai dat app
mobileKeyword.installApp("C:/apps/my-app.apk");

// Kiem tra app da cai dat chua
boolean installed = mobileKeyword.isAppInstalled("com.example.myapp");

// Khoi dong app tu dau (fresh launch)
mobileKeyword.launchApp();

// Dua app ve background 5 giay
mobileKeyword.backgroundApp(5);

// Kich hoat lai app
mobileKeyword.activateApp("com.example.myapp");

// Kiem tra trang thai app (0=NOT_INSTALLED, 1=NOT_RUNNING, 2-3=BACKGROUND, 4=FOREGROUND)
int state = mobileKeyword.queryAppState("com.example.myapp");

// Lay thong tin app
String currentApp = mobileKeyword.getCurrentAppPackage();
String version = mobileKeyword.getAppVersion();
String build = mobileKeyword.getAppBuildNumber();

// Dung app
mobileKeyword.terminateApp("com.example.myapp");

// Go cai dat hoan toan
mobileKeyword.removeApp("com.example.myapp");
```

### Use-Case 2: Tuong Tac Voi Element (Tap, Nhap Text, Xoa)
- **Mo ta:** Thao tac co ban voi cac element UI: tap (cham), nhap text, xoa text, nhan giu, an ban phim. Truyen vao ObjectUI (doi tuong dinh nghia locator) va du lieu tuong ung.

**Code mau:**
```java
// Tap vao element
mobileKeyword.tap(loginButtonObject);

// Double tap
mobileKeyword.doubleTap(imageView);

// Nhap text
mobileKeyword.sendText(usernameInput, "admin@example.com");
mobileKeyword.sendText(passwordInput, "SecurePassword123");

// Nhap du lieu nhay cam (da ma hoa) - tu dong giai ma va mask trong log
mobileKeyword.sendTextSensitive(passwordInput, "U2FsdGVkX1+abc123...");

// Xoa text
mobileKeyword.clear(searchInput);

// Nhan giu 2 giay
mobileKeyword.longPress(imageObject, 2);

// An ban phim ao
mobileKeyword.hideKeyboard();

// Nhan nut Back
mobileKeyword.pressBack();
```

### Use-Case 3: Cu Chi (Gesture) - Vuot, Cuon, Keo Tha
- **Mo ta:** Thuc hien cac cu chi: vuot (swipe), cuon (scroll), keo tha (drag & drop), pinch, zoom. Toa do tinh bang pixel tu goc tren trai (0,0).

**Code mau:**
```java
// Vuot co ban theo toa do
mobileKeyword.swipe(500, 100, 500, 1500, 300);

// Vuot nhanh theo huong (tu dong tinh toa do)
mobileKeyword.swipeUp();       // Cuon noi dung xuong
mobileKeyword.swipeDown();     // Cuon noi dung len
mobileKeyword.swipeLeft();     // Chuyen sang phai
mobileKeyword.swipeRight();    // Chuyen sang trai
mobileKeyword.swipeUp(1000);   // Vuot cham hon (1000ms)

// Cuon den khi thay text
WebElement element = mobileKeyword.scrollToText("Dang ky");
element.click();

// Cuon den element theo huong chi dinh
mobileKeyword.scrollToElement(submitButton, "down");

// Cuon nhanh ve dau/cuoi trang
mobileKeyword.scrollToTop();
mobileKeyword.scrollToBottom();

// Fling (vuot nhanh voi momentum)
mobileKeyword.fling("down", 7); // velocity 1-10

// Vuot tren element cu the
mobileKeyword.swipeOnElement(scrollView, "down", 500);

// Keo tha
mobileKeyword.dragAndDrop(sourceItem, trashBin);

// Tap va giu roi keo den toa do dich
mobileKeyword.tapAndHold(sliderThumb, 800, 500, 1);

// Tap theo toa do
mobileKeyword.tapByCoordinates(540, 960);

// Nhan giu theo toa do
mobileKeyword.longPressByCoordinates(450, 800, 2);

// Zoom in / Pinch (zoom out)
mobileKeyword.zoom(imageView, 2.5);    // scale 1.1-3.0
mobileKeyword.pinch(mapView, 0.3);     // scale 0.1-0.9
```

### Use-Case 4: Dong Bo Hoa (Wait) - Cho Element/Text San Sang
- **Mo ta:** Cho element hien thi, bien mat, co the tuong tac, hoac text khop truoc khi tiep tuc. Truyen vao ObjectUI va timeoutInSeconds.

**Code mau:**
```java
// Cho element hien thi
mobileKeyword.waitForVisible(loginButton, 5);

// Cho element bien mat
mobileKeyword.waitForNotVisible(loadingSpinner, 15);

// Cho element co the tap
mobileKeyword.waitForClickable(submitButton, 5);

// Cho text thay doi
mobileKeyword.waitForText(orderStatusLabel, "Da hoan thanh", 15);

// Cho element enabled/disabled
mobileKeyword.waitForEnabled(submitButton, 10);
mobileKeyword.waitForDisabled(inputField, 3);

// Cho so luong element dat yeu cau
mobileKeyword.waitForElementCount(listItems, 10, 15);

// Cho attribute dat gia tri
mobileKeyword.waitForAttributeValue(progressBar, "value", "100", 30);

// Cho app load hoan tat
mobileKeyword.waitForAppToLoad(15);

// Cho notification xuat hien
WebElement notif = mobileKeyword.waitForNotification("Ban co tin nhan moi", 15);

// Tam dung (chi dung khi that su can)
mobileKeyword.pause(3000); // 3 giay
```

### Use-Case 5: Assertion & Verification
- **Mo ta:** Kiem tra trang thai element, text, attribute, so luong. Assert (hard) se dung test khi fail, verify (soft) chi log warning.

**Code mau:**
```java
// Kiem tra element ton tai / hien thi
mobileKeyword.assertElementPresent(loginButton);
mobileKeyword.assertElementVisible(successMessage);
mobileKeyword.assertElementNotPresent(errorPopup, 3);
mobileKeyword.assertElementNotVisible(loadingSpinner);

// Kiem tra text
mobileKeyword.assertTextEquals(title, "Dang nhap");
mobileKeyword.assertTextContains(welcomeMessage, "Xin chao");
mobileKeyword.assertTextNotEquals(statusLabel, "Cu");
mobileKeyword.assertTextWithOptions(emailField, "User@Example.com", true, true);
// ignoreCase=true, trimText=true

// Kiem tra trang thai checkbox/radio/switch
mobileKeyword.assertChecked(agreeCheckbox);
mobileKeyword.assertNotChecked(optionalFeature);

// Kiem tra enabled/disabled
mobileKeyword.assertEnabled(loginButton);
mobileKeyword.assertDisabled(submitButton, "Nut gui phai bi vo hieu hoa khi chua nhap du thong tin");

// Kiem tra selected
mobileKeyword.assertSelected(option1);
mobileKeyword.assertNotSelected(option2);

// Kiem tra attribute
mobileKeyword.assertAttributeEquals(menuButton, "content-desc", "Menu chinh");
mobileKeyword.assertAttributeContains(productItem, "content-desc", "iPhone");

// Kiem tra so luong element
mobileKeyword.assertElementCount(cartItems, 3);

// Kiem tra notification text
mobileKeyword.assertNotificationText("Tin nhan tu A", "Ban co muon tra loi khong?", 15);

// Kiem tra orientation
mobileKeyword.verifyOrientation("PORTRAIT");

// isElementPresent (tra ve boolean, khong throw)
boolean isError = mobileKeyword.isElementPresent(errorMessage, 5);
if (isError) {
    mobileKeyword.tap(dismissButton);
}

// Verify attribute ton tai (soft)
boolean hasEnabled = mobileKeyword.verifyAttributeExists(button, "enabled");
```

### Use-Case 6: Getter - Lay Thong Tin Element
- **Mo ta:** Lay text, attribute, kich thuoc, vi tri, so luong element.

**Code mau:**
```java
// Lay text
String text = mobileKeyword.getText(welcomeMessage);

// Lay attribute
String desc = mobileKeyword.getAttribute(menuButton, "content-desc");

// Lay kich thuoc element
int height = mobileKeyword.getElementHeight(productImage);
int width = mobileKeyword.getElementWidth(submitButton);
Map<String, Integer> size = mobileKeyword.getElementSize(loginButton);

// Lay vi tri element
Map<String, Integer> location = mobileKeyword.getElementLocation(banner);

// Dem so luong element
int count = mobileKeyword.getElementCount(listItemObject);

// Lay text tu nhieu element
List<String> itemNames = mobileKeyword.getTextFromElements(itemNameObject);

// Tim nhieu element (tra ve List<WebElement>)
List<WebElement> products = mobileKeyword.findElements(productListItemObject);

// Lay page source XML
String xml = mobileKeyword.getPageSource();
```

### Use-Case 7: Tap Vao Element Theo Index / Text / Tat Ca
- **Mo ta:** Tap vao element trong danh sach theo vi tri index (bat dau tu 0), theo text, hoac tap het tat ca.

**Code mau:**
```java
// Tap theo index (bat dau tu 0)
mobileKeyword.tapElementByIndex(menuItems, 2, 3, 1); // Tap element thu 3, 4, 2

// Tap tat ca element
mobileKeyword.tapAllElement(menuItems);

// Cuon tim text va tap
mobileKeyword.tapElementWithText("Thanh toan");

// Verify element co text hien thi (tu dong scroll tim)
mobileKeyword.verifyElementVisibleWithText("Dang nhap thanh cong");
```

### Use-Case 8: Quan Ly Thiet Bi (Device)
- **Mo ta:** Dieu khien phan cung thiet bi: phim vat ly, xoay man hinh, khoa/mo khoa, am luong, mang.

**Code mau:**
```java
// Phim vat ly
mobileKeyword.pressHome();
mobileKeyword.pressBack();
mobileKeyword.pressEnter();
mobileKeyword.pressSearch();       // Android only
mobileKeyword.pressMenu();         // Android only
mobileKeyword.pressVolumeUp();
mobileKeyword.pressVolumeDown();
mobileKeyword.pressKeyCode("HOME"); // Android: dung AndroidKey enum

// Xoay man hinh
mobileKeyword.rotateDevice("LANDSCAPE");
mobileKeyword.rotateDevice("PORTRAIT");

// Khoa/mo khoa
mobileKeyword.lockDevice(5);   // Khoa 5 giay
mobileKeyword.unlockDevice();

// Lac thiet bi
mobileKeyword.shakeDevice();

// Lay thoi gian thiet bi
String time = mobileKeyword.getDeviceTime("dd/MM/yyyy HH:mm:ss");

// Lay Activity hien tai (Android)
String activity = mobileKeyword.getCurrentActivity();

// Bat dau Activity cu the (Android)
mobileKeyword.startActivity("com.example.app", ".SettingsActivity");

// Kiem tra ban phim
boolean shown = mobileKeyword.isKeyboardShown();

// Mang (Android only)
int netState = mobileKeyword.getNetworkConnection(); // 0=None, 1=Airplane, 2=Wifi, 4=Data, 6=All
mobileKeyword.setNetworkConnection(2); // Chi wifi
mobileKeyword.toggleWifi();
mobileKeyword.toggleData();
```

### Use-Case 9: Xu Ly Dialog He Thong & Notification
- **Mo ta:** Tu dong chap nhan/tu choi dialog quyen, quan ly notification.

**Code mau:**
```java
// Chap nhan dialog he thong (Allow, OK, Accept...)
mobileKeyword.acceptSystemDialog();

// Tu choi dialog he thong (Deny, Cancel, Don't allow...)
mobileKeyword.denySystemDialog();

// Mo notification panel
mobileKeyword.openNotifications();

// Dem notification
int count = mobileKeyword.getNotificationCount();

// Tap vao notification
mobileKeyword.tapNotificationByText("Ban co tin nhan moi", 15);

// Xoa tat ca notification (Android)
mobileKeyword.clearNotifications();
```

### Use-Case 10: File, Clipboard & Screen Recording
- **Mo ta:** Day/keo file tu/len thiet bi, thao tac clipboard, quay man hinh.

**Code mau:**
```java
// Day file len thiet bi
mobileKeyword.pushFile("/sdcard/Download/avatar.png", "C:/test-data/images/avatar.png");

// Keo file tu thiet bi
String content = mobileKeyword.pullFile("/sdcard/Download/app.log");

// Xoa file tren thiet bi
mobileKeyword.deleteFile("/sdcard/Download/test-data.txt");

// Clipboard
mobileKeyword.setClipboard("test@example.com");
String copied = mobileKeyword.getClipboard();

// Chup man hinh
mobileKeyword.takeScreenshot("login_screen");

// Quay man hinh
mobileKeyword.recordScreen();
// ... test steps ...
String base64Video = mobileKeyword.stopRecordScreen();
```

### Use-Case 11: Slider, Biometric & Performance
- **Mo ta:** Dieu chinh slider, mo phong xac thuc sinh trac hoc, do hieu suat.

**Code mau:**
```java
// Set slider (0.0 = min, 1.0 = max)
mobileKeyword.setSliderValue(volumeSlider, 0.75);

// Touch ID (iOS Simulator only)
mobileKeyword.performTouchID(true);  // Success
mobileKeyword.performTouchID(false); // Failure

// Fingerprint (Android Emulator only)
mobileKeyword.performFingerprint(1);

// Lay thong tin pin
Map<String, Object> battery = mobileKeyword.getBatteryInfo();

// Lay du lieu hieu suat (Android only)
List<List<Object>> memData = mobileKeyword.getPerformanceData("com.example.app", "memoryinfo", 5000);

// Thuc thi lenh Appium tuy chinh
Map<String, Object> args = new HashMap<>();
args.put("appId", "com.example.app");
mobileKeyword.executeMobileCommand("mobile: clearApp", args);
```

### Use-Case 12: Tinh Nang Dac Thu iOS
- **Mo ta:** Cac keyword chi hoat dong tren iOS: shake (lac), scroll iOS native, Touch ID.

**Code mau:**
```java
// Lac thiet bi iOS (test shake-to-undo)
mobileKeyword.shake();

// Scroll iOS native
mobileKeyword.scrollIOS("down");
mobileKeyword.scrollIOS("up");
```

## 4. Cac Data Models (DTOs/POJOs) Thuong Dung

Module `netat-mobile` khong dinh nghia DTO/POJO rieng. Cac class chinh duoc su dung tu cac module dependency:

| Class | Module | Mo ta |
|-------|--------|-------|
| `ObjectUI` | netat-core | Doi tuong dai dien cho element UI, chua locator strategies |
| `LocatorConverter` | netat-core | Chuyen doi ObjectUI locator sang Selenium By |
| `DriverManager` | netat-driver | Quan ly Appium driver instance |
| `BaseUiKeyword` | netat-core | Lop cha chua logic chung (click, sendKeys, findElement, verify...) |
| `ScreenshotUtils` | netat-core | Tien ich chup man hinh |
| `SecretDecryptor` | netat-core | Giai ma du lieu nhay cam (cho `sendTextSensitive`) |
| `@NetatKeyword` | netat-core | Annotation danh dau keyword metadata |

**Return types dac biet:**

| Method | Return Type |
|--------|-------------|
| `getElementLocation()` | `Map<String, Integer>` (keys: "x", "y") |
| `getElementSize()` | `Map<String, Integer>` (keys: "width", "height") |
| `getBatteryInfo()` | `Map<String, Object>` (keys: "level", "state") |
| `getPerformanceData()` | `List<List<Object>>` (table data) |
| `findElements()` | `List<WebElement>` |
| `getTextFromElements()` | `List<String>` |

## 5. Cam Nang Troubleshooting & Directives

### Loi thuong gap

| Loi | Nguyen nhan | Cach xu ly |
|-----|-------------|------------|
| `UnsupportedOperationException: Current driver is not an AndroidDriver` | Goi keyword Android-only tren iOS | Kiem tra platform truoc khi goi. Cac keyword chi Android: `pressKeyCode`, `pressSearch`, `pressMenu`, `startActivity`, `getCurrentActivity`, `toggleWifi`, `toggleData`, `setNetworkConnection`, `getNetworkConnection`, `getPerformanceData`, `performFingerprint`, `clearNotifications` |
| `UnsupportedOperationException: ... not supported on iOS` | Goi keyword iOS-only tren Android | Cac keyword chi iOS: `shake`, `scrollIOS`, `performTouchID` |
| `TimeoutException` | Element khong xuat hien trong thoi gian cho | Tang timeout, kiem tra locator dung chua, app co bi hang khong |
| `NoSuchElementException` | Khong tim thay element | Kiem tra ObjectUI locator, dam bao element da hien thi tren man hinh |
| `ElementNotInteractableException` | Element khong the tuong tac | Cho element enabled (`waitForEnabled`), scroll den element (`scrollToElement`) |
| `SecretDecryptionException` | Giai ma that bai trong `sendTextSensitive` | Kiem tra master key cau hinh qua ENV `NETAT_MASTER_KEY`, System Property `netat.master.key`, hoac file `.env`/`.netat-master-key` |
| `IllegalArgumentException: Invalid direction` | Truyen sai huong scroll/swipe | Chi chap nhan: "up", "down", "left", "right" |
| `IllegalStateException: Cannot determine app ID` | `launchApp`/`closeApp` khong tim thay appId | Dam bao `appPackage` (Android) hoac `bundleId` (iOS) da set trong Desired Capabilities |

### Luu y quan trong

1. **Platform Detection tu dong:** Hau het keyword tu dong phat hien Android/iOS va thuc hien logic tuong ung. Mot so keyword chi ho tro 1 platform (xem bang loi o tren).

2. **ObjectUI Pattern:** Tat ca element interaction deu nhan `ObjectUI` - doi tuong dinh nghia locator strategy. Load bang `getObject("PageName/elementName")`.

3. **BaseUiKeyword Inheritance:** `MobileKeyword extends BaseUiKeyword`, nhieu method tai su dung logic tu lop cha (click, sendKeys, getText, findElement, verify...).

4. **execute() Wrapper:** Moi keyword duoc boc trong `execute()` - cung cap logging, error handling, va Allure reporting tu dong.

5. **Appium Session:** Sau khi `closeApp()`, Appium session van con, co the mo app khac. De ket thuc session hoan toan, su dung Appium driver quit.

6. **Scroll Strategy:**
   - Android: `scrollToText` su dung `UiScrollable` + fallback swipe
   - iOS: Su dung `mobile: scroll` + NSPredicate + fallback swipe
   - Mac dinh toi da 10 lan scroll truoc khi throw exception

7. **Sensitive Data:** Su dung `sendTextSensitive()` thay vi `sendText()` cho mat khau, token, API key. Gia tri se bi mask trong log/report.

8. **Network Bitmask (Android):**
   - 0 = None (tat ca tat)
   - 1 = Airplane Mode
   - 2 = Wifi only
   - 4 = Data only
   - 6 = Wifi + Data (tat ca bat)

9. **App State Values (queryAppState):**
   - 0 = NOT_INSTALLED
   - 1 = NOT_RUNNING
   - 2 = RUNNING_IN_BACKGROUND_SUSPENDED
   - 3 = RUNNING_IN_BACKGROUND
   - 4 = RUNNING_IN_FOREGROUND

10. **Biometric Testing:**
    - iOS: Chi hoat dong tren Simulator, khong hoat dong tren real device
    - Android: Chi hoat dong tren Emulator, can enroll fingerprint truoc qua adb
