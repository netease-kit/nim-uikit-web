const fs = require('fs')
const path = require('path')

const files = fs.readdirSync(path.resolve(__dirname, './packages'))

const scopes = files.filter((item) => !item.startsWith('.')).concat('workspace')

module.exports = {
  disableEmoji: false,
  format: '{type}{scope}: {emoji}{subject}',
  list: [
    'test',
    'feat',
    'fix',
    'api',
    'dependency',
    'compat',
    'known',
    'behavior',
    'chore',
    'docs',
    'refactor',
    'style',
    'ci',
    'perf',
  ],
  effects: scopes,
  maxMessageLength: 200,
  minMessageLength: 3,
  questions: [
    'type',
    'scope',
    'subject',
    'body',
    'breaking',
    'issues',
    'lerna',
  ],
  scopes: scopes,
  types: {
    feat: {
      description: 'A new feature',
      title: 'New Features',
      emoji: '🎸',
      value: 'feat',
    },
    fix: {
      description: 'A bug fix',
      emoji: '🐛',
      title: 'Bug Fixes',
      value: 'fix',
    },
    api: {
      description: 'api变更',
      title: 'API Changes',
      emoji: '🛠',
      value: 'api',
    },
    dependency: {
      description: '依赖库变更说明',
      title: 'Dependency Updates',
      emoji: '📚',
      value: 'dependency',
    },
    compat: {
      description:
        '目前兼容的im和rtc版本, 如Compatible with NERTC version 1.0.0',
      title: 'Compatibility',
      emoji: '⚙️',
      value: 'compat',
    },
    known: {
      description: '已知问题说明',
      title: 'Known issues',
      emoji: '📦',
      value: 'known',
    },
    behavior: {
      description: '行为变更',
      title: 'Behavior changes',
      emoji: '♻️',
      value: 'behavior',
    },
    chore: {
      description: 'Build process or auxiliary tool changes',
      emoji: '🤖',
      value: 'chore',
    },
    ci: {
      description: 'CI related changes',
      emoji: '🎡',
      value: 'ci',
    },
    docs: {
      description: 'Documentation only changes',
      emoji: '✏️',
      value: 'docs',
    },
    perf: {
      description: 'A code change that improves performance',
      emoji: '⚡️',
      value: 'perf',
    },
    refactor: {
      description: 'A code change that neither fixes a bug or adds a feature',
      emoji: '💡',
      value: 'refactor',
    },
    release: {
      description: 'Create a release commit',
      emoji: '🏹',
      value: 'release',
    },
    style: {
      description: 'Markup, white-space, formatting, missing semi-colons...',
      emoji: '💄',
      value: 'style',
    },
    test: {
      description: 'Adding missing tests',
      emoji: '💍',
      value: 'test',
    },
  },
}
