import { getAdminAuth } from "./firebase.js";
export async function requireAdmin(req){const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))throw Object.assign(new Error("Unauthorized"),{statusCode:401});const u=await getAdminAuth().verifyIdToken(h.slice(7));if(u.admin!==true)throw Object.assign(new Error("Forbidden"),{statusCode:403});return u}
export async function requireUser(req){const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))throw Object.assign(new Error("Unauthorized"),{statusCode:401});return getAdminAuth().verifyIdToken(h.slice(7))}
