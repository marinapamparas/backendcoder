import { Router } from "express";
import { verifyToken } from "../services/utils.js";
//import  UsersManager  from "../controllers/UsersManagerMongoDB.js";
import { uploader } from "../services/uploader.js";
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

users.post('/premium/:uid', async (req,res)=>{
    try{ 
        const userId = req.user._doc._id
        
        const user = await UMMDB.getOne(userId)

        if (!user) {
            return res.status(404).send({ payload: "Usuario no encontrado" });
        }

        const role = user.role
        const documents = user.documents

        const requiredDocs = ['identificacion', 'domicilio', 'cuenta'];

        const hasAllDocuments = requiredDocs.every(docType => 
            documents.some(doc => doc.name === docType)
        );
       
        if(role === "USER" && hasAllDocuments){
            await UMMDB.update(userId, { "role" : "PREMIUM"})
            res.status(200).send({ payload: "Rol actualizado a PREMIUM exitosamente" });
        } else{
            await UMMDB.update(userId, { "role" : "USER"})
            res.status(200).send({ payload: "Sigues siendo USER, no cumpliste con toda la documentación requerida para pasar a PREMIUM" });
        }       

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

users.post('/:typeDoc/documents', uploader.array('documentsFiles', 3), async (req,res)=>{
    try{
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ status: 'ERROR', payload: 'No se cargaron archivos' });
        }
        
        const uploadedFiles = req.files.map(file => file.originalname);
        const type = req.params.typeDoc
        const uid = req.user._doc._id

        // Construir el array de documentos a añadir
        const documents = req.files.map(file => ({
            name: type,
            reference: file.path 
        }));

        // Actualizar el usuario
        await UMMDB.update(
            uid,
            { $push: { documents: { $each: documents } } }
        );

        res.status(200).send({ status: 'OK', payload: 'Documentos cargados', files: uploadedFiles });

       
    }catch (error){
        console.error('Error al crear el usuario:', error);
        res.status(500).send('Error del servidor');
    }
});





export default users;