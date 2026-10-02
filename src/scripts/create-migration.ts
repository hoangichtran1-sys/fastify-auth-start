import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lấy tên migration từ tham số dòng lệnh
const migrationName = process.argv[2];

if (!migrationName) {
    console.error("❌ Vui lòng nhập tên migration!");
    console.log("Ví dụ: tsx scripts/create-migration.js create_users_table");
    process.exit(1);
}

// 1. Tạo timestamp theo dạng YYYYMMDDHHmmss
const now = new Date();
const pad = (num: number) => String(num).padStart(2, "0");
const timestamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
].join("");

// 2. Định dạng tên file
const sanitizedName = migrationName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
const fileName = `${timestamp}_${sanitizedName}.ts`;

// Đường dẫn lưu file migration
const targetDir = path.join(__dirname, "../migrations");
const filePath = path.join(targetDir, fileName);

// 3. Nội dung mẫu cho file migration Kysely
const template = `import { Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
   // Migration up
}

export async function down(db: Kysely<any>): Promise<void> {
  // Migration down
}
`;

try {
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(filePath, template, "utf8");
    console.log(`✅ Đã tạo file migration: ${fileName}`);
} catch (error) {
    console.error("❌ Có lỗi xảy ra khi tạo file:", error);
}
