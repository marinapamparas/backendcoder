import modelUsers from './models/users.model.js';


export class UsersManager {

    createUser = async(usersData) =>  {

        try {
            
            if(!usersData.firstName || !usersData.lastName || !usersData.age || !usersData.email || !usersData.password ) {
                console.error("todos los campos son obligatorios")
                return;
            }

            const emailVerification = await modelUsers.findOne({ email: usersData.email });
            if(emailVerification){
                // const fail = {
                //     message : 'El mail que ingresaste ya se encuentra registrado'
                // }
                console.log('El mail ya esta registrado')
                return;
            }

            const user = new modelUsers(usersData);
            await user.save();
            return user;
        } catch (error) {
            console.error('Error al crear el user:', error);
        }

    }

    getUserById = async (userId) => {
        try {
            const user = await modelUsers.findById(userId);
            return user;
        } catch (error) {
            console.error('Error al obtener el user por ID:', error);
        }
    }

    autenticationUser = async (email, password) => {
        try {

            const user = await modelUsers.findOne({ email: email });

            if (!user) {
                console.error('Usuario no encontrado');
                return null;
            }

            if (user.password !== password) {
                console.error('Contraseña incorrecta');
                return null;
            }


            return user;
        } catch (error) {
            console.error('Error al autenticar el usuario:', error);
        }
    }


    getAllUsers = async() => {
        try {
            const user = await modelUsers.find().lean();
            return user;
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
        }
    }

    updateUser = async (userId, updates) => {
        try {
            const user = await modelUsers.findByIdAndUpdate(userId, updates, { new: true });
            return user;
        } catch (error) {
            console.error('Error al actualizar el user:', error);
        }
    }

    deleteUser = async (userId) => {
        try {
            await modelUsers.findByIdAndDelete(userId);
            console.log('Usuario eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
        }
    }





}