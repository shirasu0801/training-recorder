package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"training-recorder/database"
	"training-recorder/models"

	"github.com/gin-gonic/gin"
)

func GetExercises(c *gin.Context) {
	muscleGroup := c.Query("muscle_group")

	var rows *sql.Rows
	var err error

	if muscleGroup != "" {
		rows, err = database.DB.Query(
			"SELECT id, name, muscle_group, created_at FROM exercises WHERE muscle_group = ? ORDER BY name",
			muscleGroup,
		)
	} else {
		rows, err = database.DB.Query(
			"SELECT id, name, muscle_group, created_at FROM exercises ORDER BY muscle_group, name",
		)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	exercises := []models.Exercise{}
	for rows.Next() {
		var ex models.Exercise
		if err := rows.Scan(&ex.ID, &ex.Name, &ex.MuscleGroup, &ex.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		exercises = append(exercises, ex)
	}

	c.JSON(http.StatusOK, exercises)
}

func CreateExercise(c *gin.Context) {
	var req models.CreateExerciseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := database.DB.Exec(
		"INSERT INTO exercises (name, muscle_group) VALUES (?, ?)",
		req.Name, req.MuscleGroup,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Exercise created successfully"})
}

func UpdateExercise(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req models.UpdateExerciseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := database.DB.Exec(
		"UPDATE exercises SET name = COALESCE(NULLIF(?, ''), name), muscle_group = COALESCE(NULLIF(?, ''), muscle_group) WHERE id = ?",
		req.Name, req.MuscleGroup, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Exercise not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Exercise updated successfully"})
}

func DeleteExercise(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	result, err := database.DB.Exec("DELETE FROM exercises WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Exercise not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Exercise deleted successfully"})
}
