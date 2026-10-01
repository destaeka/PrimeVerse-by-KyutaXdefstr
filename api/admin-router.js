import data from "../lib/admin/data.js";
import productDelete from "../lib/admin/product-delete.js";
import productSave from "../lib/admin/product-save.js";
import promoDelete from "../lib/admin/promo-delete.js";
import promoSave from "../lib/admin/promo-save.js";
import restock from "../lib/admin/restock.js";
import settingsSave from "../lib/admin/settings-save.js";
import stockAdd from "../lib/admin/stock-add.js";
import stockImport from "../lib/admin/stock-import.js";
import stockList from "../lib/admin/stock-list.js";

const routes = {
  data,
  "product-delete": productDelete,
  "product-save": productSave,
  "promo-delete": promoDelete,
  "promo-save": promoSave,
  restock,
  "settings-save": settingsSave,
  "stock-add": stockAdd,
  "stock-import": stockImport,
  "stock-list": stockList
};

export default async function handler(req, res) {
  const path = new URL(req.url, "http://localhost").pathname;
  const parts = path.split("/").filter(Boolean);
  const route = parts[parts.indexOf("admin") + 1] || "";
  const fn = routes[route];

  if (!fn) {
    return res.status(404).json({ error: "Admin endpoint tidak ditemukan" });
  }

  return fn(req, res);
}
