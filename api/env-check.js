export default function handler(req,res){
  const v=process.env.FIREBASE_WEB_CONFIG_JSON;
  let parsed=false;
  try {
    JSON.parse(v || "");
    parsed=true;
  } catch {}
  res.json({
    exists: !!v,
    length: v ? v.length : 0,
    validJson: parsed
  });
}
