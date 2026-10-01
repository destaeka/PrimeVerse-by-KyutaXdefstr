import {getAdminDb,ordersCollection,stockItemsCollection} from "../_lib/firebase.js";
import {getPakasirTransaction} from "../_lib/pakasir.js";
export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  try{
    const b=typeof req.body==="string"?JSON.parse(req.body):(req.body||{}),id=String(b.orderId||"");
    const oref=ordersCollection().doc(id), os=await oref.get();
    if(!os.exists)return res.status(404).json({error:"Order tidak ditemukan"});
    const o=os.data();
    if(o.status==="fulfilled")return res.json({ok:true,accountData:o.accountData});

    const t=await getPakasirTransaction({orderId:id,amount:Number(o.amount)});
    if(String(t.status).toLowerCase()!=="completed")return res.status(409).json({error:"Pembayaran belum terverifikasi"});

    let delivered;
    await getAdminDb().runTransaction(async tx=>{
      const fresh=(await tx.get(oref)).data();
      if(fresh.status==="fulfilled"){delivered=fresh.accountData;return;}
      if(fresh.stockItemId){
        const sr=stockItemsCollection().doc(fresh.stockItemId), ss=await tx.get(sr);
        if(!ss.exists)throw Error("Stok akun tidak ditemukan");
        const item=ss.data();
        if(item.status==="sold" && item.orderId===id){
          delivered=item.accountData;
        }else{
          if(item.status!=="reserved" || item.orderId!==id)throw Error("Stok tidak cocok untuk order");
          delivered=item.accountData;
          tx.update(sr,{status:"sold",soldAt:new Date().toISOString(),orderId:id});
        }
      }else throw Error("Order tidak memiliki stok item");
      tx.update(oref,{status:"fulfilled",paymentVerified:true,paidAt:new Date().toISOString(),fulfilledAt:new Date().toISOString(),accountData:delivered});
    });
    return res.json({ok:true,accountData:delivered});
  }catch(e){console.error(e);return res.status(409).json({error:e.message||"Fulfillment gagal"});}
}
