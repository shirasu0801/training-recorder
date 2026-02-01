package models

import "time"

type Exercise struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	MuscleGroup string    `json:"muscle_group"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateExerciseRequest struct {
	Name        string `json:"name" binding:"required"`
	MuscleGroup string `json:"muscle_group" binding:"required"`
}

type UpdateExerciseRequest struct {
	Name        string `json:"name"`
	MuscleGroup string `json:"muscle_group"`
}
