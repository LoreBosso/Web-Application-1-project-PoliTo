import sqlite from 'sqlite3';

const db = new sqlite.Database('./db/db.sqlite', (err) => {
  if (err) {
    console.error("Errore nell'apertura del database: " + err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database.');
  }
});

export {db};