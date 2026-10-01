import { FieldValue } from "firebase-admin/firestore";import {productsCollection,promosCollection,ordersCollection,stockItemsCollection} from "../../api/_lib/firebase.js";import {createPakasirTransaction} from "../../api/_lib/pakasir.js";
export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  try{
    const b=typeof req.body==="string"?JSON.parse(req.body):(req.body||{});
    const pid=String(b.productId||"").trim(), oid=String(b.orderId||"").trim();
    const code=String(b.promoCode||"").trim().toUpperCase();
    const method=["qris","payment_link"].includes(b.method)?b.method:"qris";
    if(!pid||!/^[A-Za-z0-9_-]{1,100}$/.test(pid)||!/^[A-Z0-9-]{4,80}$/i.test(oid))
      return res.status(400).json({error:"Order tidak valid"});

    const db=productsCollection().firestore;
    const oref=ordersCollection().doc(oid);
    const existing=await oref.get();
    if(existing.exists){
      const order=existing.data();
      if(order.txnId) return res.json({order_id:oid,txn_id:order.txnId,qr_string:order.qrString||null,payment_link:order.paymentLink||null,amount:order.amount,expired_at:order.expiredAt||null,access_token:order.accessToken});
    }

    let order;
    await db.runTransaction(async tx=>{
      const pref=productsCollection().doc(pid);
      const ps=await tx.get(pref);
      if(!ps.exists) throw Error("Produk tidak ditemukan");
      const product=ps.data();
      if(product.active===false) throw Error("Produk tidak tersedia");

      const price=Math.round(Number(product.price));
      if(!Number.isInteger(price)||price<500) throw Error("Harga produk tidak valid");

      const availableQ=await tx.get(stockItemsCollection().where("productId","==",pid).where("status","==","available").limit(1));
      if(availableQ.empty) throw Error("Stok habis");

      let discount=0;
      if(code){
        const pq=await tx.get(promosCollection().where("code","==",code).where("active","==",true).limit(1));
        if(!pq.empty){
          const x=pq.docs[0].data(),v=Number(x.value);
          discount=x.type==="percent"?Math.floor(price*Math.min(v,100)/100):Math.min(Math.floor(v),price);
        }
      }
      const amount=price-discount;
      if(amount<500) throw Error("Nominal minimum Rp500");

      const stockRef=availableQ.docs[0].ref;
      tx.update(stockRef,{status:"reserved",orderId:oid,reservedAt:new Date().toISOString()});
      order={orderId:oid,productId:pid,productName:String(product.name||""),basePrice:price,discount,amount,status:"pending",method,accessToken:crypto.randomUUID()+crypto.randomUUID(),stockItemId:stockRef.id,createdAt:new Date().toISOString()};
      tx.create(oref,order);
    });

    const t=await createPakasirTransaction({orderId:oid,amount:order.amount,method});
    await oref.set({txnId:t.txn_id||null,qrString:t.qr_string||null,paymentLink:t.payment_link||null,paymentMethod:t.payment_method||method,expiredAt:t.expired_at||null,updatedAt:new Date().toISOString()},{merge:true});
    return res.json({order_id:oid,txn_id:t.txn_id,qr_string:t.qr_string||null,payment_link:t.payment_link||null,amount:order.amount,expired_at:t.expired_at||null,access_token:order.accessToken});
  }catch(e){
    console.error(e);
    return res.status(400).json({error:e.message||"Gagal membuat transaksi"});
  }
}
