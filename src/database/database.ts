import { MMKV } from 'react-native-mmkv';

//mmkv
const DATABASE_USERS = 'user';
const DATABASE_TOKENS = 'token';
const DATABASE_CONFIGS = 'config';

export const storageUser = new MMKV({ id: `${DATABASE_USERS}` });
export const storageToken = new MMKV({ id: `${DATABASE_TOKENS}` });
export const storageConfig = new MMKV({ id: `${DATABASE_CONFIGS}` });

export { DATABASE_TOKENS, DATABASE_USERS, DATABASE_CONFIGS };
