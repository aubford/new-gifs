export class Socket {
  constructor(private id, private rooms) {
  }

  private actions = {}
  on = (name, action) => {
    this.actions[name] = action
  }
  emit = (name, payload) => {
    this.actions[name](payload)
  }
  join = (room, cb) => {
    this.rooms[room].push(this.id)
    cb()
  }
  to = (roomId?) => ({
    emit: (name, payload, room = this.rooms[roomId]) => {
      room.forEach(e => e.emit(name, payload))
    },
    broadcast: (name, payload) => {
      const room = this.rooms[roomId].filter(socket => socket.id !== this.id)
      return {
        emit: (name, payload) => this.to().emit(name, payload, room)
      }
    }
  })
}

class IO {
  private rooms = {}
  actions = {
    connection: (cb?) => console.log('no connection action implemented')
  }
  connect = () => {
    const id = Math.random().toString()
    const newSocket = new Socket(id, this.rooms)
    this.rooms[id] = [newSocket]
    this.actions.connection(newSocket)
    return newSocket
  }
  to = roomId => ({
    emit: (name, payload) => {
      const room = this.rooms[roomId]
      room.forEach(e => e.emit(name, payload))
    }
  })
  on = (name, action) => {
    this.actions[name] = action
  }
}

const io = new IO()
export default io