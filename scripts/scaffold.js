#!/usr/bin/env node
/**
 * GoalFlow — генератор структуры проекта.
 *
 * Создаёт директории и пустые файлы согласно ТЗ.
 * Идемпотентен: существующие файлы не трогает.
 *
 * Запуск:
 *   node scripts/scaffold.js
 *   node scripts/scaffold.js --force   # перезаписать существующие (пустыми)
 *   node scripts/scaffold.js --dry     # только показать план
 */

const fs = require('fs');
const path = require('path');

// --- Конфигурация ---

const ROOT = process.cwd();

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY = args.includes('--dry');
const VERBOSE = args.includes('--verbose') || args.includes('-v');

/**
 * Структура проекта.
 * Значение — либо строка (файл), либо объект (директория).
 */
const STRUCTURE = {
  'client': {
    'src': {
      'app': {
        'core': {
          'api': {
            'goals.api.ts': '',
            'projects.api.ts': '',
            'tasks.api.ts': '',
            'time.api.ts': '',
            'tags.api.ts': '',
            'export.api.ts': '',
            'http.client.ts': '',
          },
          'models': {
            'goal.model.ts': '',
            'project.model.ts': '',
            'task.model.ts': '',
            'time-entry.model.ts': '',
            'settings.model.ts': '',
          },
          'services': {
            'goals.service.ts': '',
            'projects.service.ts': '',
            'tasks.service.ts': '',
            'time.service.ts': '',
            'tags.service.ts': '',
            'timer.service.ts': '',
            'filters.service.ts': '',
            'hotkeys.service.ts': '',
            'toast.service.ts': '',
          },
          'store': {
            'app.store.ts': '',
          },
        },
        'shared': {
          'components': {
            'button': { 'button.component.ts': '', 'button.component.html': '', 'button.component.scss': '' },
            'modal': { 'modal.component.ts': '', 'modal.component.html': '', 'modal.component.scss': '' },
            'toast': { 'toast.component.ts': '', 'toast.component.html': '', 'toast.component.scss': '' },
            'progress-bar': { 'progress-bar.component.ts': '', 'progress-bar.component.html': '', 'progress-bar.component.scss': '' },
            'icon': { 'icon.component.ts': '', 'icon.component.html': '' },
          },
          'pipes': {
            'duration.pipe.ts': '',
          },
          'directives': {
            'autofocus.directive.ts': '',
          },
        },
        'features': {
          'sidebar': {
            'sidebar.component.ts': '',
            'sidebar.component.html': '',
            'sidebar.component.scss': '',
            'presets.component.ts': '',
            'tree.component.ts': '',
          },
          'task-list': {
            'task-list.component.ts': '',
            'task-list.component.html': '',
            'task-list.component.scss': '',
            'task-row.component.ts': '',
            'task-row.component.html': '',
            'task-row.component.scss': '',
          },
          'task-card': {
            'task-card.component.ts': '',
            'task-card.component.html': '',
            'task-card.component.scss': '',
          },
          'quick-capture': {
            'quick-capture.component.ts': '',
            'quick-capture.component.html': '',
            'quick-capture.component.scss': '',
          },
          'command-palette': {
            'command-palette.component.ts': '',
            'command-palette.component.html': '',
            'command-palette.component.scss': '',
          },
          'filters': {
            'filters-popover.component.ts': '',
            'filters-popover.component.html': '',
            'filters-popover.component.scss': '',
            'search-bar.component.ts': '',
          },
          'timer': {
            'timer-badge.component.ts': '',
            'timer-badge.component.html': '',
            'timer-badge.component.scss': '',
          },
        },
        'app.component.ts': '',
        'app.component.html': '',
        'app.component.scss': '',
        'app.config.ts': '',
        'app.routes.ts': '',
      },
      'assets': {},
      'styles': {
        '_variables.scss': '',
        '_mixins.scss': '',
        'main.scss': '',
      },
      'index.html': '',
      'main.ts': '',
    },
    'package.json': '',
    'tsconfig.json': '',
    'tsconfig.app.json': '',
    'angular.json': '',
  },

  'server': {
    'src': {
      'middleware': {
        'error.ts': '',
      },
      'utils': {
        'http.ts': '',
        'cascade.ts': '',
        'progress.ts': '',
        'timer.ts': '',
      },
      'services': {
        'goals.service.ts': '',
        'projects.service.ts': '',
        'tasks.service.ts': '',
        'time.service.ts': '',
        'export.service.ts': '',
      },
      'routes': {
        'goals.routes.ts': '',
        'projects.routes.ts': '',
        'tasks.routes.ts': '',
        'time.routes.ts': '',
        'tags.routes.ts': '',
        'export.routes.ts': '',
      },
      'config.ts': '',
      'storage.ts': '',
      'schemas.ts': '',
      'index.ts': '',
    },
    'data': {
      'goals.json': '',
      'projects.json': '',
      'tasks.json': '',
      'timeEntries.json': '',
      'settings.json': '',
    },
    'package.json': '',
    'tsconfig.json': '',
  },

  'scripts': {
    'scaffold.js': '',
  },

  'docs': {
    'GoalFlow-TZ.md': '',
    'GoalFlow-product.md': '',
  },

  '.gitignore': '',
  'README.md': '',
  'package.json': '',
};

