export default function handler(req,res){
  try{
    res.setHeader("Cache-Control","public,max-age=300");

    const raw=String(process.env.FIREBASE_WEB_CONFIG_JSON||"").trim();

    if(!raw) throw new Error("FIREBASE_WEB_CONFIG_JSON kosong");

    let firebaseConfig;

    try{
      firebaseConfig=JSON.parse(raw);
    }catch{
      firebaseConfig=JSON.parse(
        raw.replace(/^['"]|['"]$/g,"").replace(/\\"/g,'"')
      );
    }

    res.json({
      appId:process.env.FIREBASE_APP_ID||"digistore-v3",
      firebaseConfig
    });
  }catch(e){
    console.error("FIREBASE_CONFIG_ERROR:",e.message);
    res.status(500).json({error:"Firebase web config invalid"});
  }
}
