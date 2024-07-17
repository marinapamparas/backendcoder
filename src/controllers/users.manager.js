import UsersService from "../services/dao/users.dao.mdb.js";


const service = new UsersService();

class UsersDTO {
    constructor(user) {
        this.user = user;
    }
}

class UsersManager {
    constructor() {
    }

    getOne = async (filter) => {
        try {
            return await service.getOne(filter);
        } catch (err) {
            return err.message;
        };
    };

    autenticationUser = async (username, password) => {
        try {
            return await service.autenticationUser(username, password);
        } catch (err) {
            return err.message;
        };
    };

    add = async (newData) => {
        try {
            const normalizedData = new UsersDTO(newData);
            return await service.add(normalizedData.user);
        } catch (err) {
            return err.message;
        };
    };

    update = async (userId, updates) => {
        try {
            return await service.update(userId, updates);
        } catch (err) {
            return err.message;
        };
    };

    delete = async (filter) => {
        try {
            return await service.delete(filter);
        } catch (err) {
            return err.message;
        };
    };
}

export default UsersManager;