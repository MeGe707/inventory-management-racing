import userModel from "../models/userModel.js";
import itemModel from "../models/itemModel.js";
import thrashItemModel from "../models/thrashItemModel.js";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";

import jwt from "jsonwebtoken";
import ActionLog from "../models/actionModel.js";
import deletedItemModel from "../models/deletedItemModel.js";
import mongoose from "mongoose";


// ------------------------ SUPER ADMIN LOGIN ------------------------
export const superAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  if (
    email !== process.env.SUPERADMIN_EMAIL ||
    password !== process.env.SUPERADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: "00000",
      email,
      role: "superadmin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.status(200).json({
    message: "Superadmin login successful",
    token: token,
    role: "superadmin",
    success: true,
  });
};


// ------------------------ REGISTER ADMIN ------------------------
export const registerAdmin = async (req, res) => {
  const { name, email, password, phone, department } = req.body;

  if (!name || !email || !password || !department) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new userModel({
      name,
      email,
      password,
      phone,
      department,
      role: "admin",
    });

    await newUser.save();

    // ActionLog entry
    const actionLog = new ActionLog({
      userId: null,
      userName: "System",
      actionType: "CREATE_ADMIN",
      targetType: "User",
      targetId: newUser._id,
      description: `Admin "${newUser.name}" registered by system`,
      after: newUser.toObject(),
      createdAt: new Date(),
    });

    await actionLog.save();

    res
      .status(201)
      .json({ message: "Admin registered successfully", success: true });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ------------------------ ADMIN LOGIN ------------------------
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  const user = await userModel.findOne({ email });

  if (!user || user.role !== "admin" || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.status(200).json({
    message: "Admin login successful",
    success: true,
    token: token,
    role: user.role,
  });
};


// ------------------------ GET ALL ADMINS ------------------------
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await userModel.find({ role: "admin" }).select("-password");
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ------------------------ DELETE USER ------------------------
export const deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Please provide user ID" });
  }

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const deletedUserData = user.toObject();

    await userModel.findByIdAndDelete(id);

    // Get performer info
    let performer;
    if (req.user.id === "00000") {
      performer = { id: null, name: "Superadmin" };
    } else {
      const performerDoc = await userModel.findById(req.user.id).select("name");
      performer = performerDoc
        ? { id: req.user.id, name: performerDoc.name }
        : { id: null, name: "Unknown" };
    }

    // Action log
    const actionLog = new ActionLog({
      userId: performer.id,
      userName: performer.name,
      actionType: "DELETE_USER",
      targetType: "User",
      targetId: user._id,
      description: `User "${user.name}" deleted by ${performer.name}`,
      before: deletedUserData,
      createdAt: new Date(),
    });

    await actionLog.save();

    res
      .status(200)
      .json({ message: "User deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// ------------------------ DELETE ADMIN ------------------------
export const deleteAdmin = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Please provide admin ID" });
  }

  try {
    const admin = await userModel.findById(id);
    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    const deletedAdminData = admin.toObject();

    await userModel.findByIdAndDelete(id);

    // performer
    let performer;
    if (req.user.id === "00000") {
      performer = { id: null, name: "Superadmin" };
    } else {
      const performerDoc = await userModel.findById(req.user.id).select("name");
      performer = performerDoc
        ? { id: req.user.id, name: performerDoc.name }
        : { id: null, name: "Unknown" };
    }

    // Log
    const actionLog = new ActionLog({
      userId: performer.id,
      userName: performer.name,
      actionType: "DELETE_ADMIN",
      targetType: "Admin",
      targetId: admin._id,
      description: `Admin "${admin.name}" deleted by ${performer.name}`,
      before: deletedAdminData,
    });

    await actionLog.save();

    res
      .status(200)
      .json({ message: "Admin deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};


// ------------------------ PERMANENTLY DELETE TRASH ITEMS ------------------------
export const permanentlyDeleteThrashItems = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req?.user?.id;
    const { itemIds } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID list is required" });
    }

    // Performer
    let userName = "Superadmin";
    let realUserId = undefined;
    if (userId && userId !== "00000") {
      const user = await userModel.findById(userId).select("name");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      userName = user.name;
      realUserId = userId;
    }

    const now = new Date();
    const formatted = now.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const deletedIds = [];
    const logs = [];

    await session.withTransaction(async () => {
      for (const itemId of itemIds) {
        if (!mongoose.Types.ObjectId.isValid(itemId)) continue;

        const thrashItem = await thrashItemModel
          .findById(itemId)
          .session(session);
        if (!thrashItem) continue;

        const before = thrashItem.toObject();

        // Move to deleted items archive
        await deletedItemModel.create(
          [
            {
              name: thrashItem.name,
              component: thrashItem.component,
              brandName: thrashItem.brandName,
              supplierName: thrashItem.supplierName,
              serialNumber: thrashItem.serialNumber,
              quantity: thrashItem.quantity,
              price: thrashItem.price,
              threshold: thrashItem.threshold,
              location: thrashItem.location,
              isFrequentlyUsed: thrashItem.isFrequentlyUsed,
              addedOn: thrashItem.addedOn,
              addedBy: thrashItem.addedBy,
              lastUpdatedOn: thrashItem.lastUpdatedOn,
              lastUpdatedBy: thrashItem.lastUpdatedBy,
              allUpdates: thrashItem.allUpdates || [],
              description: thrashItem.description || "",
              deletedOn: thrashItem.deletedOn,
              deletedBy: thrashItem.deletedBy,
              isDeleted: true,
              permanentlyDeletedOn: formatted,
              permanentlyDeletedBy: userName,
            },
          ],
          { session }
        );

        // Remove from trash
        await thrashItemModel.deleteOne({ _id: itemId }, { session });

        // Log entry
        logs.push({
          userId: realUserId,
          userName,
          actionType: "PERMANENTLY_DELETE_ITEM",
          targetType: "Item",
          targetId: itemId,
          description: `Trash item "${thrashItem.name}" permanently deleted by ${userName}`,
          before,
          after: {
            permanentlyDeletedOn: formatted,
            permanentlyDeletedBy: userName,
          },
          createdAt: now,
        });

        deletedIds.push(itemId);
      }

      if (logs.length > 0) {
        await ActionLog.insertMany(logs, { session });
      }
    });

    return res.json({
      success: true,
      message: `${deletedIds.length} item(s) permanently deleted and moved to deletedItem archive.`,
      deletedIds,
    });
  } catch (error) {
    console.error("permanentlyDeleteThrashItems error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: Trash items could not be permanently deleted.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};


// ------------------------ GET DELETED ITEMS ------------------------
export const getDeletedItems = async (req, res) => {
  try {
    const items = await deletedItemModel
      .find({ isDeleted: true })
      .sort({ permanentlyDeletedOn: -1, deletedOn: -1, _id: -1 })
      .lean();

    const mapped = items.map((item) => ({
      id: item._id,
      name: item.name,
      component: item.component,
      brandName: item.brandName,
      supplierName: item.supplierName,
      serialNumber: item.serialNumber,
      quantity: item.quantity,
      threshold: item.threshold,
      price: item.price,
      location: item.location,
      isFrequentlyUsed: item.isFrequentlyUsed,
      description: item.description || "",
      addedOn: item.addedOn,
      addedBy: item.addedBy,
      lastUpdatedOn: item.lastUpdatedOn,
      lastUpdatedBy: item.lastUpdatedBy,
      allUpdates: item.allUpdates || [],
      deletedOn: item.deletedOn,
      deletedBy: item.deletedBy,
      permanentlyDeletedOn: item.permanentlyDeletedOn || null,
      permanentlyDeletedBy: item.permanentlyDeletedBy || null,
      isDeleted: item.isDeleted === true,
    }));

    return res.json({
      success: true,
      count: mapped.length,
      items: mapped,
    });
  } catch (error) {
    console.error("getDeletedItems error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: Could not fetch deleted items.",
      error: error.message,
    });
  }
};
