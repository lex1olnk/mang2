import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    server: {
        port: 80
    },

    knex: {
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'user',
            password: 'password',
            database: 'db_name',
        },
        migrations: {
            directory: __dirname + '/../migrations'
        },
        seeds: {
            directory: __dirname + '/../seeds'
        }
    },
}
