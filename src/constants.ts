export const
  SET_SOCKET_ID = 'SET_SOCKET_ID',
  NEW_PLAYER = 'NEW_PLAYER',
  BROADCAST_GAME_STATE = 'BROADCAST_GAME_STATE',
  START_DAMN_GAME = 'START_DAMN_GAME',
  NEW_BOARDCARD = 'NEW_BOARDCARD',
  SELECTION = 'SELECTION',
  SET_ROOM = 'SET_ROOM'

export interface Player {
  name: string
  socketId: string
  score: number
}
export interface Card {
  cardUrl: string
  socketId: string
}