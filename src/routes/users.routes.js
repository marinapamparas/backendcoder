import { Router } from "express";
import { uploader } from "../services/uploader.js";
import UsersManager from "../controllers/users.manager.js";
import config from "../config.js";
import nodemailer from "nodemailer";
import { handlePolicies, verifyToken } from "../services/utils.js";

const users = Router();

const UMMDB = new UsersManager ()

const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.GMAIL_APP_USER,
        pass: config.GMAIL_APP_PASS
    }
});


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

users.get( '/', async (req,res)=>{
    try{
        const users = await UMMDB.getAll()
        const filteredUsers = users.map(user => {
            const { firstName, email, role } = user;
            return { firstName, email, role }; 
        });
        res.status(200).send({ origin:config.SERVER, payload: filteredUsers });
    }catch (error){

    }
})

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

users.post('/updaterole', verifyToken, handlePolicies (['ADMIN']), async(req,res)=>{
    try{
        const { userId, role } = req.body;
        
        const updatedUser = await UMMDB.update(userId, { "role" : role})
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'No se pudo realizar el cambio de rol' });
        }
        res.status(200).send({success: true, message:'Se efectuó exitosamente el cambio de rol, actualiza para verlo'})

    }catch (error){
        console.error('Error al modificar el rol de usuario:', error);
        res.status(500).send('Error del servidor');
    }
});

users.delete ('/deleteuser', verifyToken, handlePolicies (['ADMIN']), async(req, res)=>{
    try{
        const { userId } = req.body;
        
        const result = await UMMDB.delete(userId);

        if (result) {
            res.status(404).json({ message: 'El usuario no se encontró en la base de datos' });
        } else {
            res.json({ message: 'El usuario se eliminó correctamente, actualice para ver el cambio' });
        }

    }catch (error){
        console.error('Error al borrar el usuario de la db:', error);
        res.status(500).send('Error del servidor');
    }
});

users.delete ( '/', async(req,res)=>{
    try{
        const users = await UMMDB.getAll()
        const now = Date.now(); 
        const inactiveTime = now - 2 * 24 * 60 * 60 * 1000;

        const inactiveUsers = users.filter(user => {
            const { last_connection } = user;
            return new Date(last_connection).getTime() < inactiveTime;
        });
        
        if (inactiveUsers.length > 0) {
            inactiveUsers.forEach(async user => {
                
                const uid = user._id.toHexString(); 
                const mail = user.email
                
                await UMMDB.delete(uid)
                await transport.sendMail({
                    from: `no-reply <${config.GMAIL_APP_USER}>`, 
                    to: `${mail}`,
                    subject: 'Detectamos que tu cuenta se encuentra inactiva',
                    html: '<div><h2>Hola!</h2><h3>Detectamos que tu cuenta se encuentra inactiva hace 2 días, por lo que procedimos a eliminarla</h3><br><p>Gracias por haber formado parte de nuestro sistema</p> <br><p>Si quisieras volver a loguearte deberás crearte una nueva cuenta, registrandote nuevamente.</p> <br><p>Por favor no responder este mail, es automático</p></div>',
                });
            });
        }
        res.status(200).send({origin:config.SERVER, payload: 'Se efectuó el delete de los usuarios inactivos'})
        
    }catch(error){
        console.error('Error al eliminar los usuarios inactivos:', error);
        res.status(500).send('Error del servidor');
    }
});

export default users;