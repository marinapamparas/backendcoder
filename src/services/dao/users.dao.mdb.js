import modelUsers from '../../models/users.model.js'
import { isValidPassword } from "../utils.js";
//import { CartManagerMongoDb } from '../controllers/CartManagerMongoDb.js';
import CartsManager from '../../controllers/carts.manager.js';
import { createHash } from '../utils.js';
import { errorsDictionary } from '../../config.js';
import CustomError from '../CustomError.class.js';



const CMMDB = new CartsManager();

class UsersService {
    constructor() {
    }


    add = async (newData) => {
        try {
            
            const emailVerification = await modelUsers.findOne({ email: newData.email });
            
            if(emailVerification){
                //throw new CustomError(errorsDictionary.RECORD_CREATION_NOT_OK)
                console.error('El mail ya esta registrado')
                return;
            }
            
            const newCart = await CMMDB.add();

            const user = {
                firstName : newData.firstName,
                lastName : newData.lastName,
                age : newData.age,
                email : newData.email,
                password : newData.password,
                _cart_id: newCart._id 
            }

            const newUser = new modelUsers(user);

            await newUser.save();
            return newUser;

        } catch (error) {
            
            console.error('Error al crear el user:', error);
        }
    };
    
    getOne = async (filter) => {
        try {
            const user = await modelUsers.findById(filter);
            return user;
        } catch (error) {
            console.error('Error al obtener el user por ID:', error);
        }
    };


    autenticationUser = async (username, password) => {
        try {

            if(username == "" || password == "")
            {
                console.error('datos vacios');
                return null
            }

            const user = await modelUsers.findOne({ email: username });
            
            if (!user) {
                console.error('Usuario no encontrado en la base de datos');
                return null;
            }
            if(password){
                
                if (await isValidPassword(user, password)){
                    const userChequeado = user;
                    
                    return userChequeado;
                }
                
            }else{
                
                return null;
            }
      
        } catch (error) {
            console.error('Error al autenticar el usuario:', error);
        }
    };

    getAll = async() => {
        try {
            const user = await modelUsers.find().lean();
            return user;
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
        }
    };

    update = async (userId, updates) => {
        try {
            const user = await modelUsers.findByIdAndUpdate(userId, updates, { new: true });
            return user;
        } catch (error) {
            console.error('Error al actualizar el user:', error);
        }
    };

    delete = async (filter) => {
        try {
            await modelUsers.findByIdAndDelete(filter);
            console.log('Usuario eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
        }
    };

}

export default UsersService;