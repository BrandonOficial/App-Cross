# 02 Business Domain

## Core Entities
1. **User**
   - Represents the athlete using the application.
   - Holds preferences and authentication data.
2. **Exercise**
   - A dictionary of movements (e.g., Squat, Bench Press, Deadlift).
   - Contains metadata like target muscle groups and equipment required.
3. **Routine**
   - A predefined template of exercises (e.g., "Push Day", "Pull Day").
   - Can have targeted sets and reps.
4. **Workout (Session)**
   - An active or completed instance of a routine.
   - Contains a start time, end time, and a collection of logged sets.
5. **Set**
   - The actual performance data: reps, weight, RPE (Rate of Perceived Exertion), and rest time.

## Key Workflows
- **Routine Creation**: Users can compose routines by selecting exercises from the global dictionary.
- **Active Workout Tracking**: Users start a routine, log each set iteratively, and use an integrated rest timer. Zustand handles this active state.
- **Progress Tracking**: Users can view volume and 1RM (One Rep Max) progression over time using Recharts visualizations.
