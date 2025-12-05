import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  component: { type: String, required: true },
  brandName: { type: String, required: true },
  supplierName: { type: String, required: true },
  serialNumber: { type: String, required: true },
  quantity: { type: Number, required: true },
  threshold: { type: Number },
  price: { type: Number},
  location: { type: String, required: true},
  isFrequentlyUsed: { type: Boolean, default: true },
  addedOn: { type: String, required: true },
  addedBy: { type: String, required: true },
  lastUpdatedOn: { type: String },
  lastUpdatedBy: { type: String, required: true },
  allUpdates: [
    {
      updatedBy: { type: String, required: true }, // kullanıcının ismi (ya da email vs.)
      updatedAt: { type: String, required: true },
    },
  ],
  description: { type: String, default: "" }, // yeni alan
});

const itemModel = mongoose.models.item || mongoose.model("item", itemSchema);
export default itemModel;
