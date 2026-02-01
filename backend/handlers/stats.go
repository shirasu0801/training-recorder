package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"
	"training-recorder/database"
	"training-recorder/models"

	"github.com/gin-gonic/gin"
)

func GetExerciseStats(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var stats models.ExerciseStats
	err = database.DB.QueryRow(
		"SELECT id, name, muscle_group FROM exercises WHERE id = ?",
		id,
	).Scan(&stats.ExerciseID, &stats.ExerciseName, &stats.MuscleGroup)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Exercise not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = database.DB.QueryRow(`
		SELECT COALESCE(MAX(weight), 0), COALESCE(MAX(reps), 0), COALESCE(SUM(sets), 0), COALESCE(SUM(sets * reps * weight), 0)
		FROM workouts WHERE exercise_id = ?
	`, id).Scan(&stats.MaxWeight, &stats.MaxReps, &stats.TotalSets, &stats.TotalVolume)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rows, err := database.DB.Query(`
		SELECT date, weight, reps, sets, (sets * reps * weight) as volume
		FROM workouts
		WHERE exercise_id = ?
		ORDER BY date ASC
	`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	stats.History = []models.WorkoutHistory{}
	for rows.Next() {
		var h models.WorkoutHistory
		if err := rows.Scan(&h.Date, &h.Weight, &h.Reps, &h.Sets, &h.Volume); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		stats.History = append(stats.History, h)
	}

	c.JSON(http.StatusOK, stats)
}

func GetVolumeStats(c *gin.Context) {
	period := c.DefaultQuery("period", "week")

	var startDate string
	now := time.Now()

	switch period {
	case "week":
		startDate = now.AddDate(0, 0, -7).Format("2006-01-02")
	case "month":
		startDate = now.AddDate(0, -1, 0).Format("2006-01-02")
	case "year":
		startDate = now.AddDate(-1, 0, 0).Format("2006-01-02")
	default:
		startDate = now.AddDate(0, 0, -7).Format("2006-01-02")
	}

	var stats models.VolumeStats
	stats.Period = period

	err := database.DB.QueryRow(`
		SELECT COALESCE(SUM(sets * reps * weight), 0)
		FROM workouts
		WHERE date >= ?
	`, startDate).Scan(&stats.TotalVolume)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rows, err := database.DB.Query(`
		SELECT e.muscle_group, COALESCE(SUM(w.sets * w.reps * w.weight), 0) as volume
		FROM workouts w
		JOIN exercises e ON w.exercise_id = e.id
		WHERE w.date >= ?
		GROUP BY e.muscle_group
		ORDER BY volume DESC
	`, startDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	stats.ByMuscle = []models.MuscleVolume{}
	for rows.Next() {
		var mv models.MuscleVolume
		if err := rows.Scan(&mv.MuscleGroup, &mv.Volume); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		stats.ByMuscle = append(stats.ByMuscle, mv)
	}

	dailyRows, err := database.DB.Query(`
		SELECT date, COALESCE(SUM(sets * reps * weight), 0) as volume
		FROM workouts
		WHERE date >= ?
		GROUP BY date
		ORDER BY date ASC
	`, startDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer dailyRows.Close()

	stats.Daily = []models.DailyVolume{}
	for dailyRows.Next() {
		var dv models.DailyVolume
		if err := dailyRows.Scan(&dv.Date, &dv.Volume); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		stats.Daily = append(stats.Daily, dv)
	}

	c.JSON(http.StatusOK, stats)
}

func GetPersonalRecords(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT e.id, e.name, e.muscle_group,
			COALESCE(MAX(w.weight), 0) as max_weight,
			COALESCE((SELECT reps FROM workouts WHERE exercise_id = e.id AND weight = MAX(w.weight) LIMIT 1), 0) as max_reps,
			COALESCE((SELECT date FROM workouts WHERE exercise_id = e.id AND weight = MAX(w.weight) LIMIT 1), '') as date
		FROM exercises e
		LEFT JOIN workouts w ON e.id = w.exercise_id
		GROUP BY e.id
		HAVING max_weight > 0
		ORDER BY e.muscle_group, e.name
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	records := []models.PersonalRecord{}
	for rows.Next() {
		var pr models.PersonalRecord
		if err := rows.Scan(&pr.ExerciseID, &pr.ExerciseName, &pr.MuscleGroup, &pr.MaxWeight, &pr.MaxReps, &pr.Date); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		records = append(records, pr)
	}

	c.JSON(http.StatusOK, records)
}
