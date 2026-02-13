import userModel from "../models/userModel.js";
import itemModel from "../models/itemModel.js";
import thrashItemModel from "../models/thrashItemModel.js";
import deletedItemModel from "../models/deletedItemModel.js";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";

import jwt from "jsonwebtoken";
import validator from "validator";

import ActionLog from "../models/actionModel.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mails/emails.js";
import mongoose from "mongoose";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    if (!name || !email || !password || !phone || !department) {
      return res.json({
        success: false,
        message: "Please fill in all fields",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const userData = {
      name: name,
      email: email.toLowerCase(),
      password: password,
      phone: phone,
      department: department,
      role: "user",
      verificationToken: verificationToken,
    };

    const newUser = new userModel(userData);
    await newUser.save();

    await sendVerificationEmail(newUser.email, verificationToken);

    // Log entry
    await ActionLog.create({
      userId: req.user?.id === "00000" ? undefined : req.user?.id, // Check if registered by admin
      userName:
        req.user?.id === "00000" ? "Superadmin" : req.user?.name || "Unknown",
      actionType: "CREATE_USER",
      targetType: "User",
      targetId: newUser._id,
      description: `User "${name}" registered by ${
        req.user?.id === "00000" ? "Superadmin" : req.user?.name || "Unknown"
      }`,
      after: newUser.toObject(),
    });

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users: " + error.message,
    });
  }
};

export const logInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Please fill in all fields",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.password !== password) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    const token = generateTokenAndSetCookie(res, user._id, user.email, "user");

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      role: user.role,
      user,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID not found" });
    }

    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addItem = async (req, res) => {
  try {
    const {
      name,
      component,
      brandName,
      supplierName,
      serialNumber,
      quantity,
      threshold,
      price,
      location,
      isFrequentlyUsed,
      description = "",
    } = req.body;

    const userId = req?.user?.id;
    let userName = "Superadmin";

    if (userId && userId !== "00000") {
      const user = await userModel.findById(userId).select("name");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      userName = user.name;
    }

    const now = new Date();
    const formatted = now.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const itemData = {
      name,
      component,
      brandName,
      supplierName,
      serialNumber,
      quantity,
      threshold,
      price,
      location,
      isFrequentlyUsed,
      addedOn: formatted,
      addedBy: userName,
      lastUpdatedOn: formatted,
      lastUpdatedBy: userName,
      allUpdates: [{ updatedBy: userName, updatedAt: formatted }],
      description,
    };

    const newItem = await itemModel.create(itemData);

    await ActionLog.create({
      userId: userId === "00000" ? undefined : userId,
      userName,
      actionType: "CREATE_ITEM",
      targetType: "Item",
      targetId: newItem._id,
      description: `Item "${name}" created by ${userName}`,
      after: newItem.toObject(),
    });

    res.json({
      success: true,
      message: "Item added successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Error while adding item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const items = await itemModel.find().sort({ addedOn: -1 }); // most recently added on top

    res.status(200).json({
      success: true,
      items: items,
    });
  } catch (error) {
    console.error("getAllItems error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching items.",
    });
  }
};

export const getItem = async (req, res) => {
  try {
    const { itemId } = req.body; // you can also use req.params.id if you want
    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });
    }

    const item = await itemModel.findById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const itemData = {
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
      addedOn: item.addedOn,
      addedBy: item.addedBy,
      lastUpdatedOn: item.lastUpdatedOn,
      lastUpdatedBy: item.lastUpdatedBy,
      allUpdates: item.allUpdates,
      description: item.description || "",
    };

    return res.json({ success: true, item: itemData });
  } catch (error) {
    console.error("getItem error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while fetching item." });
  }
};

