import { Router } from "express";

//import  UsersManager  from "../controllers/UsersManagerMongoDB.js";
import UsersManager from "../controllers/users.manager.js";

const users = Router();

const UMMDB = new UsersManager ()



users.get('/:uid', async (req,res)=>{
    try{ 
        const uid= req.params.uid;
        
        const UserId = await UMMDB.getOne(uid)
        
        res.status(200).send({payload: UserId})

    }catch (error){
        console.error('Error, the user doesnt exists:', error);
        res.status(500).send('Server error');
    }
});


users.post('/createUser', async (req,res)=>{
    try{

        const userData = req.body;

        const addUser = await UMMDB.add(userData)           

        res.status(200).send({payload: addUser})

       
    }catch (error){
        console.error('Error al crear el usuario:', error);
        res.status(500).send('Error del servidor');
    }
});





export default users;