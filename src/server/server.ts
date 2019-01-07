import * as express from 'express'
import { questions } from './questionBank'
import {
  BROADCAST_GAME_STATE,
  NEW_BOARDCARD,
  NEW_PLAYER,
  SELECTION,
  SET_ROOM,
  SET_SOCKET_ID,
  START_DAMN_GAME
} from '../constants'

export const server = express()
const http = require('http').Server(server)
const io = require('socket.io')(http)

const generateQuestion = () => {
  return Math.floor(Math.random() * questions.length)
}

io.on('connection', socket => {
  let roomId
  socket.emit(SET_SOCKET_ID, socket.id)
  socket.on(SET_ROOM, id => {
    roomId = id
    socket.join(roomId, () => {
      socket.to(roomId).broadcast.emit(NEW_PLAYER, {
        playerSocketId: socket.id,
        name: 'New Player',
        score: 0
      })
    })
  })

  socket.on(BROADCAST_GAME_STATE, gameState => {
    socket.to(roomId).broadcast.emit(BROADCAST_GAME_STATE, gameState)
  })

  socket.on(START_DAMN_GAME, () => {
    console.log('************START_DAMN_GAME**************', roomId)
    socket.to(roomId).emit(START_DAMN_GAME, generateQuestion())
  })

  // funny shit
  socket.on(NEW_BOARDCARD, playedCard => {
    io.to(roomId).emit(NEW_BOARDCARD, playedCard)
  })

  socket.on(SELECTION, res => {
    io.to(roomId).emit(SELECTION, res)
    setTimeout(() => {
      io.to(roomId).emit(START_DAMN_GAME, generateQuestion())
    }, 2500)
  })
})

http.listen(5000, () => {
  console.log('listening on *:5000') // eslint-disable-line
})
