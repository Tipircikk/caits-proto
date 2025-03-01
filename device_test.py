import socketio
import time
import random
import sys
from datetime import datetime

def simulate_device(duration=60, interval=2):
    """
    DeneyapKart veya ESP32 cihazını simüle eden Python betiği.
    
    Bu betik, gerçek bir IoT cihazı gibi davranarak düzenli aralıklarla
    sensör verilerini Socket.IO sunucusuna gönderir.
    
    Kullanım:
        python device_test.py [süre_saniye] [aralık_saniye]
        
    Parametreler:
        süre_saniye: Simülasyonun toplam süresi (varsayılan: 60 saniye)
        aralık_saniye: Veri gönderme aralığı (varsayılan: 2 saniye)
    
    Kurulum:
        pip install python-socketio[client]
    """
    if len(sys.argv) > 1:
        try:
            duration = int(sys.argv[1])
        except ValueError:
            print("Hata: Süre bir sayı olmalıdır.")
            return
    
    if len(sys.argv) > 2:
        try:
            interval = int(sys.argv[2])
        except ValueError:
            print("Hata: Aralık bir sayı olmalıdır.")
            return
    
    # Socket.IO istemcisi oluştur
    sio = socketio.Client()
    
    # Rastgele GPS konumları (Türkiye'nin farklı şehirleri)
    gps_locations = [
        "41.0082° N, 28.9784° E",  # İstanbul
        "39.9334° N, 32.8597° E",   # Ankara
        "38.4237° N, 27.1428° E",   # İzmir
        "37.0000° N, 35.3213° E",   # Adana
        "36.8969° N, 30.7133° E",   # Antalya
        "40.1885° N, 29.0610° E",   # Bursa
        "41.2867° N, 36.3300° E",   # Samsun
        "38.7312° N, 35.4787° E"    # Kayseri
    ]
    
    # Kamera durumları
    camera_statuses = ["Aktif", "Pasif", "Bağlantı Hatası", "Düşük Pil"]
    
    # Araç durumları
    vehicle_statuses = ["Çalışıyor", "Durdu", "Park Halinde", "Hareket Halinde"]
    
    # Başlangıç değerleri
    engine_running = False
    auto_parking = False
    
    @sio.event
    def connect():
        print("Sunucuya bağlandı!")
        print(f"Simülasyon başladı. {duration} saniye boyunca her {interval} saniyede bir veri gönderilecek.")
        print("Çıkmak için Ctrl+C tuşlarına basın.")
    
    @sio.event
    def connect_error(data):
        print(f"Bağlantı hatası: {data}")
    
    @sio.event
    def disconnect():
        print("Sunucudan bağlantı kesildi!")
    
    @sio.on('deviceCommand')
    def on_command(data):
        nonlocal engine_running, auto_parking
        command = data.get('command', '')
        print(f"Komut alındı: {command}")
        
        if command == 'START':
            engine_running = True
            print("Motor çalıştırıldı.")
        elif command == 'STOP':
            engine_running = False
            print("Motor durduruldu.")
        elif command == 'PARK':
            auto_parking = True
            print("Otonom park başlatıldı.")
            # 5 saniye sonra park tamamlandı
            time.sleep(5)
            auto_parking = False
            engine_running = False
            print("Otonom park tamamlandı.")
        elif command == 'LOCK':
            print("Araç kilitlendi.")
    
    # Sunucuya bağlan
    try:
        sio.connect('http://localhost:3000')
        
        start_time = time.time()
        while time.time() - start_time < duration:
            # Rastgele sensör verileri oluştur
            gps_location = random.choice(gps_locations)
            camera_status = random.choice(camera_statuses)
            
            # Motor durumuna göre araç durumunu belirle
            if auto_parking:
                vehicle_status = "Otonom Park Yapılıyor"
            elif engine_running:
                vehicle_status = random.choice(["Çalışıyor", "Hareket Halinde"])
            else:
                vehicle_status = random.choice(["Durdu", "Park Halinde"])
            
            # Veri paketi oluştur
            data = {
                "gpsLocation": gps_location,
                "cameraStatus": camera_status,
                "vehicleStatus": vehicle_status,
                "engineRunning": engine_running,
                "autoParking": auto_parking,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
            
            # Veriyi gönder
            sio.emit('deviceData', data)
            print(f"[{data['timestamp']}] Veri gönderildi: GPS={gps_location}, Kamera={camera_status}, Araç={vehicle_status}, Motor={'Açık' if engine_running else 'Kapalı'}")
            
            # Belirtilen aralık kadar bekle
            time.sleep(interval)
        
        sio.disconnect()
        print(f"Simülasyon tamamlandı. Toplam süre: {duration} saniye.")
        
    except KeyboardInterrupt:
        print("\nKullanıcı tarafından durduruldu.")
        sio.disconnect()
    except Exception as e:
        print(f"Hata oluştu: {e}")
        print("\nKurulum talimatları:")
        print("1. Gerekli kütüphaneyi yükleyin:")
        print("   pip install python-socketio[client]")
        print("2. Sunucunun çalıştığından emin olun:")
        print("   npm run server")

if __name__ == "__main__":
    simulate_device()