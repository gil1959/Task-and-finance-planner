import type { Task } from "./types" // Fixed import path to use types file

/**
 * Calculates task priority score based on deadline urgency, user weight, and estimated hours
 * Higher score = higher priority
 */
export function calculateTaskScore(task: Task): number {
  const now = Date.now()
  const due = new Date(task.dueDate).getTime()

  // Calculate days left (minimum 0.001 to avoid division by zero)
  const daysLeft = Math.max((due - now) / (1000 * 60 * 60 * 24), 0.001)

  // Calculate factors
  const deadlineFactor = 1 / daysLeft // Closer deadline = higher factor
  const weightFactor = task.weight / 5 // Weight 1-5 normalized to 0.2-1.0
  const estFactor = 1 / Math.max(task.estHours, 0.5) // Shorter tasks can be prioritized if urgent

  // Calculate raw score with weighted contributions
  const scoreRaw = deadlineFactor * 0.6 + weightFactor * 0.3 + estFactor * 0.1

  // Normalize to 0-100 scale
  const score = Math.min(Math.round(scoreRaw * 10), 100)

  return score
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const scoreA = calculateTaskScore(a)
    const scoreB = calculateTaskScore(b)

    // Sort by score (desc), then by due date (asc)
    if (scoreA !== scoreB) {
      return scoreB - scoreA
    }

    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}
