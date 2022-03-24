import Database from 'database';
import 'env';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

async function main() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: '*',
    })
  );

  const eventsDatabase = new Database({
    host: process.env.DB_EVENT_HOST,
    port: process.env.DB_EVENT_PORT,
    user: process.env.DB_EVENT_USER,
    password: process.env.DB_EVENT_PASSWORD,
    database: process.env.DB_EVENT_NAME,
  });
  await eventsDatabase.connect();

  const readDatabase = new Database({
    host: process.env.DB_READ_HOST,
    port: process.env.DB_READ_PORT,
    user: process.env.DB_READ_USER,
    password: process.env.DB_READ_PASSWORD,
    database: process.env.DB_READ_NAME,
  });
  await readDatabase.connect();

  const server = app.listen(4002, () => {
    console.log(`Server listening on port ${4002}`);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  let lastCheckDate = new Date();

  setInterval(async () => {
    const {rows: events} = await eventsDatabase.query(
      'SELECT * FROM events WHERE created_at > $1 ORDER BY created_at',
      [lastCheckDate]
    );
    lastCheckDate = new Date();
    for (const e of events) {
      if (e.event_type === 'create_task') {
        await readDatabase.query(
          'INSERT INTO tasks (id, description) VALUES ($1, $2)',
          [e.event.id, e.event.description]
        );
      } else if (e.event_type === 'delete_task') {
        await readDatabase.query('DELETE FROM tasks WHERE id = $1', [e.event.id]);
      }
    }
    io.send(events);
  }, 5000);
}

main();
