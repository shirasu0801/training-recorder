package database

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	dataDir := "../data"
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		log.Fatal("Failed to create data directory:", err)
	}

	dbPath := filepath.Join(dataDir, "training.db")
	var err error
	DB, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	createTables()
	insertDefaultExercises()
	log.Println("Database initialized successfully")
}

func createTables() {
	tables := `
	CREATE TABLE IF NOT EXISTS exercises (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		muscle_group TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS workouts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		exercise_id INTEGER NOT NULL,
		date DATE NOT NULL,
		sets INTEGER NOT NULL,
		reps INTEGER NOT NULL,
		weight REAL NOT NULL,
		notes TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS plans (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		description TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS plan_exercises (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		plan_id INTEGER NOT NULL,
		exercise_id INTEGER NOT NULL,
		target_sets INTEGER NOT NULL,
		target_reps INTEGER NOT NULL,
		order_index INTEGER NOT NULL,
		FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
		FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS goals (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		exercise_id INTEGER NOT NULL,
		target_weight REAL NOT NULL,
		target_reps INTEGER NOT NULL,
		deadline DATE,
		achieved BOOLEAN DEFAULT FALSE,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
	);

	CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
	CREATE INDEX IF NOT EXISTS idx_workouts_exercise ON workouts(exercise_id);
	`

	_, err := DB.Exec(tables)
	if err != nil {
		log.Fatal("Failed to create tables:", err)
	}
}

func insertDefaultExercises() {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM exercises").Scan(&count)
	if err != nil {
		log.Println("Failed to check exercises count:", err)
		return
	}

	if count > 0 {
		return
	}

	defaultExercises := []struct {
		name        string
		muscleGroup string
	}{
		// 胸
		{"ベンチプレス", "胸"},
		{"ダンベルプレス", "胸"},
		{"インクラインベンチプレス", "胸"},
		{"チェストフライ", "胸"},
		{"ディップス", "胸"},
		// 背中
		{"デッドリフト", "背中"},
		{"ラットプルダウン", "背中"},
		{"ベントオーバーロウ", "背中"},
		{"チンニング", "背中"},
		{"シーテッドロウ", "背中"},
		// 肩
		{"オーバーヘッドプレス", "肩"},
		{"サイドレイズ", "肩"},
		{"フロントレイズ", "肩"},
		{"リアデルトフライ", "肩"},
		// 腕
		{"バーベルカール", "腕"},
		{"ダンベルカール", "腕"},
		{"トライセップスエクステンション", "腕"},
		{"スカルクラッシャー", "腕"},
		// 脚
		{"スクワット", "脚"},
		{"レッグプレス", "脚"},
		{"ルーマニアンデッドリフト", "脚"},
		{"レッグカール", "脚"},
		{"レッグエクステンション", "脚"},
		{"カーフレイズ", "脚"},
		// 腹筋
		{"クランチ", "腹筋"},
		{"レッグレイズ", "腹筋"},
		{"プランク", "腹筋"},
		{"アブローラー", "腹筋"},
	}

	stmt, err := DB.Prepare("INSERT INTO exercises (name, muscle_group) VALUES (?, ?)")
	if err != nil {
		log.Println("Failed to prepare statement:", err)
		return
	}
	defer stmt.Close()

	for _, ex := range defaultExercises {
		_, err := stmt.Exec(ex.name, ex.muscleGroup)
		if err != nil {
			log.Printf("Failed to insert exercise %s: %v", ex.name, err)
		}
	}

	log.Println("Default exercises inserted")
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}
