package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"training-recorder/database"
	"training-recorder/models"

	"github.com/gin-gonic/gin"
)

func GetWorkouts(c *gin.Context) {
	date := c.Query("date")
	exerciseID := c.Query("exercise_id")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := `
		SELECT w.id, w.exercise_id, e.name, e.muscle_group, w.date, w.sets, w.reps, w.weight, w.notes, w.created_at
		FROM workouts w
		JOIN exercises e ON w.exercise_id = e.id
		WHERE 1=1
	`
	args := []interface{}{}

	if date != "" {
		query += " AND w.date = ?"
		args = append(args, date)
	}
	if exerciseID != "" {
		query += " AND w.exercise_id = ?"
		args = append(args, exerciseID)
	}
	if startDate != "" {
		query += " AND w.date >= ?"
		args = append(args, startDate)
	}
	if endDate != "" {
		query += " AND w.date <= ?"
		args = append(args, endDate)
	}

	query += " ORDER BY w.date DESC, w.created_at DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	workouts := []models.Workout{}
	for rows.Next() {
		var w models.Workout
		var notes sql.NullString
		if err := rows.Scan(&w.ID, &w.ExerciseID, &w.ExerciseName, &w.MuscleGroup, &w.Date, &w.Sets, &w.Reps, &w.Weight, &notes, &w.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if notes.Valid {
			w.Notes = notes.String
		}
		workouts = append(workouts, w)
	}

	c.JSON(http.StatusOK, workouts)
}

func CreateWorkout(c *gin.Context) {
	var req models.CreateWorkoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := database.DB.Exec(
		"INSERT INTO workouts (exercise_id, date, sets, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?)",
		req.ExerciseID, req.Date, req.Sets, req.Reps, req.Weight, req.Notes,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Workout recorded successfully"})
}

func UpdateWorkout(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req models.UpdateWorkoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := "UPDATE workouts SET "
	args := []interface{}{}
	updates := []string{}

	if req.ExerciseID != 0 {
		updates = append(updates, "exercise_id = ?")
		args = append(args, req.ExerciseID)
	}
	if req.Date != "" {
		updates = append(updates, "date = ?")
		args = append(args, req.Date)
	}
	if req.Sets != 0 {
		updates = append(updates, "sets = ?")
		args = append(args, req.Sets)
	}
	if req.Reps != 0 {
		updates = append(updates, "reps = ?")
		args = append(args, req.Reps)
	}
	if req.Weight != 0 {
		updates = append(updates, "weight = ?")
		args = append(args, req.Weight)
	}
	if req.Notes != "" {
		updates = append(updates, "notes = ?")
		args = append(args, req.Notes)
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	query += joinStrings(updates, ", ") + " WHERE id = ?"
	args = append(args, id)

	result, err := database.DB.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workout not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workout updated successfully"})
}

func DeleteWorkout(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	result, err := database.DB.Exec("DELETE FROM workouts WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workout not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Workout deleted successfully"})
}

func joinStrings(strs []string, sep string) string {
	if len(strs) == 0 {
		return ""
	}
	result := strs[0]
	for i := 1; i < len(strs); i++ {
		result += sep + strs[i]
	}
	return result
}
