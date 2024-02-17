

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.BP-y8Pnp.js","_app/immutable/chunks/scheduler.BvLojk_z.js","_app/immutable/chunks/index.DUi8B7a-.js"];
export const stylesheets = [];
export const fonts = [];
