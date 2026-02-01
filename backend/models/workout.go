package models

import "time"

type Workout struct {
	ID           int64     `json:"id"`
	ExerciseID   int64     `json:"exercise_id"`
	ExerciseName string    `json:"exercise_name,omitempty"`
	MuscleGroup  string    `json:"muscle_group,omitempty"`
	Date         string    `json:"date"`
	Sets         int       `json:"sets"`
	Reps         int       `json:"reps"`
	Weight       float64   `json:"weight"`
	Notes        string    `json:"notes"`
	CreatedAt    time.Time `json:"created_at"`
}

type CreateWorkoutRequest struct {
	ExerciseID int64   `json:"exercise_id" binding:"required"`
	Date       string  `json:"date" binding:"required"`
	Sets       int     `json:"sets" binding:"required,min=1"`
	Reps       int     `json:"reps" binding:"required,min=1"`
	Weight     float64 `json:"weight" binding:"required,min=0"`
	Notes      string  `json:"notes"`
}

type UpdateWorkoutRequest struct {
	ExerciseID int64   `json:"exercise_id"`
	Date       string  `json:"date"`
	Sets       int     `json:"sets"`
	Reps       int     `json:"reps"`
	Weight     float64 `json:"weight"`
	Notes      string  `json:"notes"`
}
