import createTransaction from "../lib/pakasir/create-transaction.js";
import fulfillOrder from "../lib/pakasir/fulfill-order.js";
import status from "../lib/pakasir/status.js";
import webhook from "../lib/pakasir/webhook.js";

const routes = {
  "create-transaction": createTransaction,
  "fulfill-order": fulfillOrder,
  status,
  webhook
};

export default async function handler(req, res) {
  const path = new URL(req.url, "http://localhost").pathname;
  const parts = path.split("/").filter(Boolean);
  const route = parts[parts.indexOf("api_pakasir") + 1] || "";
  const fn = routes[route];

  if (!fn) {
    return res.status(404).json({ error: "Pakasir endpoint tidak ditemukan" });
  }

  return fn(req, res);
}
