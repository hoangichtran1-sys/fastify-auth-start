import * as path from "path";
import { Pool } from "pg";
import { promises as fs } from "fs";
import { Kysely, PostgresDialect } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely/migration";
import { fileURLToPath } from "url";
import { env } from "@/configs/env";

const db = new Kysely<any>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: env.DATABASE_URL,
        }),
    }),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
        fs,
        path,
        // This needs to be an absolute path.
        migrationFolder: path.join(__dirname, "../migrations"),
    }),
});
async function runMigrate() {
    const action = process.argv[2];

    let result;
    if (action === "down") {
        console.log("🔄 Rollback 1 migration gần nhất...");
        result = await migrator.migrateDown();
    } else if (action === "up") {
        console.log("🚀 Chạy 1 migration tiếp theo...");
        result = await migrator.migrateUp();
    } else {
        console.log("🚀 Chạy tất cả migration chưa được áp dụng (latest)...");
        result = await migrator.migrateToLatest();
    }

    const { error, results } = result;

    results?.forEach((it) => {
        if (it.status === "Success") {
            console.log(
                `Migration "${it.migrationName}" was executed successfully`,
            );
        } else if (it.status === "Error") {
            console.error(`Failed to execute migration "${it.migrationName}"`);
        }
    });

    if (error) {
        console.error("Failed to migrate");
        console.error(error);
        process.exit(1);
    }

    await db.destroy();
}

runMigrate();
