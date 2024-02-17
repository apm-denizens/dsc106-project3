export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "docs/_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.ChhP0_e-.js","app":"_app/immutable/entry/app.DREfv6RZ.js","imports":["_app/immutable/entry/start.ChhP0_e-.js","_app/immutable/chunks/entry.8WmpQ4A7.js","_app/immutable/chunks/scheduler.BvLojk_z.js","_app/immutable/entry/app.DREfv6RZ.js","_app/immutable/chunks/scheduler.BvLojk_z.js","_app/immutable/chunks/index.DUi8B7a-.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
