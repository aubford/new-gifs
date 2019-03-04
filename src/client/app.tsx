import * as React from "react"
import { getGif } from "./api"
import * as ioClient from "socket.io-client"
import {
  BROADCAST_GAME_STATE,
  NEW_BOARDCARD,
  NEW_PLAYER,
  SELECTION,
  SET_ROOM,
  SET_SOCKET_ID,
  START_DAMN_GAME,
  Player,
  Card
} from "../constants"

const { Component } = React

const getQueryParams = window => {
  const search = window.location.search.substring(1)
  const params = {}
  const pairs = search.split("&")
  pairs.forEach(e => {
    const pair = e.split("=")
    params[pair[0]] = pair[1]
  })
  return params
}

const turnMessage = "It's your turn!  Pick your favorite answer above!"
const notTurnMessage = "Pick a .gif below as your answer!"

const isNull = val => val === null
const deNuld = (prev, curr) => isNull(prev) && !isNull(curr)
function classes(...args): string {
  return args.filter(e => e).join(" ")
}

interface State {
  board: Card[]
  question: string
  players: Player[]
  selector: number
  selectedCardSocketId: string
  socketId: string
  playerName: string
  hand: Card[]
  playedCard: string
}

// State held in query params: roomId, og
class App extends Component<{}, State> {
  state = {
    // global
    board: [],
    question: "",
    players: [],
    selector: 0,
    selectedCardSocketId: null,
    // this player
    socketId: null,
    playerName: `${Math.random()}`,
    hand: [],
    playedCard: null
  }
  socket = ioClient("http://localhost:5000")
  isPlayerOne = () => this.state.players[0].socketId === this.state.socketId
  isCurrentlySelector = () =>
    this.state.players[this.state.selector] &&
    this.state.players[this.state.selector].socketId === this.state.socketId

  deal = async () => {
    const newGifs = await Promise.all([
      getGif(),
      getGif(),
      getGif(),
      getGif(),
      getGif()
    ])
    console.log("newGifs", newGifs)
    const hand = newGifs.map((res: any) => res.data.img_url)
    this.setState({ hand })
  }

  // socket handlers
  handleSetSocketId = socketId => {
    this.setState({ socketId }, () => {
      this.socket.emit(SET_ROOM, getQueryParams(window)["roomId"])
    })
  }
  handleNewPlayer = ({ socketId, name }) => {
    const { selector, question, players } = this.state
    const newPlayers = [...players, { socketId, score: 0, name } as Player]
    this.setState(
      {
        players: newPlayers
      },
      () => {
        if (this.isPlayerOne()) {
          this.socket.emit(BROADCAST_GAME_STATE, {
            newPlayers,
            selector,
            question
          })
        }
      }
    )
  }
  handleBroadcastGameState = gameState => {
    console.log("gameState", gameState)
    this.setState(gameState)
  }
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
    if (this.isCurrentlySelector() && isNull(this.state.selectedCardSocketId)) {
      this.socket.emit(SELECTION, card.socketId)
    }
  }
  // updates
  updated_playerPlayedACard = pPlayedCard =>
    deNuld(pPlayedCard, this.state.playedCard)
  componentDidUpdate(pProps, pState) {
    if (this.updated_playerPlayedACard(pState.playedCard)) {
      // note this doesn't affect the board, this player is still waiting to receive his card for board by socket
      state => this.socket.emit(NEW_BOARDCARD, state.playedCard)
    }
  }

  getWinOrLoseText = () => {
    const { selectedCardSocketId, players, socketId } = this.state
    if (!selectedCardSocketId) {
      return null
    }
    const winner = players.find(
      player => player.socketId === selectedCardSocketId
    )
    if (this.isCurrentlySelector()) {
      return "Terrible choice, " + winner.name + " wins."
    }
    if (winner.socketId === socketId) {
      return "You win.  You must be a terrible person..."
    }
    return winner.name + " wins, you're a loser."
  }

  componentDidMount() {
    this.socket.on(SET_SOCKET_ID, this.handleSetSocketId)
    this.socket.on(NEW_PLAYER, this.handleNewPlayer)
    this.socket.on(BROADCAST_GAME_STATE, this.handleBroadcastGameState)
    this.socket.on(START_DAMN_GAME, this.handleStartDamnGame)
    this.socket.on(NEW_BOARDCARD, playedCard => {
      this.setState({ playedCard })
    })
    this.socket.on(SELECTION, winnerSocketId => {
      const players = this.state.players.map(player =>
        player.socketId === winnerSocketId
          ? { ...player, score: player.score + 1 }
          : player
      )
      this.setState({ players, selectedCardSocketId: winnerSocketId })
    })
  }

  render() {
    const {
      question,
      players,
      selectedCardSocketId,
      socketId,
      playerName,
      hand,
      board
    } = this.state
    const winOrLoseText = this.getWinOrLoseText()
    return (
      <section>
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
            <p key={player.socketId} className="score1 score">
              {player.name}: {player.score}
            </p>
          ))}
        </section>

        <section className="board">
          {winOrLoseText && <p className="winOrLose">{winOrLoseText}</p>}
          {board.map(({ cardUrl, socketId }) => (
            <BoardCard
              key={cardUrl}
              cardUrl={cardUrl}
              onClick={this.onClickBoardCard}
              bounce={selectedCardSocketId === socketId}
              socketId={socketId}
            />
          ))}
        </section>

        <section className="question">
          {!question && (
            <button onClick={this.onClickStartDamnGame}>Start Game</button>
          )}
          {question}
        </section>

        <section className="turnDisplay">
          {this.isCurrentlySelector() ? turnMessage : notTurnMessage}
        </section>

        <section className="hand">
          {hand.map(cardUrl => (
            <BoardCard
              key={cardUrl}
              cardUrl={cardUrl}
              socketId={socketId}
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
  cardUrl: string
  socketId: string
  bounce?: boolean
  onClick: (string) => void
}

const BoardCard = ({ cardUrl, socketId, bounce, onClick }: CardProps) => (
  <img
    className={classes("handcard", bounce && "bounce")}
    src={cardUrl}
    onClick={() => onClick({ cardUrl, socketId })}
  />
)

export default App
