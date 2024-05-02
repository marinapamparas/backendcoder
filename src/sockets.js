import { Server } from 'socket.io';

const initSocket = (httpServer) => {      

    //Creo servidor
    const io = new Server(httpServer);

    //Creo cliente y lo conecto al server
    io.on('connection', socket => {  

        console.log(`Cliente conectado, id ${socket.id} desde ${socket.handshake.address}`);
    
        // socket.on('newMessage', data => {
            
        //     console.log(`Mensaje recibido desde ${socket.id}: ${data.user} ${data.message}`);
    
        //     //emito mensaje a todos los clientes (broadcast)
        //     //io.emit('messageArrived', data);
        // });

        socket.on('productsChanged', data => {
            
            //console.log(`Mensaje recibido desde ${socket.id}: ${data.user} ${data.message}`);
    
            //emito mensaje a todos los clientes (broadcast)
            io.emit('productsChanged', data);
        });
        
    });

    return io;
}

export default initSocket;