import knex from 'knex';
import knexConfig from './knexfile';

const environment = 'development';
const config = knexConfig[environment];
const db = knex(config);

export default db;
