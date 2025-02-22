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

app.use(express.static(join(__dirname, 'dist')));
app.use(express.json());

io.on('connection', (socket) => {
  console.log('Yeni bir bağlantı:', socket.id);

  socket.on('deviceData', (data) => {
    console.log('Cihazdan gelen veri:', data);
    io.emit('updateData', data);
  });

  socket.on('vehicleControl', (data) => {
    console.log('Araç kontrol komutu:', data);
    io.emit('vehicleCommand', data);
  });

  socket.on('complaintResolved', async ({ plate, policeStation }) => {
    try {
      io.emit('complaintNotification', {
        message: `🚨 Araç Bildirimi 🚨\n\nPlaka: ${plate}\nAracınız alınmıştır.\n${policeStation} Polis Merkezinden kimliğiniz ile teslim alabilirsiniz.`
      });
      socket.emit('notificationSent', { success: true });
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
      socket.emit('notificationSent', { success: false, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Bağlantı kesildi:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});