// --- Логика ---

const stats = {
  dirsCreated: 0,
  dirsExisted: 0,
  filesCreated: 0,
  filesSkipped: 0,
  filesOverwritten: 0,
};

function log(msg) {
  if (DRY || VERBOSE) console.log(msg);
}

function ensureDir(absPath) {
  if (DRY) {
    log(`[dry] mkdir  ${path.relative(ROOT, absPath)}`);
    return;
  }
  if (fs.existsSync(absPath)) {
    stats.dirsExisted++;
    return;
  }
  fs.mkdirSync(absPath, { recursive: true });
  stats.dirsCreated++;
  log(`mkdir  ${path.relative(ROOT, absPath)}`);
}

function ensureFile(absPath, content = '') {
  if (DRY) {
    log(`[dry] touch  ${path.relative(ROOT, absPath)}`);
    return;
  }
  if (fs.existsSync(absPath)) {
    if (FORCE) {
      fs.writeFileSync(absPath, content, 'utf-8');
      stats.filesOverwritten++;
      log(`force  ${path.relative(ROOT, absPath)}`);
    } else {
      stats.filesSkipped++;
      return;
    }
  } else {
    fs.writeFileSync(absPath, content, 'utf-8');
    stats.filesCreated++;
    log(`touch  ${path.relative(ROOT, absPath)}`);
  }
}

function walk(node, currentPath) {
  if (typeof node === 'string') {
    ensureFile(currentPath, node);
    return;
  }
  if (node === null || node === undefined) {
    ensureFile(currentPath, '');
    return;
  }
  // объект — директория
  ensureDir(currentPath);
  for (const [name, child] of Object.entries(node)) {
    walk(child, path.join(currentPath, name));
  }
}

function printSummary() {
  console.log('');
  console.log('--- scaffold summary ---');
  console.log(`directories created:   ${stats.dirsCreated}`);
  console.log(`directories existed:   ${stats.dirsExisted}`);
  console.log(`files created:         ${stats.filesCreated}`);
  console.log(`files skipped:         ${stats.filesSkipped}`);
  console.log(`files overwritten:     ${stats.filesOverwritten}`);
  if (DRY) console.log('(dry run — ничего не записано)');
}

function main() {
  console.log(`GoalFlow scaffold`);
  console.log(`root:   ${ROOT}`);
  console.log(`mode:   ${DRY ? 'dry-run' : FORCE ? 'force' : 'safe'}`);
  console.log('');

  // .gitignore и README создаём осмысленными, а не пустыми
  const seedFiles = {
    '.gitignore': [
      'node_modules/',
      'dist/',
      'server/data/*.tmp',
      '*.log',
      '.DS_Store',
      '.env',
      '',
    ].join('\n'),
    'package.json': JSON.stringify(
      {
        name: 'goalflow',
        version: '1.0.0',
        private: true,
        scripts: {
          scaffold: 'node scripts/scaffold.js',
        },
      },
      null,
      2,
    ) + '\n',
  };

  walk(STRUCTURE, ROOT);

  // Перезаписываем seed-файлы, если они пустые или их нет
  for (const [name, content] of Object.entries(seedFiles)) {
    const abs = path.join(ROOT, name);
    if (!fs.existsSync(abs) || fs.readFileSync(abs, 'utf-8').trim() === '') {
      if (!DRY) fs.writeFileSync(abs, content, 'utf-8');
      log(`seed   ${name}`);
    }
  }

  printSummary();
}

main();