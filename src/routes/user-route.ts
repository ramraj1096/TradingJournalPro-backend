import express from 'express';
import { validateLogin, validateRegistration } from '../utils/validation';
import { editCurrentUser, getCurrentUser, login, register, resetPassword } from '../controllers/user-controller';


const router = express.Router();

router.post('/register', 
    validateRegistration, 
    register);

router.put('/:userId', editCurrentUser);

router.post("/login",
    validateLogin,
    login);


router.post("/reset", 
    validateLogin, 
    resetPassword);

router.get("/me", 
    getCurrentUser);


export default router;
