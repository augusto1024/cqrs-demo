import pg from 'pg';

const { Client } = pg;

export default class Database {
  client;

  constructor(
    options = {
      host: 'localhost',
      port: 3211,
      database: 'mydb',
      user: 'root',
      password: 'root',
    }
  ) {
    this.client = new Client(options);
  }

  async connect() {
    try {
      return await this.client.connect();
    } catch (err) {
      console.error('ERROR: Fail to connect to the database.');
      throw err;
    }
  }

  async query(query, values) {
    try {
      return await this.client.query(query, values);
    } catch (err) {
      console.log('ERROR: Failed to perform query.');
      throw err;
    }
  }
}
