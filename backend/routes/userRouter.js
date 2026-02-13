import express from "express"
import multer from "multer";
import {
  addItem,
  findRole,
  getAllItems,
  getAllUsers,
  getthrashItems,
  getItem,
  getLogs,
  getUProfile,
  logInUser,
  registerUser,
  updateItem,
  uploadExcelItems,
  getThrashItem,
  moveItemsToTrash,
  recoverThrashItems,
  logout,
  checkAuth,
} from "../controllers/userController.js";

import { superAdminLogin } from "../controllers/adminController.js"
import { allowRoles } from "../middleware/allowRoles.js";

const userRouter = express.Router();
const upload = multer({ dest: 'uploads/' }); // dosya geçici buraya kaydedilir

userRouter.post('/register-user', allowRoles("admin", "superadmin"), registerUser)
userRouter.get('/getAllUsers', allowRoles("admin", "superadmin"), getAllUsers)
userRouter.post('/login-user', logInUser)
userRouter.post('/add-item', allowRoles("user", "admin", "superadmin"), addItem)

userRouter.get('/get-profile', allowRoles("user", "admin", "superadmin"), getUProfile)
userRouter.get('/get-all-items', allowRoles("user", "admin", "superadmin"), getAllItems)

userRouter.post('/get-item', allowRoles("user", "admin", "superadmin"), getItem)
userRouter.post('/update-item', allowRoles("user", "admin", "superadmin"), updateItem)
userRouter.post('/get-role',findRole)
userRouter.get('/get-logs', allowRoles("user", "admin", "superadmin"), getLogs)


userRouter.post('/move-to-thrash-box', allowRoles("user", "admin", "superadmin"), moveItemsToTrash)
userRouter.post('/recover-thrash-item', allowRoles("user", "admin", "superadmin"), recoverThrashItems)
userRouter.post('/get-thrash-items', allowRoles("user", "admin", "superadmin"), getthrashItems)
userRouter.post('/get-thrash-item', allowRoles("user", "admin", "superadmin"), getThrashItem)

userRouter.post('/logout', allowRoles("user", "admin", "superadmin"), logout)

userRouter.post('/check-auth', checkAuth)





userRouter.post('/upload-excel-items', allowRoles("user", "admin", "superadmin"), upload.single("file"), uploadExcelItems)

export default userRouter;
