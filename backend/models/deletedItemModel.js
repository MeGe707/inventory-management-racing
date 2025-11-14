import mongoose from "mongoose";

const deletedItemSchema = new mongoose.Schema({
  // — orijinal item bilgileri —
  name:         { type: String, required: true },
  component:    { type: String, required: true },
  brandName:    { type: String, required: true },
  supplierName: { type: String, required: true },
  serialNumber: { type: String, required: true },
  quantity:     { type: Number, required: true },
  price:        { type: Number },
  location:     { type: String, required: true },
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

  // — silinme bilgileri —
  deletedOn:             { type: String, required: true },
  deletedBy:             { type: String, required: true },
  isDeleted:             { type: Boolean, default: true },  // çöp kutusu olduğu için true bırakıldı
  permanentlyDeletedOn:  { type: String },
  permanentlyDeletedBy:  { type: String },

});

const deletedItemModel =
  mongoose.models.deletedItem ||
  mongoose.model("deletedItem", deletedItemSchema);

export default deletedItemModel;
