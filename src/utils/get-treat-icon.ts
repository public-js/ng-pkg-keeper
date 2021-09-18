import { TTreatTypes } from '../types';

export function getTreatIcon(treat: TTreatTypes): string {
    return treat ? (treat === 'err' ? '❌ ' : '⚠️ ') : '';
}
