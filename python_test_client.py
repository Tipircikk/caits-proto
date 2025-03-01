import socketio
import time
import sys

def send_test_message(message="testdeneme123"):
    """
    Socket.IO sunucusuna test mesajı gönderen Python betiği.
    
    Kullanım:
        python python_test_client.py [mesaj]
        
    Eğer mesaj belirtilmezse, varsayılan olarak "testdeneme123" gönderilir.
    
    Kurulum:
        pip install python-socketio[client]
    """
    if len(sys.argv) > 1:
        message = sys.argv[1]
    
    # Socket.IO istemcisi oluştur
    sio = socketio.Client()
    
    @sio.event
    def connect():
        print("Sunucuya bağlandı!")
        
        # Test mesajını gönder
        sio.emit('testMessage', {'message': message})
        print(f"Test mesajı gönderildi: {message}")
        
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
    send_test_message()