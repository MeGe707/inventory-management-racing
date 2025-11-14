import mongoose from "mongoose";

const actionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // superadmin için yok
    },
    userName: {
      type: String, // 👈 Eklenen alan
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        "CREATE_ITEM", "UPDATE_ITEM", "DELETE_ITEM",
        "CREATE_USER", "DELETE_USER",
        "CREATE_ADMIN", "DELETE_ADMIN", "PERMANENTLY_DELETE_ITEM", "RECOVER_ITEM"
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Item", "User", "Admin"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: {
      type: String,
    },
    
    before: {
      type: Object,
    },
    after: {
      type: Object,
    },
  },
  { timestamps: true }
);

const ActionLog = mongoose.model("ActionLog", actionLogSchema);
export default ActionLog;
