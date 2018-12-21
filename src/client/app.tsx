import * as React from 'react'
import { Component } from 'react'
import { getGif } from './api'
import ioClient from 'socket.io-client'
import catburrito from './images/catburrito.jpg'
import {
  BROADCAST_GAME_STATE,
  NEW_BOARDCARD,
  NEW_PLAYER,
  SELECTION,
  SET_SOCKET_ID,
  START_DAMN_GAME
} from '../constants'

const turnMessage = "It's your turn!  Pick your favorite` answer above!"
const notTurnMessage = 'Pick a .gif below as your answer!'

const isNull = val => val === null
const deNuld = (prev, curr) => isNull(prev) && !isNull(curr)
function classes(...args): any {
  return args.filter(e => e)
}
interface State {
  board: Array<{ cardUrl: string; socketId: string }>;
  question: string;
  players: Array<{ name: string; socketId: string; score: number }>;
  selector: number;
  selectedCardSocketId: string;
  playerSocketId: string;
  playerName: string;
  hand: Array<{ cardUrl: string }>;
  playedCard: string;
}

// State held in query params: roomId, og
class App extends Component<{},State> {
  state = {
    // global
    board: [], // { cardUrl, socketId }
    question: '',
    players: [], // { name, socketId, score }
    selector: 0,
    selectedCardSocketId: null,
    // this player
    playerSocketId: null,
    playerName: 'Some dumb fucking name',
    hand: [], // { cardUrl }
    playedCard: null
  }
  socket = ioClient('http://localhost:5000')
  isPlayerOne = () =>
    this.state.players[0] &&
    this.state.players[0].socketId === this.state.playerSocketId
  isCurrentlySelector = () =>
    this.state.players[this.state.selector] &&
    this.state.players[this.state.selector].socketId ===
      this.state.playerSocketId

  componentDidMount() {
    this.socket.on(SET_SOCKET_ID, this.setSocketId)
    this.socket.on(NEW_PLAYER, this.handleNewPlayer)
    this.socket.on(BROADCAST_GAME_STATE, this.handleNewPlayerSyncGameState)
    this.socket.on(START_DAMN_GAME, this.handleStartDamnGame)
    this.socket.on(NEW_BOARDCARD, card => {
      this.setState({ playedCard: card })
    })
    this.socket.on(SELECTION, winnerSocketId => {
      const players = this.state.players.map(player =>
        player.playerSocketId === winnerSocketId
          ? { ...player, score: player.score + 1 }
          : player
      )
      this.setState({ players, selectedCardSocketId: winnerSocketId })
    })
  }

  deal = async () => {
    const newGifs = await Promise.all([
      getGif(),
      getGif(),
      getGif(),
      getGif(),
      getGif()
    ])
    const hand = newGifs.map((res: any) => res.data.img_url)
    this.setState({ hand })
  }

  setSocketId = ({ socketId }) => {
    this.setState({ playerSocketId: socketId })
  }

  // socket handlers
  handleNewPlayer = newPlayer => {
    const { players, selector, question } = this.state
    const newPlayers = [newPlayer, ...players]
    this.setState({
      players: newPlayers
    })
    if (this.isPlayerOne()) {
      this.socket.emit(BROADCAST_GAME_STATE, {
        players: newPlayers,
        selector,
        question
      })
    }
  }
  handleNewPlayerSyncGameState = gameState => this.setState(gameState)
  handleStartDamnGame = question => {
    this.setState({ question }, this.deal)
  }
  // click handlers
  onClickStartDamnGame = () => this.socket.emit(START_DAMN_GAME)
  onClickHandCard = clickedCard => {
    this.setState(({ playedCard }) => {
      if (isNull(playedCard)) {
        return { playedCard: clickedCard }
      }
    })
  }
  onClickBoardCard = card => {
    const { selectedCardSocketId } = this.state
    if (this.isCurrentlySelector() && isNull(selectedCardSocketId)) {
      this.socket.emit(SELECTION, card.socketId)
    }
  }

  // updates
  update_playerPlayedACard = pPlayedCard =>
    deNuld(pPlayedCard, this.state.playedCard)

  componentDidUpdate(pProps, pState) {
    if (this.update_playerPlayedACard(pState.playedCard)) {
      // note this doesn't affect the board, this player is still waiting to receive his card for board by socket
      state => this.socket.emit(NEW_BOARDCARD, { playedCard: state.playedCard })
    }
  }

  getWinOrLoseText = () => {
    const { selectedCardSocketId, players, playerSocketId } = this.state
    if (!selectedCardSocketId) {
      return null
    }
    const winner = players.find(
      player => player.socketId === selectedCardSocketId
    )
    if (this.isCurrentlySelector()) {
      return 'Terrible choice, ' + winner.name + ' wins.'
    }
    if (winner.socketId === playerSocketId) {
      return 'You win.  You must be a terrible person...'
    }
    return winner.name + " wins, you're a loser."
  }

  render() {
    const {
      question,
      players,
      selectedCardSocketId,
      playerSocketId,
      playerName,
      hand,
      board
    } = this.state
    const winOrLoseText = this.getWinOrLoseText()
    return (
      <section>
        <img className="bodyBackground" src={catburrito} />
        <header>
          <p className="title">
            .Gifs
            <br /> Against
            <br /> Humanity.
          </p>
          <p className="worse">...A game for horribler people.</p>
        </header>
        <section className="scoreContainer">
          {players.map(player => (
            <p key={player.playerSocketId} className="score1 score">
              {player.name}: {player.score}
            </p>
          ))}
        </section>
        <section className="board">
          {winOrLoseText && <p className="winOrLose">{winOrLoseText}</p>}
          {board.map(({ cardUrl, socketId }) => (
            <Card
              key={cardUrl}
              cardUrl={cardUrl}
              onClick={this.onClickBoardCard}
              bounce={selectedCardSocketId === socketId}
              socketId={socketId}
            />
          ))}
        </section>
        <section className="question">{question}</section>
        <section className="turnDisplay">
          {this.isCurrentlySelector() ? turnMessage : notTurnMessage}
        </section>
        <section className="hand">
          {hand.map(cardUrl => (
            <Card
              key={cardUrl}
              cardUrl={cardUrl}
              socketId={playerSocketId}
              onClick={this.onClickHandCard}
            />
          ))}
        </section>
        <p className="playerName">You are {playerName}.</p>
        <footer>
          <div className="footerBackground" />
        </footer>
      </section>
    )
  }
}

export interface CardProps {
  cardUrl: string;
  socketId: string;
  bounce?: boolean;
  onClick: (string) => void;
}

const Card = ({ cardUrl, socketId, bounce, onClick }: CardProps) => (
  <img
    className={classes('handcard', bounce && 'bounce')}
    src={cardUrl}
    onClick={() => onClick({ cardUrl, socketId })}
  />
)

export default App
