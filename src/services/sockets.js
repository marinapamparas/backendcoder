import { Server } from 'socket.io';
import { MessagesManager } from '../controllers/MessagesManager.js';


const MMMDB = new MessagesManager()

const initSocket = (httpServer) => {      

    //Creo servidor
    const io = new Server(httpServer);
    const MMDB = new MessagesManager();

    //Creo cliente y lo conecto al server
    io.on('connection', async socket => {  
        
        let messages = await MMMDB.getAllMessages();

        // console.log ('messages:', messages)
        socket.emit('messagesdb', messages);

        console.log(`Cliente conectado, id ${socket.id} desde ${socket.handshake.address}`);
    
    
        socket.on('newMessage', data =>{
            
            
            MMDB.saveMessage(data)
            //MMDB.deleteAllMessages()
            console.log(`Mensaje recibido desde ${socket.id}: ${data.user} : ${data.message}`)
            
            //envio a todos incluyendome
            io.emit('messageArrived', data);
            

            
        });

        socket.on('productsChanged', data => {

            //emito mensaje a todos los clientes (broadcast)
            io.emit('productsChanged', data);
        });
        
    });

    return io;
}

export default initSocket;