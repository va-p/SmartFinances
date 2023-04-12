import { MMKV } from 'react-native-mmkv';

//mmkv
const DATABASE_TOKENS = 'token';
const DATABASE_USERS = 'user';
const DATABASE_CONFIGS = 'config';

export const storageConfig = new MMKV({ id: `${DATABASE_CONFIGS}` });
export const storageToken = new MMKV({ id: `${DATABASE_TOKENS}` });
export const storageUser = new MMKV({ id: `${DATABASE_USERS}` });

export { DATABASE_TOKENS, DATABASE_USERS, DATABASE_CONFIGS };
