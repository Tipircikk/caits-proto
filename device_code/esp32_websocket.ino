#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <TinyGPS++.h>

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

WebSocketsClient webSocket;
TinyGPSPlus gps;
HardwareSerial gpsSerial(1); // UART1 için

void setup() {
  Serial.begin(115200);
  
  // GPS başlat
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  
  // Pin modlarını ayarla
  pinMode(CAMERA_DETECT_PIN, INPUT);
  pinMode(ENGINE_SENSOR_PIN, INPUT);
  
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
  
  // GPS verilerini güncelle
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

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
      Serial.printf("Gelen mesaj: %s\n", payload);
      break;
  }
}

String getGPSLocation() {
  if (gps.location.isValid()) {
    String location = String(gps.location.lat(), 6) + "° N, " +
                     String(gps.location.lng(), 6) + "° E";
    return location;
  }
  return "GPS Sinyal Yok";
}

String getCameraStatus() {
  // Kamera bağlantı durumunu kontrol et
  bool cameraConnected = digitalRead(CAMERA_DETECT_PIN) == HIGH;
  return cameraConnected ? "Aktif" : "Pasif";
}

String getEngineStatus() {
  // Motor sensöründen gelen veriyi oku
  bool engineRunning = digitalRead(ENGINE_SENSOR_PIN) == HIGH;
  return engineRunning ? "Çalışıyor" : "Durdu";
}

void sendSensorData() {
  StaticJsonDocument<200> doc;
  
  // Gerçek sensör verilerini al
  doc["gpsLocation"] = getGPSLocation();
  doc["cameraStatus"] = getCameraStatus();
  doc["vehicleStatus"] = getEngineStatus();

  // JSON verisini string'e çevir
  String jsonString;
  serializeJson(doc, jsonString);

  // WebSocket üzerinden gönder
  String message = "42[\"deviceData\"," + jsonString + "]";
  webSocket.sendTXT(message);
  
  // Debug için seri porta yazdır
  Serial.println("Gönderilen veri: " + jsonString);
}