export const updateItem = async (req, res) => {
  try {
    const {
      itemId,
      name,
      component,
      brandName,
      supplierName,
      serialNumber,
      quantity,
      threshold,
      price,
      location,
      isFrequentlyUsed,
      description,
    } = req.body;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid item ID" });
    }

    // User info
    const userId = req?.user?.id;
    const user =
      userId === "00000"
        ? { name: "Superadmin" }
        : await userModel.findById(userId).select("name");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Item record
    const item = await itemModel.findById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const now = new Date();
    const formatted = now.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const before = item.toObject();

    // Fields to update
    const updatedFields = {
      name: name ?? item.name,
      component: component ?? item.component,
      brandName: brandName ?? item.brandName,
      supplierName: supplierName ?? item.supplierName,
      serialNumber: serialNumber ?? item.serialNumber,
      quantity: quantity ?? item.quantity,
      threshold: threshold ?? item.threshold,
      price: price ?? item.price,
      location: location ?? item.location,
      isFrequentlyUsed: isFrequentlyUsed ?? item.isFrequentlyUsed,
      description: description ?? item.description,
    };

    const formData = {
      ...updatedFields,
      lastUpdatedOn: formatted,
      lastUpdatedBy: user.name,
      allUpdates: [
        ...(item.allUpdates || []),
        { updatedBy: user.name, updatedAt: formatted },
      ],
    };

    const updatedItem = await itemModel.findByIdAndUpdate(itemId, formData, {
      new: true,
    });

    // Detect changed fields
    const changedFields = {};
    for (const key of Object.keys(updatedFields)) {
      if (before[key] !== updatedFields[key]) {
        changedFields[key] = { from: before[key], to: updatedFields[key] };
      }
    }

    const changedKeys = Object.keys(changedFields);
    const descriptionText =
      changedKeys.length > 0
        ? `${user.name} updated item "${
            before.name
          }". Changed fields: ${changedKeys.join(", ")}`
        : `${user.name} triggered update on item "${before.name}", but no fields changed.`;

    await ActionLog.create({
      userId: userId === "00000" ? undefined : userId,
      userName: user.name,
      actionType: "UPDATE_ITEM",
      targetType: "Item",
      targetId: itemId,
      description: descriptionText,
      before,
      after: updatedItem.toObject(),
    });

    return res.json({
      success: true,
      message: "Item updated successfully",
      item: updatedItem,
      changedFields,
    });
  } catch (err) {
    console.error("updateItem error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error while updating item." });
  }
};

export const uploadExcelItems = async (req, res) => {
  try {
    const userId = req.user.id;

    let user;
    if (userId === "00000") {
      user = { name: "Superadmin" };
    } else {
      user = await userModel.findById(userId).select("name");
    }

    const now = new Date();
    const formatted = now.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
    });

    // Delete file
    fs.unlinkSync(req.file.path);

    // Normalize rows from Excel
    const itemsToInsert = rows.map((row) => {
      const normalized = {};
      Object.keys(row).forEach((key) => {
        const cleanKey = key.toLowerCase().replace(/\s+/g, "");
        normalized[cleanKey] = row[key];
      });

      return {
        name: normalized["name"]?.toString().trim(),
        component: normalized["component"]?.toString().trim(),
        brandName: normalized["brand"]?.toString().trim(),
        supplierName: normalized["supplier"]?.toString().trim(),
        serialNumber: normalized["partnumber"]?.toString().trim(),
        quantity: parseInt(normalized["quantity"]),
        threshold: parseInt(normalized["threshold"]) || 0,
        price: parseFloat(normalized["price"]) || 0,
        location: normalized["location"]?.toString().trim(),
        isFrequentlyUsed: false,
        description: normalized["description"]?.toString().trim(),
        addedOn: formatted,
        addedBy: user.name,
        lastUpdatedOn: formatted,
        lastUpdatedBy: user.name,
        allUpdates: [{ updatedBy: user.name, updatedAt: formatted }],
      };
    });

    // Filter out invalid rows
    const validItems = itemsToInsert.filter(
      (item) => item.name && item.brandName && item.serialNumber
    );

    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file does not contain any valid items.",
      });
    }

    // Insert into DB
    const insertedItems = await itemModel.insertMany(validItems);

    // ActionLog: create a log for each item
    const actionLogs = insertedItems.map((item) => ({
      userId: userId === "00000" ? undefined : userId,
      userName: user.name,
      actionType: "CREATE_ITEM",
      targetType: "Item",
      targetId: item._id,
      description: `Item "${item.name}" created by ${user.name} via Excel upload`,
      after: item.toObject(),
      createdAt: now,
    }));

    await ActionLog.insertMany(actionLogs);

    res.json({
      success: true,
      message: `${validItems.length} item(s) added successfully!`,
      user: user.name,
    });
  } catch (error) {
    console.error("uploadExcelItems error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading Excel items.",
    });
  }
};

export const findRole = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If role is in token, return it
    if (decoded && decoded.role) {
      return res.status(200).json({ success: true, role: decoded.role });
    }
  } catch (error) {
    console.error("findRole error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error while finding role." });
  }
};

export const getLogs = async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Logs fetched successfully",
      data: logs,
    });
  } catch (error) {
    console.error("getLogs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching logs",
    });
  }
};

export const getthrashItems = async (req, res) => {
  try {
    const thrashItems = await thrashItemModel
      .find({ isDeleted: true })
      .sort({ deletedOn: -1 });

    res.status(200).json({
      success: true,
      items: thrashItems,
    });
  } catch (error) {
    console.error("getthrashItems error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching deleted items.",
    });
  }
};

