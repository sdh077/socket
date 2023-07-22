const SocketIO = require('socket.io');

module.exports = (http) => {
    const io = SocketIO(http, {
        path: '/socket.io',
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    const room = io.of('/room');
    const chat = io.of('/chat');

    io.on("connection", (socket) => {
        socket.on("chat message", (msg) => {
            io.emit("chat message", msg);
        });
    });
    // room 네임스페이스 전용 이벤트
    room.on('connection', (socket) => {
        const url = new URL('http://' + socket.request.url)
        const id = url.searchParams.get('id')
        socket.join(id)
        socket.on("chat message", (msg) => {
            console.log('ss')
            room.to(id).emit("reply", msg);
            // socket.broadcast.emit("chat message", msg);
        });
        socket.on('disconnect', () => {
            console.log('room 네임스페이스 접속 해제');
        });

        socket.emit('chat message', {
            type: 1,
            message: `입장하셨습니다.`
        });
    });

    // chat 네임스페이스 전용 이벤트
    chat.on('connection', (socket) => {
        console.log('chat 네임스페이스에 접속');
        socket.on("chat message", (msg) => {
            console.log(msg)
            chat.emit("chat message", msg);
        });
        socket.on('disconnect', () => {
            console.log('chat 네임스페이스 접속 해제');
            socket.leave(roomId);
        });

        socket.emit('join', '참여') // 같은 chat 네임스페이스 소켓으로만 이벤트가 날라간다.
    });
}