import MessagesService from "../services/dao/messages.dao.mdb.js";

const service = new MessagesService();

class MessagesDTO {
    constructor(message) {
        this.message = message;
    }
}

class MessagesManager {
    constructor() {
    }

    add = async (messageData) => {
        try {
            const normalizedData = new MessagesDTO(messageData);
            return await service.add(normalizedData.message);
        } catch (err) {
            return err.message;
        };
    };

    getAll = async () => {
        try {
            return await service.getAll();
        } catch (err) {
            return err.message;
        };
    };

    deleteAll = async () => {
        try {
            return await service.deleteAll();
        } catch (err) {
            return err.message;
        };
    };



}
export default MessagesManager;