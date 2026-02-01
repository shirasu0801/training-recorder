package main

import (
	"log"
	"training-recorder/database"
	"training-recorder/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()
	defer database.CloseDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		// Exercises
		api.GET("/exercises", handlers.GetExercises)
		api.POST("/exercises", handlers.CreateExercise)
		api.PUT("/exercises/:id", handlers.UpdateExercise)
		api.DELETE("/exercises/:id", handlers.DeleteExercise)

		// Workouts
		api.GET("/workouts", handlers.GetWorkouts)
		api.POST("/workouts", handlers.CreateWorkout)
		api.PUT("/workouts/:id", handlers.UpdateWorkout)
		api.DELETE("/workouts/:id", handlers.DeleteWorkout)

		// Plans
		api.GET("/plans", handlers.GetPlans)
		api.POST("/plans", handlers.CreatePlan)
		api.GET("/plans/:id", handlers.GetPlan)
		api.PUT("/plans/:id", handlers.UpdatePlan)
		api.DELETE("/plans/:id", handlers.DeletePlan)

		// Goals
		api.GET("/goals", handlers.GetGoals)
		api.POST("/goals", handlers.CreateGoal)
		api.PUT("/goals/:id", handlers.UpdateGoal)
		api.DELETE("/goals/:id", handlers.DeleteGoal)

		// Stats
		api.GET("/stats/exercise/:id", handlers.GetExerciseStats)
		api.GET("/stats/volume", handlers.GetVolumeStats)
		api.GET("/stats/records", handlers.GetPersonalRecords)
	}

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
