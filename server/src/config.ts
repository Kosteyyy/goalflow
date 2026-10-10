import path from 'path';

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'data');

export const config = {
  port: Number(process.env.PORT) || 3000,
  dataDir,
  files: {
    goals: path.join(dataDir, 'goals.json'),
    projects: path.join(dataDir, 'projects.json'),
    tasks: path.join(dataDir, 'tasks.json'),
    timeEntries: path.join(dataDir, 'timeEntries.json'),
    settings: path.join(dataDir, 'settings.json'),
  },
  maxTimerMinutes: 480, // 8 часов
  exportVersion: '1.0',
};
