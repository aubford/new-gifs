const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const questionBank = require('./questionBank.js')
const { ROOM_ID } = require('./constants')
import {
  SET_SOCKET_ID,
  NEW_PLAYER,
  NEW_PLAYER_SYNC_GAME_STATE,
  START_DAMN_GAME,
  NEW_BOARDCARD,
  SELECTION
} from './constants'

app.use(express.static('src'))
app.get('/', (req, res) => {
  res.sendFile('./index.html')
})

const getQueryParams = url => {
  const params = {}
  const pairs = url.substring(url.lastIndexOf('?') + 1).split('&')
  pairs.forEach(e => {
    const pair = e.split('=')
    params[pair[0]] = pair[1]
  })
  return params
}

const generateQuestion = () => {
  return Math.floor(Math.random() * questionBank.questions.length)
}

io.on('connection', function(socket) {
  // boring shit
  const queryParams = getQueryParams(socket.handshake.url) // CHECK: should be full socket url with query params
  const roomId = queryParams[ROOM_ID]
  socket.join(roomId)
  socket.emit(SET_SOCKET_ID, { playerSocketId: socket.id })
  socket.to(roomId).broadcast.emit(
    NEW_PLAYER,
    {
      playerSocketId: socket.id,
      name: 'New Player',
      score: 0
    },
    gameState => {
      socket.emit(NEW_PLAYER_SYNC_GAME_STATE, gameState)
    }
  )

  socket.on(START_DAMN_GAME, () => {
    socket.to(roomId).emit(START_DAMN_GAME, generateQuestion())
  })

  // funny shit
  socket.on(NEW_BOARDCARD, function(res) {
    io.to(res.roomId).emit(NEW_BOARDCARD, res.card)
  })
  socket.on(SELECTION, function(res) {
    io.to(res.roomId).emit(SELECTION, res.playerWinner)
    setTimeout(function() {
      io.to(res.roomId).emit(START_DAMN_GAME, generateQuestion())
    }, 2500)
  })
})

http.listen(5000, function() {
  console.log('listening on *:5000') // eslint-disable-line
})
