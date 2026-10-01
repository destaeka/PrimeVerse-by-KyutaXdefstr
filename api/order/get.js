import { ordersCollection } from "../_lib/firebase.js";
export default async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  try{
    const id=String(req.query?.order_id||"").trim().toUpperCase();
    const token=String(req.query?.token||"").trim();
    if(!/^[A-Z0-9-]{4,80}$/.test(id)||token.length<32) return res.status(400).json({error:"Link order tidak valid"});
    const snap=await ordersCollection().doc(id).get();
    if(!snap.exists) return res.status(404).json({error:"Order tidak ditemukan"});
    const o=snap.data();
    if(String(o.accessToken||"")!==token) return res.status(404).json({error:"Order tidak ditemukan"});
    return res.json({orderId:o.orderId,productName:o.productName,amount:o.amount,status:o.status,createdAt:o.createdAt||null,paidAt:o.paidAt||null,fulfilledAt:o.fulfilledAt||null,accountData:o.status==="fulfilled"?o.accountData:null});
  }catch(e){ console.error(e); return res.status(500).json({error:"Gagal mengambil order"}); }
}
