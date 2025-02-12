import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pool from './database.js';
import { verifyAuth } from './auth.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Route de test pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'Serveur en ligne' });
});

// Route de connexion simplifiée
app.post('/login/:type', async (req, res) => {
  const { type } = req.params;
  const { email, mot_de_passe } = req.body;
  
  try {
    const [users] = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = ? AND mot_de_passe = ? AND role = ?',
      [email, mot_de_passe, type]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    res.json({ 
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes protégées
app.use('/api', verifyAuth);

app.get('/api/vehicules', async (req, res) => {
  try {
    const [vehicules] = await pool.query('SELECT * FROM vehicules');
    res.json(vehicules);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
  }
});

app.get('/api/historique/:vehiculeId', async (req, res) => {
  try {
    const [historique] = await pool.query(
      'SELECT * FROM historique_positions WHERE vehicule_id = ? ORDER BY timestamp DESC LIMIT 100',
      [req.params.vehiculeId]
    );
    res.json(historique);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

// Gestion des WebSockets
io.on('connection', (socket) => {
  console.log('Client connecté');

  // Simulation de mises à jour de position
  const interval = setInterval(() => {
    const vehiculeId = Math.floor(Math.random() * 3) + 1;
    const latitude = 45 + Math.random() * 5;
    const longitude = 1 + Math.random() * 5;
    
    socket.emit('locationUpdated', {
      vehicleId: vehiculeId,
      latitude,
      longitude,
      statut: 'en route'
    });
  }, 5000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client déconnecté');
  });
});

const PORT = 8081;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});