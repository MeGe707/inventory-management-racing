import mongoose from "mongoose";

const thrashItemSchema = new mongoose.Schema({
  // — item snapshot (itemSchema ile aynı alanlar) —
  name:         { type: String, required: true },
  component:    { type: String, required: true },
  brandName:    { type: String, required: true },
  supplierName: { type: String, required: true },
  serialNumber: { type: String, required: true },
  quantity:     { type: Number, required: true },
  threshold:    { type: Number },
  price:        { type: Number },
  location:     { type: String, required: true },
  isFrequentlyUsed: { type: Boolean, default: false },
  addedOn:      { type: String, required: true },
  addedBy:      { type: String, required: true },
  lastUpdatedOn:{ type: String },
  lastUpdatedBy:{ type: String, required: true },
  allUpdates: [
    {
      updatedBy: { type: String, required: true },
      updatedAt: { type: String, required: true },
    },
  ],
  description:  { type: String, default: "" },

  // — deletion metadata —
  deletedOn: { type: String, required: true },
  deletedBy: { type: String, required: true },
  isDeleted: { type: Boolean, default: true },


});

const thrashItemModel =
  mongoose.models.thrashItem || mongoose.model("thrashItem", thrashItemSchema);

export default thrashItemModel;
