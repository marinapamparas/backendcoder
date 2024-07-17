import TicketsService from "../services/dao/ticket.dao.mdb";


const service = new TicketsService();

class TicketsDTO {
    constructor(ticket) {
        this.ticket = ticket;
       
    }
}

class TicketsManager {
    constructor() {
    }

    add = async (newData) => {
        try {
            return await service.add(newData);
        } catch (err) {
            return err.message;
        };
    };


}

export default TicketsManager;