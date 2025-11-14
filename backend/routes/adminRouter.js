import express from "express";
import multer from "multer";
import { adminLogin, registerAdmin, superAdminLogin, getAllAdmins, deleteUser, deleteAdmin, permanentlyDeleteThrashItems, getDeletedItems} from "../controllers/adminController.js";
import { allowRoles } from "../middleware/allowRoles.js";


const adminRouter = express.Router();

adminRouter.post("/superadmin-login", superAdminLogin);
adminRouter.post("/register-admin", allowRoles("superadmin"), registerAdmin); // Assuming registerAdmin is also handled here
adminRouter.post("/admin-login", adminLogin)
adminRouter.get("/getAllAdmins", allowRoles("superadmin"), getAllAdmins); // New route to get all admins
adminRouter.post("/deleteUser", allowRoles("admin", "superadmin"), deleteUser)
adminRouter.post("/deleteAdmin", allowRoles("superadmin"), deleteAdmin)
adminRouter.post("/permanently-delete-items", allowRoles("admin", "superadmin"), permanentlyDeleteThrashItems)
adminRouter.post("/get-deleted-items", allowRoles("admin", "superadmin"), getDeletedItems)



export default adminRouter;