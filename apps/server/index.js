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

  const readDatabase = new Database({
    host: process.env.DB_READ_HOST,
    port: process.env.DB_READ_PORT,
    user: process.env.DB_READ_USER,
    password: process.env.DB_READ_PASSWORD,
    database: process.env.DB_READ_NAME,
  });
  await readDatabase.connect();

  app.get('/tasks', async (req, res) => {
    try {
      const query = await readDatabase.query('SELECT * FROM tasks');
      return res.send(query.rows);
    } catch {
      return res.status(500).send('ERROR: Failede to fetch tasks.');
    }
  });

  app.post('/tasks', async (req, res) => {
    if (!req.body || !req.body.description) {
      return res.status(400).send('ERROR: "description" field is required.');
    }

    try {
      const query = await readDatabase.query(
        'INSERT INTO tasks (description) VALUES ($1) RETURNING ID',
        [req.body.description]
      );
      return res.status(201).send({
        id: query.rows[0].id,
        description: req.body.description,
      });
    } catch {
      return res.status(500).send('ERROR: Failed to create task.');
    }
  });

  app.delete('/tasks/:id', async (req, res) => {
    try {
      await readDatabase.query('DELETE FROM tasks WHERE id = $1', [
        req.params.id,
      ]);
      return res.status(200).send();
    } catch {
      return res.status(500).send('ERROR: Failed to delete task.');
    }
  });

  app.listen(4000, () => {
    console.log(`Server listening on port ${4000}`);
  });
}

main();
