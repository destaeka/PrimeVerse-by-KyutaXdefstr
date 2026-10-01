import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
function init(){if(getApps().length)return getApps()[0];const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON belum dikonfigurasi.");return initializeApp({credential:cert(JSON.parse(raw))});}
export function getAdminDb(){init();return getFirestore()} export function getAdminAuth(){init();return getAuth()}
export const appId=process.env.FIREBASE_APP_ID||"digistore-v3";
const base=()=>getAdminDb().collection("artifacts").doc(appId).collection("public").doc("data");
export const productsCollection=()=>base().collection("products");export const stockItemsCollection=()=>base().collection("stock_items");export const promosCollection=()=>base().collection("promo_codes");export const ordersCollection=()=>base().collection("orders");export const settingsDoc=()=>base().collection("site_config").doc("settings");
