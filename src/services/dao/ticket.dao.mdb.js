import modelTickets from "../../models/ticket.models.js";


class TicketsService {
    constructor() {
    }

    add = async(newData) => {
        try {
            const ticket = new modelTickets(newData);
            
            await ticket.save();
            return ticket;
        } catch (error) {
            console.error('Error al crear el ticket:', error);
        }
    }




}

export default TicketsService;