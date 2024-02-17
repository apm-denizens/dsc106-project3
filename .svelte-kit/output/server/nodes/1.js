

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.bD3gj2UO.js","_app/immutable/chunks/scheduler.BvLojk_z.js","_app/immutable/chunks/index.DUi8B7a-.js","_app/immutable/chunks/entry.8WmpQ4A7.js"];
export const stylesheets = [];
export const fonts = [];
