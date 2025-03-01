import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

// Statik dosyaları sunmak için dist klasörünü kullan
app.use(express.static(join(__dirname, 'dist')));
app.use(express.json());

// SPA için tüm rotaları index.html'e yönlendir, ancak dist klasörü varsa
app.get('*', (req, res) => {
  try {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  } catch (error) {
    // Eğer dist klasörü yoksa veya index.html bulunamazsa
    res.status(200).send(`
      <html>
        <head>
          <title>İhbar Takip Sistemi - API Sunucusu</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            .card { background: #f5f5f5; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            code { background: #e0e0e0; padding: 2px 5px; border-radius: 3px; }
            pre { background: #e0e0e0; padding: 10px; border-radius: 5px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>İhbar Takip Sistemi - API Sunucusu</h1>
          <div class="card">
            <h2>Sunucu Çalışıyor</h2>
            <p>WebSocket API sunucusu şu anda çalışıyor. Bu, API sunucusudur ve web arayüzü henüz oluşturulmamış.</p>
            <p>Web arayüzünü görmek için aşağıdaki adımları izleyin:</p>
            <ol>
              <li>Terminalde <code>npm run build</code> komutunu çalıştırın</li>
              <li>Ardından <code>npm run server</code> komutunu çalıştırın</li>
              <li>Tarayıcınızda <a href="http://localhost:3000">http://localhost:3000</a> adresine gidin</li>
            </ol>
          </div>
          <div class="card">
            <h2>WebSocket Bağlantısı</h2>
            <p>WebSocket sunucusu <code>http://localhost:3000</code> adresinde çalışıyor.</p>
            <p>Python ile test mesajı göndermek için:</p>
            <pre>python python_test_client.py "Test Mesajı"</pre>
          </div>
        </body>
      </html>
    `);
  }
});

io.on('connection', (socket) => {
  console.log('Yeni bir bağlantı:', socket.id);

  socket.on('deviceData', (data) => {
    console.log('Cihazdan gelen veri:', data);
    io.emit('updateData', data);
  });

  socket.on('complaintResolved', async ({ plate, policeStation, command }) => {
    try {
      // DeneyapKart'a komut gönder
      io.emit('deviceCommand', { command });
      
      io.emit('complaintNotification', {
        message: `🚨 Araç Bildirimi 🚨\n\nPlaka: ${plate}\nAracınız ${command === 'PARK' ? 'park edildi' : 'kilitlendi'}.\n${policeStation} tarafından işlem yapıldı.`
      });
      
      socket.emit('notificationSent', { success: true });
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
      socket.emit('notificationSent', { success: false, error: error.message });
    }
  });

  // Test mesajı için yeni event handler
  socket.on('testMessage', (data) => {
    console.log('Test mesajı alındı:', data);
    io.emit('testMessage', data);
  });

  // Ping işlemi için yeni event handler
  socket.on('ping', () => {
    console.log('Ping isteği alındı:', socket.id);
    // Gerçek bir ping gecikmesi simüle etmek için 2 saniye bekle
    setTimeout(() => {
      console.log('Ping yanıtı gönderiliyor:', socket.id);
      socket.emit('pingResponse');
    }, 2000);
  });

  socket.on('disconnect', () => {
    console.log('Bağlantı kesildi:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});