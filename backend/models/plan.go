package models

import "time"

type Plan struct {
	ID          int64          `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Exercises   []PlanExercise `json:"exercises,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
}

type PlanExercise struct {
	ID           int64  `json:"id"`
	PlanID       int64  `json:"plan_id"`
	ExerciseID   int64  `json:"exercise_id"`
	ExerciseName string `json:"exercise_name,omitempty"`
	MuscleGroup  string `json:"muscle_group,omitempty"`
	TargetSets   int    `json:"target_sets"`
	TargetReps   int    `json:"target_reps"`
	OrderIndex   int    `json:"order_index"`
}

type CreatePlanRequest struct {
	Name        string                      `json:"name" binding:"required"`
	Description string                      `json:"description"`
	Exercises   []CreatePlanExerciseRequest `json:"exercises"`
}

type CreatePlanExerciseRequest struct {
	ExerciseID int64 `json:"exercise_id" binding:"required"`
	TargetSets int   `json:"target_sets" binding:"required,min=1"`
	TargetReps int   `json:"target_reps" binding:"required,min=1"`
	OrderIndex int   `json:"order_index"`
}

type UpdatePlanRequest struct {
	Name        string                      `json:"name"`
	Description string                      `json:"description"`
	Exercises   []CreatePlanExerciseRequest `json:"exercises"`
}
