import 'dotenv/config'
import { Knex } from 'knex';

interface KnexConfig {
    [key: string]: Knex.Config;
}

const config: KnexConfig = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.KNEX_HOST,
            user: process.env.KNEX_USER,
            password: process.env.KNEX_PASSWORD,
            database: process.env.KNEX_DATABASE,
            port: process.env.KNEX_PORT as number | undefined
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }
};

export default config;
