const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mielissimo.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Add price column if not exists (SQLite doesn't support IF NOT EXISTS for ADD COLUMN directly in all versions, 
    // but we can try and catch or check layout)

    console.log("Attempting to add 'price' column to 'products' table...");

    db.run("ALTER TABLE products ADD COLUMN price REAL", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column 'price' already exists.");
            } else {
                console.error("Error adding column:", err.message);
            }
        } else {
            console.log("Column 'price' added successfully.");
        }
    });
});

db.close();
