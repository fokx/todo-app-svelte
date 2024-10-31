// src/lib/clients.js
/** @type {Map<string,(eventName:string,data:string)=>import('sveltekit-sse').Unsafe<void,Error>>} */
export const clients = new Map()