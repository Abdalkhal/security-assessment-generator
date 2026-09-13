// firebase/auth's published type definitions do not include the React Native
// entry point's `getReactNativePersistence`, even though it exists at runtime
// (see node_modules/@firebase/auth/dist/index.rn.d.ts). This augments the
// module so the import type-checks against the real runtime export.
// The `export {}` below is required so TS treats this file as a module and
// merges the block below into the real 'firebase/auth' types instead of
// replacing them.
export {};

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
