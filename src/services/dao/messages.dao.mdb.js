import modelMessages from "../../models/messages.models.js";

class MessagesService {
    constructor() {
    }


    add = async(messageData) =>  {

        try {
            const message = new modelMessages(messageData);
            await message.save();
            return message;
        } catch (error) {
            console.error('Error al guardar el message:', error);
        }

    }

    getAll = async() => {
        try {
            const messages = await modelMessages.find().lean();
            return messages;
        } catch (error) {
            console.error('Error al obtener los mensajes:', error);
        }
    }

    deleteAll = async () =>{
        try{
            const messagesErased = await modelMessages.deleteMany()
            return messagesErased
        }catch(error){
            console.error('Error al borrar todos los mensajes:', error)
        }
    }

}

export default MessagesService;