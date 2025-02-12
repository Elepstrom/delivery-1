import mysql from 'mysql2/promise';

// Configuration de la connexion à la base de données
const pool = mysql.createPool({
  host: 'localhost',
  port: 3308,
  user: 'root',
  password: '',
  database: 'suivi_vehicules',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;