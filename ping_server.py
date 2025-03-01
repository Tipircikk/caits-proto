import socketio
import time
import sys

def ping_server():
    """
    Socket.IO sunucusuna ping gönderen Python betiği.
    
    Bu betik, sunucuya ping gönderir ve yanıt alındığında bildirim gösterilir.
    
    Kullanım:
        python ping_server.py
    
    Kurulum:
        pip install python-socketio[client]
    """
    
    # Socket.IO istemcisi oluştur
    sio = socketio.Client()
    
    @sio.event
    def connect():
        print("Sunucuya bağlandı!")
        
        # Ping gönder
        sio.emit('ping')
        print("Ping gönderildi, yanıt bekleniyor...")
    
    @sio.event
    def pingResponse():
        print("Ping başarılı! Sunucu yanıt verdi.")
        print("Sunucu ping kalibrasyonu tamamlandı.")
        
        # Biraz bekle ve bağlantıyı kapat
        time.sleep(1)
        sio.disconnect()
    
    @sio.event
    def connect_error(data):
        print(f"Bağlantı hatası: {data}")
    
    @sio.event
    def disconnect():
        print("Sunucudan bağlantı kesildi!")
    
    # Sunucuya bağlan
    try:
        sio.connect('http://localhost:3000')
        sio.wait()
    except Exception as e:
        print(f"Hata oluştu: {e}")
        print("\nKurulum talimatları:")
        print("1. Gerekli kütüphaneyi yükleyin:")
        print("   pip install python-socketio[client]")
        print("2. Sunucunun çalıştığından emin olun:")
        print("   npm run server")

if __name__ == "__main__":
    ping_server()