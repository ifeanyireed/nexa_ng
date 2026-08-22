package main

import "backend/handlers"

func registerRoutes() {
	registerRoute("/users", handlers.HandleUsers)
	registerRoute("/objectives", handlers.HandleObjectives)
	registerRoute("/cycles", handlers.HandleCycles)
	registerRoute("/reviews", handlers.HandleReviews)
	registerRoute("/seed", handlers.HandleSeed)
	registerRoute("/send-reset-email", handlers.HandleSendResetEmail)
	registerRoute("/send-bulk-notification", handlers.HandleSendBulkNotification)
	registerRoute("/update-password", handlers.HandleUpdatePassword)
	registerRoute("/quests", handlers.HandleQuests)
	registerRoute("/quests/detail", handlers.HandleQuestDetail)
	registerRoute("/quests/teams", handlers.HandleQuestTeams)
	registerRoute("/quests/challenges", handlers.HandleQuestChallenges)
	registerRoute("/quests/scoreboard", handlers.HandleQuestScoreboard)
	registerRoute("/quests/scores", handlers.HandleQuestScores)
}
