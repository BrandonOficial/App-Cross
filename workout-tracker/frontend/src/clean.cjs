const fs = require('fs');
const files = [
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/routines/RoutinesScreen.tsx',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/routines/hooks/useRoutines.ts',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/routines/components/UserRoutinesSection.tsx',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/routines/components/RoutineCard.tsx',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/routines/components/QuickStartBanner.tsx',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/profile/ProfileScreen.tsx',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/history/hooks/useHistory.ts',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/dashboard/components/LastSession.tsx',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/dashboard/components/StatsOverview.tsx',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/history/HistoryScreen.tsx',
    'c:/Users/55199/OneDrive/Documentos/estudos/App-Cross/workout-tracker/frontend/src/features/dashboard/components/WeeklyProgress.tsx'
];
files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix imports
    content = content.replace(/,\s*TEST_USER_ID/g, '');
    content = content.replace(/TEST_USER_ID,\s*/g, '');
    
    // Fix query keys
    content = content.replace(/,\s*TEST_USER_ID\]/g, ']');
    content = content.replace(/,\s*'sessions',\s*TEST_USER_ID\]/g, ", 'sessions']");
    content = content.replace(/,\s*'progress',\s*exerciseId,\s*TEST_USER_ID\]/g, ", 'progress', exerciseId]");
    
    // Fix function calls
    content = content.replace(/\(TEST_USER_ID,\s*/g, '(');
    content = content.replace(/\(TEST_USER_ID\)/g, '()');
    content = content.replace(/userId:\s*TEST_USER_ID,\s*/g, '');
    content = content.replace(/userId:\s*TEST_USER_ID/g, '');

    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
});
