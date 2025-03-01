# İhbar Takip Sistemi

Bu proje, araç ihbarlarını takip etmek ve yönetmek için geliştirilmiş bir web uygulamasıdır.

## Kurulum

Projeyi çalıştırmak için aşağıdaki adımları izleyin:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Sunucuyu başlatın (ayrı bir terminalde)
npm run server
```

## Python Test İstemcisi

Sunucuya test mesajları göndermek için Python istemcisini kullanabilirsiniz:

### Kurulum

```bash
# Gerekli Python kütüphanesini yükleyin
pip install python-socketio[client]
```

### Kullanım

```bash
# Varsayılan mesajı göndermek için
python python_test_client.py

# Özel bir mesaj göndermek için
python python_test_client.py "Merhaba Dünya!"
```

## Özellikler

- Araç ihbarlarını oluşturma ve takip etme
- Araç durumunu gerçek zamanlı izleme
- Araç kilitleme ve otonom park komutları gönderme
- Kullanıcı yönetimi ve yetkilendirme
- Plaka veritabanı yönetimi

## Cihaz Entegrasyonu

Sistem, ESP32 veya DeneyapKart gibi IoT cihazlarıyla WebSocket üzerinden haberleşebilir. Cihaz kodları `device_code` klasöründe bulunmaktadır.