import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("users")
        .addColumn("id", "uuid", (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`),
        )
        .addColumn("name", "varchar(255)", (col) => col.notNull())
        .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
        .addColumn("email_verified_at", "timestamptz")
        .addColumn("password", "text", (col) => col.notNull())
        .addColumn("created_at", "timestamptz", (col) =>
            col.defaultTo(sql`now()`).notNull(),
        )
        .addColumn("updated_at", "timestamptz", (col) =>
            col.defaultTo(sql`now()`).notNull(),
        )
        .execute();

    await db.schema
        .createTable("refresh_tokens")
        .addColumn("id", "uuid", (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`),
        )
        .addColumn("user_id", "uuid", (col) =>
            col.references("users.id").onDelete("cascade").notNull(),
        )
        .addColumn("token", "text", (col) => col.notNull().unique())
        .addColumn("revoked", "boolean", (col) =>
            col.notNull().defaultTo(false),
        )
        .addColumn("expires_at", "timestamptz", (col) => col.notNull())
        .addColumn("replaced_by", "uuid")
        .addColumn("created_at", "timestamptz", (col) =>
            col.defaultTo(sql`now()`).notNull(),
        )
        .addColumn("updated_at", "timestamptz", (col) =>
            col.defaultTo(sql`now()`).notNull(),
        )
        .execute();

    await Promise.all([
        db.schema
            .createIndex("user_id_idx")
            .on("refresh_tokens")
            .column("user_id")
            .execute(),
        db.schema
            .createIndex("replaced_by_idx")
            .on("refresh_tokens")
            .column("replaced_by")
            .execute(),
        db.schema
            .createIndex("revoked_expires_at_idx")
            .on("refresh_tokens")
            .column("revoked")
            .column("expires_at")
            .execute(),
    ]);

    await sql`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."updatedAt" = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `.execute(db);

    await sql`
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON "users"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql`DROP TRIGGER IF EXISTS update_users_updated_at ON "users";`.execute(
        db,
    );
    await Promise.all([
        db.schema.dropIndex("user_id_idx").execute(),
        db.schema.dropIndex("replaced_by_idx").execute(),
        db.schema.dropIndex("revoked_expires_at_idx").execute(),
    ]);
    await db.schema.dropTable("refresh_tokens").execute();
    await db.schema.dropTable("users").execute();
}
