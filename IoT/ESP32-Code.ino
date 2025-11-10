#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// --- Credentials ---
const char* WIFI_SSID = "ABCD";
const char* WIFI_PASS = "12345678";

// --- API URLs ---
const char* SERVER_URL = "http://10.235.121.100:5000/api/v1/rfid/scan";  // RFID API
const char* PIR_SERVER_URL = "http://10.235.121.100:5000/api/v1/pir/scan";  // PIR API

// --- RFID Pins ---
#define RST_PIN 22
#define SS_PIN  5

MFRC522 mfrc522(SS_PIN, RST_PIN);

unsigned long lastSentTime = 0;
const unsigned long debounceMillis = 1500;

// --- PIR Serial Buffer ---
String pirBuffer = "";

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  Serial.println("\nESP32 + RC522 RFID + PIR Receiver");

  SPI.begin(18, 19, 23, SS_PIN);
  mfrc522.PCD_Init();
  delay(50);

  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
    if (millis() - start > 20000) {
      Serial.println("\nWiFi connect timeout - continuing...");
      break;
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("\nConnected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Not connected to WiFi.");
  }

  Serial.println("RFID reader initialized.");
  Serial.println("Ready for PIR Serial input...");
}

void loop() {
  handlePirSerial();
  handleRfid();
}

void handleRfid() {
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastReconnectAttempt = 0;
    if (millis() - lastReconnectAttempt > 5000) {
      lastReconnectAttempt = millis();
      Serial.println("Attempting WiFi reconnect...");
      WiFi.reconnect();
    }
  }

  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uidHex = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uint8_t b = mfrc522.uid.uidByte[i];
    if (b < 0x10) uidHex += "0";
    uidHex += String(b, HEX);
  }
  uidHex.toUpperCase();

  unsigned long uidDec = 0;
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uidDec = (uidDec << 8) | mfrc522.uid.uidByte[i];
  }

  Serial.print("Card UID: ");
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(" ");
    if (mfrc522.uid.uidByte[i] < 0x10) Serial.print("0");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  Serial.println();
  Serial.print("UID (hex): "); Serial.println(uidHex);
  Serial.print("UID (dec): "); Serial.println(uidDec);

  unsigned long now = millis();
  if (now - lastSentTime < debounceMillis) {
    Serial.println("Debounced RFID (too soon).");
  } else {
    bool ok = sendUidToServer(uidHex, uidDec);
    if (ok) lastSentTime = now;
  }

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  delay(200);
}

bool sendUidToServer(const String &hexUid, unsigned long decUid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected — RFID not sent.");
    return false;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"uid_hex\":\"" + hexUid + "\","; 
  payload += "\"uid_dec\":" + String(decUid);
  payload += "}";

  Serial.println("\n---- RFID DEBUG INFO ----");
  Serial.print("Sending to: "); Serial.println(SERVER_URL);
  Serial.print("Payload: "); Serial.println(payload);
  Serial.print("WiFi Status: "); Serial.println(WiFi.status());
  Serial.print("Signal Strength (RSSI): "); Serial.println(WiFi.RSSI());
  Serial.print("Local IP: "); Serial.println(WiFi.localIP());
  Serial.println("-------------------------");

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    Serial.print("RFID HTTP Response: ");
    Serial.println(httpResponseCode);
    Serial.println(http.getString());
    http.end();
    return (httpResponseCode >= 200 && httpResponseCode < 300);
  } else {
    Serial.println("\n❌ RFID POST Error Details:");
    Serial.print("Error Code: ");
    Serial.println(httpResponseCode);
    Serial.print("Error Text: ");
    Serial.println(http.errorToString(httpResponseCode));
    Serial.print("WiFi Status: ");
    Serial.println(WiFi.status());
    Serial.print("RSSI (Signal): ");
    Serial.println(WiFi.RSSI());
    Serial.print("Local IP: ");
    Serial.println(WiFi.localIP());
    Serial.println("Server might be unreachable or refused the connection.");
    Serial.println("-----------------------------\n");

    http.end();
    return false;
  }
}

void handlePirSerial() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      pirBuffer.trim();
      if (pirBuffer.startsWith("{") && pirBuffer.endsWith("}")) {
        sendPirToServer(pirBuffer);
      }
      pirBuffer = "";
    } else {
      pirBuffer += c;
    }
  }
}

bool sendPirToServer(String jsonData) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected — PIR not sent.");
    return false;
  }

  HTTPClient http;
  http.begin(PIR_SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  Serial.print("Sending PIR POST: ");
  Serial.println(jsonData);

  int httpResponseCode = http.POST(jsonData);
  if (httpResponseCode > 0) {
    Serial.print("PIR HTTP Response: ");
    Serial.println(httpResponseCode);
    Serial.println(http.getString());
    http.end();
    return (httpResponseCode >= 200 && httpResponseCode < 300);
  } else {
    Serial.print("PIR POST Error: ");
    Serial.println(http.errorToString(httpResponseCode).c_str());
    http.end();
    return false;
  }
}
