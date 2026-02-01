package models

import "time"

type Goal struct {
	ID           int64     `json:"id"`
	ExerciseID   int64     `json:"exercise_id"`
	ExerciseName string    `json:"exercise_name,omitempty"`
	MuscleGroup  string    `json:"muscle_group,omitempty"`
	TargetWeight float64   `json:"target_weight"`
	TargetReps   int       `json:"target_reps"`
	Deadline     string    `json:"deadline"`
	Achieved     bool      `json:"achieved"`
	CurrentMax   float64   `json:"current_max,omitempty"`
	Progress     float64   `json:"progress,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type CreateGoalRequest struct {
	ExerciseID   int64   `json:"exercise_id" binding:"required"`
	TargetWeight float64 `json:"target_weight" binding:"required,min=0"`
	TargetReps   int     `json:"target_reps" binding:"required,min=1"`
	Deadline     string  `json:"deadline"`
}

type UpdateGoalRequest struct {
	ExerciseID   int64   `json:"exercise_id"`
	TargetWeight float64 `json:"target_weight"`
	TargetReps   int     `json:"target_reps"`
	Deadline     string  `json:"deadline"`
	Achieved     *bool   `json:"achieved"`
}
