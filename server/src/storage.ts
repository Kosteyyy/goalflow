import fs from 'fs-extra';
import { config } from './config';
import type { Goal, Project, Task, TimeEntry, Settings } from './schemas';

export interface DataStore {
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  settings: Settings;
}

const defaultSettings: Settings = {
  maxTimerHours: 8,
  theme: 'light',
};

class Storage {
  private data: DataStore = {
    goals: [],
    projects: [],
    tasks: [],
    timeEntries: [],
    settings: { ...defaultSettings },
  };

  private locks = new Map<keyof DataStore, Promise<void>>();

  async init(): Promise<void> {
    await fs.ensureDir(config.dataDir);
    this.data.goals = await readJson(config.files.goals, []);
    this.data.projects = await readJson(config.files.projects, []);
    this.data.tasks = await readJson(config.files.tasks, []);
    this.data.timeEntries = await readJson(config.files.timeEntries, []);
    this.data.settings = await readJson(config.files.settings, { ...defaultSettings });

    // Пишем settings.json, если файла не было
    await fs.ensureFile(config.files.settings);
    const raw = await fs.readFile(config.files.settings, 'utf-8');
    if (!raw.trim()) {
      await fs.writeJson(config.files.settings, this.data.settings, { spaces: 2 });
    }
  }

  get goals(): Goal[] { return this.data.goals; }
  set goals(v: Goal[]) { this.data.goals = v; }
  get projects(): Project[] { return this.data.projects; }
  set projects(v: Project[]) { this.data.projects = v; }
  get tasks(): Task[] { return this.data.tasks; }
  set tasks(v: Task[]) { this.data.tasks = v; }
  get timeEntries(): TimeEntry[] { return this.data.timeEntries; }
  set timeEntries(v: TimeEntry[]) { this.data.timeEntries = v; }
  get settings(): Settings { return this.data.settings; }

  async save(key: keyof DataStore): Promise<void> {
    const prev = this.locks.get(key) ?? Promise.resolve();
    const next = prev.then(() => this.writeFile(key)).catch((err) => {
      console.error(`[storage] write failed for ${key}:`, err);
    });
    this.locks.set(key, next);
    return next;
  }

  async saveAll(): Promise<void> {
    await Promise.all([
      this.save('goals'),
      this.save('projects'),
      this.save('tasks'),
      this.save('timeEntries'),
      this.save('settings'),
    ]);
  }

  async replaceAll(data: DataStore): Promise<void> {
    this.data = data;
    await this.saveAll();
  }

  private async writeFile(key: keyof DataStore): Promise<void> {
    const file = config.files[key];
    const tmp = `${file}.tmp`;
    const value = this.data[key];
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), 'utf-8');
    await fs.rename(tmp, file);
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    if (!(await fs.pathExists(file))) return fallback;
    const raw = await fs.readFile(file, 'utf-8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[storage] failed to read ${file}, using fallback`, err);
    return fallback;
  }
}

export const storage = new Storage();
