import Database from 'database';
import 'env';
import express from 'express';
import cors from 'cors';

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

  const ALLOWED_COMMAND_TYPES = ['create_task', 'delete_task'];

  app.post('/commands', async (req, res) => {
    try {
      const { commandType, command } = req.body;

      if (!commandType) {
        return res.status(400).send('ERROR: "commandType" field is required.');
      } else if (!command) {
        return res.status(400).send('ERROR: "command" field is required.');
      }

      if (!ALLOWED_COMMAND_TYPES.includes(commandType)) {
        return res.status(400).send('ERROR: Invalid command type.');
      }

      await eventsDatabase.query(
        'INSERT INTO events (event_type, event) VALUES ($1, $2)',
        [commandType, command]
      );

      res.status(201).send();
    } catch {
      return res.status(500).send('ERROR: Failed to create event.');
    }
  });

  app.listen(4001, () => {
    console.log(`Server listening on port ${4001}`);
  });
}

main();
