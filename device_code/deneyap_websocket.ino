#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi ayarları
const char* ssid = "WiFi_Adi";      // WiFi adınızı buraya yazın
const char* password = "WiFi_Sifre"; // WiFi şifrenizi buraya yazın

// WebSocket sunucu ayarları
const char* websockets_server = "192.168.1.100"; // Bilgisayarınızın IP adresi
const int websockets_port = 3000;                // Sunucu portu

// Pin tanımlamaları
const int CAMERA_DETECT_PIN = 13;    // Kamera bağlantı pini
const int ENGINE_SENSOR_PIN = 14;    // Motor durum sensörü pini
const int GPS_RX_PIN = 16;          // GPS modülü RX pini
const int GPS_TX_PIN = 17;          // GPS modülü TX pini
const int LOCK_CONTROL_PIN = 18;    // Kilit kontrol pini
const int PARK_CONTROL_PIN = 19;    // Park kontrol pini

WebSocketsClient webSocket;
HardwareSerial gpsSerial(1); // UART1 için

void setup() {
  Serial.begin(115200);
  
  // GPS başlat
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  
  // Pin modlarını ayarla
  pinMode(CAMERA_DETECT_PIN, INPUT);
  pinMode(ENGINE_SENSOR_PIN, INPUT);
  pinMode(LOCK_CONTROL_PIN, OUTPUT);
  pinMode(PARK_CONTROL_PIN, OUTPUT);
  
  // Başlangıçta kontrol pinlerini pasif yap
  digitalWrite(LOCK_CONTROL_PIN, LOW);
  digitalWrite(PARK_CONTROL_PIN, LOW);
  
  // WiFi bağlantısı
  WiFi.begin(ssid, password);
  Serial.print("WiFi'ya bağlanılıyor");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi'ya bağlandı!");
  Serial.print("IP adresi: ");
  Serial.println(WiFi.localIP());

  // WebSocket sunucusuna bağlan
  webSocket.begin(websockets_server, websockets_port, "/socket.io/?EIO=4");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  // Her 2 saniyede bir veri gönder
  static unsigned long lastTime = 0;
  if (millis() - lastTime > 2000) {
    lastTime = millis();
    sendSensorData();
  }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket bağlantısı kesildi!");
      break;
    case WStype_CONNECTED:
      Serial.println("WebSocket bağlandı!");
      break;
    case WStype_TEXT:
      handleCommand(payload, length);
      break;
  }
}

void handleCommand(uint8_t * payload, size_t length) {
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) {
    Serial.println("JSON ayrıştırma hatası!");
    return;
  }
  
  const char* command = doc["command"];
  
  if (strcmp(command, "LOCK") == 0) {
    digitalWrite(LOCK_CONTROL_PIN, HIGH);
    delay(1000);
    digitalWrite(LOCK_CONTROL_PIN, LOW);
    Serial.println("Araç kilitlendi!");
  }
  else if (strcmp(command, "PARK") == 0) {
    digitalWrite(PARK_CONTROL_PIN, HIGH);
    delay(1000);
    digitalWrite(PARK_CONTROL_PIN, LOW);
    Serial.println("Araç park edildi!");
  }
}

String getCameraStatus() {
  return digitalRead(CAMERA_DETECT_PIN) == HIGH ? "Aktif" : "Pasif";
}

String getEngineStatus() {
  return digitalRead(ENGINE_SENSOR_PIN) == HIGH ? "Çalışıyor" : "Durdu";
}

void sendSensorData() {
  StaticJsonDocument<200> doc;
  
  // Sensör verilerini al
  doc["gpsLocation"] = "41.0082° N, 28.9784° E"; // GPS verisi örneği
  doc["cameraStatus"] = getCameraStatus();
  doc["vehicleStatus"] = getEngineStatus();
  doc["engineRunning"] = digitalRead(ENGINE_SENSOR_PIN) == HIGH;

  // JSON verisini string'e çevir
  String jsonString;
  serializeJson(doc, jsonString);

  // WebSocket üzerinden gönder
  String message = "42[\"deviceData\"," + jsonString + "]";
  webSocket.sendTXT(message);
  
  Serial.println("Gönderilen veri: " + jsonString);
}