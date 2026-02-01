package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"training-recorder/database"
	"training-recorder/models"

	"github.com/gin-gonic/gin"
)

func GetPlans(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, name, description, created_at FROM plans ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	plans := []models.Plan{}
	for rows.Next() {
		var p models.Plan
		var desc sql.NullString
		if err := rows.Scan(&p.ID, &p.Name, &desc, &p.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if desc.Valid {
			p.Description = desc.String
		}
		plans = append(plans, p)
	}

	c.JSON(http.StatusOK, plans)
}

func GetPlan(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var plan models.Plan
	var desc sql.NullString
	err = database.DB.QueryRow(
		"SELECT id, name, description, created_at FROM plans WHERE id = ?",
		id,
	).Scan(&plan.ID, &plan.Name, &desc, &plan.CreatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if desc.Valid {
		plan.Description = desc.String
	}

	rows, err := database.DB.Query(`
		SELECT pe.id, pe.plan_id, pe.exercise_id, e.name, e.muscle_group, pe.target_sets, pe.target_reps, pe.order_index
		FROM plan_exercises pe
		JOIN exercises e ON pe.exercise_id = e.id
		WHERE pe.plan_id = ?
		ORDER BY pe.order_index
	`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	plan.Exercises = []models.PlanExercise{}
	for rows.Next() {
		var pe models.PlanExercise
		if err := rows.Scan(&pe.ID, &pe.PlanID, &pe.ExerciseID, &pe.ExerciseName, &pe.MuscleGroup, &pe.TargetSets, &pe.TargetReps, &pe.OrderIndex); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		plan.Exercises = append(plan.Exercises, pe)
	}

	c.JSON(http.StatusOK, plan)
}

func CreatePlan(c *gin.Context) {
	var req models.CreatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback()

	result, err := tx.Exec(
		"INSERT INTO plans (name, description) VALUES (?, ?)",
		req.Name, req.Description,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	planID, _ := result.LastInsertId()

	for i, ex := range req.Exercises {
		orderIndex := ex.OrderIndex
		if orderIndex == 0 {
			orderIndex = i + 1
		}
		_, err = tx.Exec(
			"INSERT INTO plan_exercises (plan_id, exercise_id, target_sets, target_reps, order_index) VALUES (?, ?, ?, ?, ?)",
			planID, ex.ExerciseID, ex.TargetSets, ex.TargetReps, orderIndex,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": planID, "message": "Plan created successfully"})
}

func UpdatePlan(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req models.UpdatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer tx.Rollback()

	if req.Name != "" || req.Description != "" {
		_, err = tx.Exec(
			"UPDATE plans SET name = COALESCE(NULLIF(?, ''), name), description = COALESCE(NULLIF(?, ''), description) WHERE id = ?",
			req.Name, req.Description, id,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if req.Exercises != nil {
		_, err = tx.Exec("DELETE FROM plan_exercises WHERE plan_id = ?", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		for i, ex := range req.Exercises {
			orderIndex := ex.OrderIndex
			if orderIndex == 0 {
				orderIndex = i + 1
			}
			_, err = tx.Exec(
				"INSERT INTO plan_exercises (plan_id, exercise_id, target_sets, target_reps, order_index) VALUES (?, ?, ?, ?, ?)",
				id, ex.ExerciseID, ex.TargetSets, ex.TargetReps, orderIndex,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plan updated successfully"})
}

func DeletePlan(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	result, err := database.DB.Exec("DELETE FROM plans WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plan deleted successfully"})
}
