package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"training-recorder/database"
	"training-recorder/models"

	"github.com/gin-gonic/gin"
)

func GetGoals(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT g.id, g.exercise_id, e.name, e.muscle_group, g.target_weight, g.target_reps, g.deadline, g.achieved, g.created_at,
			COALESCE((SELECT MAX(weight) FROM workouts WHERE exercise_id = g.exercise_id), 0) as current_max
		FROM goals g
		JOIN exercises e ON g.exercise_id = e.id
		ORDER BY g.achieved ASC, g.deadline ASC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	goals := []models.Goal{}
	for rows.Next() {
		var g models.Goal
		var deadline sql.NullString
		if err := rows.Scan(&g.ID, &g.ExerciseID, &g.ExerciseName, &g.MuscleGroup, &g.TargetWeight, &g.TargetReps, &deadline, &g.Achieved, &g.CreatedAt, &g.CurrentMax); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if deadline.Valid {
			g.Deadline = deadline.String
		}
		if g.TargetWeight > 0 {
			g.Progress = (g.CurrentMax / g.TargetWeight) * 100
			if g.Progress > 100 {
				g.Progress = 100
			}
		}
		goals = append(goals, g)
	}

	c.JSON(http.StatusOK, goals)
}

func CreateGoal(c *gin.Context) {
	var req models.CreateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := database.DB.Exec(
		"INSERT INTO goals (exercise_id, target_weight, target_reps, deadline) VALUES (?, ?, ?, ?)",
		req.ExerciseID, req.TargetWeight, req.TargetReps, req.Deadline,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Goal created successfully"})
}

func UpdateGoal(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req models.UpdateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := "UPDATE goals SET "
	args := []interface{}{}
	updates := []string{}

	if req.ExerciseID != 0 {
		updates = append(updates, "exercise_id = ?")
		args = append(args, req.ExerciseID)
	}
	if req.TargetWeight != 0 {
		updates = append(updates, "target_weight = ?")
		args = append(args, req.TargetWeight)
	}
	if req.TargetReps != 0 {
		updates = append(updates, "target_reps = ?")
		args = append(args, req.TargetReps)
	}
	if req.Deadline != "" {
		updates = append(updates, "deadline = ?")
		args = append(args, req.Deadline)
	}
	if req.Achieved != nil {
		updates = append(updates, "achieved = ?")
		args = append(args, *req.Achieved)
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Goal not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Goal updated successfully"})
}

func DeleteGoal(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	result, err := database.DB.Exec("DELETE FROM goals WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Goal not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Goal deleted successfully"})
}