export const moveItemsToTrash = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const { itemIds } = req.body; // expecting array

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID list is required" });
    }

    // User
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

    const movedItems = [];
    const logs = [];

    for (const id of itemIds) {
      try {
        const item = await itemModel.findById(id);
        if (!item) continue;

        const snapshot = item.toObject();

        // Move to trash
        const thrashItem = await thrashItemModel.create({
          ...snapshot,
          deletedOn: formatted,
          deletedBy: userName,
          isDeleted: true,
        });

        await item.deleteOne();

        // Add log
        logs.push({
          userId: realUserId,
          userName,
          actionType: "DELETE_ITEM",
          targetType: "Item",
          targetId: id,
          description: `Item "${snapshot.name}" moved to trash box by ${userName}`,
          before: snapshot,
          after: { archivedId: thrashItem._id },
          createdAt: now,
        });

        movedItems.push(thrashItem._id);
      } catch (err) {
        console.warn(`Item ${id} could not be moved:`, err.message);
      }
    }

    if (logs.length > 0) {
      await ActionLog.insertMany(logs);
    }

    return res.json({
      success: true,
      message: `${movedItems.length} item(s) successfully moved to trash box.`,
      movedItems,
    });
  } catch (error) {
    console.error("Bulk move to trash error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const recoverThrashItems = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const { thrashItemIds } = req.body; // expecting array

    if (!Array.isArray(thrashItemIds) || thrashItemIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID list is required" });
    }

    // User info
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

    const restoredItems = [];
    const logs = [];

    for (const id of thrashItemIds) {
      try {
        const thrashItem = await thrashItemModel.findById(id);
        if (!thrashItem) continue;

        const before = thrashItem.toObject();

        // Prepare data according to item schema
        const restoredData = {
          name: thrashItem.name,
          component: thrashItem.component,
          brandName: thrashItem.brandName,
          supplierName: thrashItem.supplierName,
          serialNumber: thrashItem.serialNumber,
          quantity: thrashItem.quantity,
          threshold: thrashItem.threshold,
          price: thrashItem.price,
          location: thrashItem.location,
          isFrequentlyUsed: thrashItem.isFrequentlyUsed,
          description: thrashItem.description || "",
          addedOn: thrashItem.addedOn,
          addedBy: thrashItem.addedBy,
          lastUpdatedOn: formatted,
          lastUpdatedBy: userName,
          allUpdates: [
            ...(thrashItem.allUpdates || []),
            { updatedBy: userName, updatedAt: formatted },
          ],
        };

        // Add back to items collection
        const restoredItem = await itemModel.create(restoredData);

        // Remove from trash
        await thrashItem.deleteOne();

        // Create log
        logs.push({
          userId: realUserId,
          userName,
          actionType: "RECOVER_ITEM",
          targetType: "Item",
          targetId: restoredItem._id,
          description: `Trash item "${before.name}" recovered by ${userName}`,
          before,
          after: restoredItem.toObject(),
          createdAt: now,
        });

        restoredItems.push(restoredItem._id);
      } catch (err) {
        console.warn(`Item ${id} could not be recovered:`, err.message);
      }
    }

    if (logs.length > 0) {
      await ActionLog.insertMany(logs);
    }

    return res.json({
      success: true,
      message: `${restoredItems.length} item(s) recovered successfully.`,
      restoredItems,
    });
  } catch (error) {
    console.error("recoverThrashItems error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getThrashItem = async (req, res) => {
  try {
    const { itemId } = req.body;

    // ID check
    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid item ID" });
    }

    // Find trash item
    const thrashItem = await thrashItemModel.findById(itemId).lean();
    if (!thrashItem) {
      return res
        .status(404)
        .json({ success: false, message: "Trash item not found" });
    }

    // Prepare response data
    const itemData = {
      id: thrashItem._id,
      name: thrashItem.name,
      component: thrashItem.component,
      brandName: thrashItem.brandName,
      supplierName: thrashItem.supplierName,
      serialNumber: thrashItem.serialNumber,
      quantity: thrashItem.quantity,
      threshold: thrashItem.threshold,
      price: thrashItem.price,
      location: thrashItem.location,
      isFrequentlyUsed: thrashItem.isFrequentlyUsed,
      description: thrashItem.description || "",
      addedOn: thrashItem.addedOn,
      addedBy: thrashItem.addedBy,
      lastUpdatedOn: thrashItem.lastUpdatedOn,
      lastUpdatedBy: thrashItem.lastUpdatedBy,
      allUpdates: thrashItem.allUpdates || [],
      deletedOn: thrashItem.deletedOn,
      deletedBy: thrashItem.deletedBy,
      isDeleted: thrashItem.isDeleted === true,
    };

    return res.json({
      success: true,
      message: "Trash item fetched successfully",
      item: itemData,
    });
  } catch (error) {
    console.error("getThrashItemById error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: could not fetch trash item data.",
      error: error.message,
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Superadmin özel case
    if (decoded.role === "superadmin") {
      return res.status(200).json({
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        },
        role: "superadmin",
      });
    }

    // Normal admin / user
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false });
    }

    res.status(200).json({
      success: true,
      user,
      role: user.role,
    });

  } catch (error) {
    return res.status(401).json({ success: false });
  }
};


