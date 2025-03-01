import socket
import json
import sys

def send_test_message(message="testdeneme123"):
    """
    Socket.IO sunucusuna test mesajı gönderen basit bir Python betiği.
    
    Bu betik, Socket.IO protokolünün düşük seviyeli detaylarını manuel olarak
    işler ve Socket.IO sunucusuna bir test mesajı gönderir.
    
    Kullanım:
        python test_socket.py [mesaj]
        
    Eğer mesaj belirtilmezse, varsayılan olarak "testdeneme123" gönderilir.
    """
    if len(sys.argv) > 1:
        message = sys.argv[1]
    
    # Socket.IO sunucu bilgileri
    host = 'localhost'
    port = 3000
    
    # Socket oluştur
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # Sunucuya bağlan
        s.connect((host, port))
        print(f"Sunucuya bağlandı: {host}:{port}")
        
        # Socket.IO el sıkışma mesajı
        handshake = "GET /socket.io/?EIO=4&transport=websocket HTTP/1.1\r\n" + \
                    f"Host: {host}:{port}\r\n" + \
                    "Upgrade: websocket\r\n" + \
                    "Connection: Upgrade\r\n" + \
                    "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n" + \
                    "Sec-WebSocket-Version: 13\r\n\r\n"
        
        s.sendall(handshake.encode())
        
        # Sunucudan yanıt al
        response = s.recv(4096).decode()
        print("Sunucu yanıtı:", response)
        
        # Socket.IO mesaj formatı: 42["event_name",{"data":"value"}]
        event_data = {
            "message": message
        }
        
        socket_io_message = f'42["testMessage",{json.dumps(event_data)}]'
        
        # WebSocket çerçevesi oluştur (basitleştirilmiş)
        frame = bytearray([0x81])  # Text frame
        length = len(socket_io_message)
        
        if length < 126:
            frame.append(length)
        elif length < 65536:
            frame.append(126)
            frame.extend(length.to_bytes(2, byteorder='big'))
        else:
            frame.append(127)
            frame.extend(length.to_bytes(8, byteorder='big'))
        
        frame.extend(socket_io_message.encode())
        
        # Mesajı gönder
        s.sendall(frame)
        print(f"Test mesajı gönderildi: {message}")
        
        # Yanıtı bekle
        response = s.recv(4096)
        print("Sunucudan yanıt alındı")
        
    except Exception as e:
        print(f"Hata oluştu: {e}")
    finally:
        # Bağlantıyı kapat
        s.close()
        print("Bağlantı kapatıldı")

if __name__ == "__main__":
    send_test_message()