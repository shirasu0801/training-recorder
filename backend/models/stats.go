package models

type ExerciseStats struct {
	ExerciseID   int64            `json:"exercise_id"`
	ExerciseName string           `json:"exercise_name"`
	MuscleGroup  string           `json:"muscle_group"`
	MaxWeight    float64          `json:"max_weight"`
	MaxReps      int              `json:"max_reps"`
	TotalSets    int              `json:"total_sets"`
	TotalVolume  float64          `json:"total_volume"`
	History      []WorkoutHistory `json:"history"`
}

type WorkoutHistory struct {
	Date   string  `json:"date"`
	Weight float64 `json:"weight"`
	Reps   int     `json:"reps"`
	Sets   int     `json:"sets"`
	Volume float64 `json:"volume"`
}

type VolumeStats struct {
	Period      string          `json:"period"`
	TotalVolume float64         `json:"total_volume"`
	ByMuscle    []MuscleVolume  `json:"by_muscle"`
	Daily       []DailyVolume   `json:"daily"`
}

type MuscleVolume struct {
	MuscleGroup string  `json:"muscle_group"`
	Volume      float64 `json:"volume"`
}

type DailyVolume struct {
	Date   string  `json:"date"`
	Volume float64 `json:"volume"`
}

type PersonalRecord struct {
	ExerciseID   int64   `json:"exercise_id"`
	ExerciseName string  `json:"exercise_name"`
	MuscleGroup  string  `json:"muscle_group"`
	MaxWeight    float64 `json:"max_weight"`
	MaxReps      int     `json:"max_reps"`
	Date         string  `json:"date"`
}
