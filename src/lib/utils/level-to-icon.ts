import { TIssueLevel } from '../types/issue-level.types';

export const levelToIcon = (level: TIssueLevel): string => (level ? (level === 'err' ? '❌ ' : '⚠️ ') : '');
