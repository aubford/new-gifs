import * as React from "react";
import { Component } from "react";
import { getGif } from "./api";
import * as ioClient from "socket.io-client";
import { BROADCAST_GAME_STATE, NEW_BOARDCARD, NEW_PLAYER, SELECTION, SET_ROOM, SET_SOCKET_ID, START_DAMN_GAME } from "../constants";
const getQueryParams = window => {
    const search = window.location.search.substring(1);
    const params = {};
    const pairs = search.split("&");
    pairs.forEach(e => {
        const pair = e.split("=");
        params[pair[0]] = pair[1];
    });
    return params;
};
const turnMessage = "It's your turn!  Pick your favorite` answer above!";
const notTurnMessage = "Pick a .gif below as your answer!";
const isNull = val => val === null;
const deNuld = (prev, curr) => isNull(prev) && !isNull(curr);
function classes(...args) {
    return args.filter(e => e);
}
// State held in query params: roomId, og
class App extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            // global
            board: [],
            question: "",
            players: [],
            selector: 0,
            selectedCardSocketId: null,
            // this player
            playerSocketId: null,
            playerName: "Some dumb fucking name",
            hand: [],
            playedCard: null
        };
        this.socket = ioClient("http://localhost:5000");
        this.isPlayerOne = () => this.state.players[0] &&
            this.state.players[0].socketId === this.state.playerSocketId;
        this.isCurrentlySelector = () => this.state.players[this.state.selector] &&
            this.state.players[this.state.selector].socketId ===
                this.state.playerSocketId;
        this.deal = async () => {
            const newGifs = await Promise.all([
                getGif(),
                getGif(),
                getGif(),
                getGif(),
                getGif()
            ]);
            const hand = newGifs.map((res) => res.data.img_url);
            this.setState({ hand });
        };
        this.setSocketId = playerSocketId => {
            this.setState({
                playerSocketId,
                players: [
                    {
                        name: this.state.playerName,
                        socketId: playerSocketId,
                        score: 0
                    }
                ]
            }, () => {
                this.socket.emit(SET_ROOM, getQueryParams(window)["roomId"]);
            });
        };
        // socket handlers
        this.handleNewPlayer = newPlayer => {
            console.log("newPlayer", this.state.players);
            const { players, selector, question } = this.state;
            const newPlayers = [newPlayer, ...players];
            this.setState({
                players: newPlayers
            });
            if (this.isPlayerOne()) {
                this.socket.emit(BROADCAST_GAME_STATE, {
                    players: newPlayers,
                    selector,
                    question
                });
            }
        };
        this.handleNewPlayerSyncGameState = gameState => this.setState(gameState);
        this.handleStartDamnGame = question => {
            this.setState({ question }, this.deal);
        };
        // click handlers
        this.onClickStartDamnGame = () => this.socket.emit(START_DAMN_GAME);
        this.onClickHandCard = clickedCard => {
            this.setState(({ playedCard }) => {
                if (isNull(playedCard)) {
                    return { playedCard: clickedCard };
                }
            });
        };
        this.onClickBoardCard = card => {
            if (this.isCurrentlySelector() && isNull(this.state.selectedCardSocketId)) {
                this.socket.emit(SELECTION, card.socketId);
            }
        };
        // updates
        this.updated_playerPlayedACard = pPlayedCard => deNuld(pPlayedCard, this.state.playedCard);
        this.getWinOrLoseText = () => {
            const { selectedCardSocketId, players, playerSocketId } = this.state;
            if (!selectedCardSocketId) {
                return null;
            }
            const winner = players.find(player => player.socketId === selectedCardSocketId);
            if (this.isCurrentlySelector()) {
                return "Terrible choice, " + winner.name + " wins.";
            }
            if (winner.socketId === playerSocketId) {
                return "You win.  You must be a terrible person...";
            }
            return winner.name + " wins, you're a loser.";
        };
    }
    componentDidMount() {
        this.socket.on(SET_SOCKET_ID, this.setSocketId);
        this.socket.on(NEW_PLAYER, this.handleNewPlayer);
        this.socket.on(BROADCAST_GAME_STATE, this.handleNewPlayerSyncGameState);
        this.socket.on(START_DAMN_GAME, this.handleStartDamnGame);
        this.socket.on(NEW_BOARDCARD, playedCard => {
            this.setState({ playedCard });
        });
        this.socket.on(SELECTION, winnerSocketId => {
            const players = this.state.players.map(player => player.playerSocketId === winnerSocketId
                ? Object.assign({}, player, { score: player.score + 1 }) : player);
            this.setState({ players, selectedCardSocketId: winnerSocketId });
        });
    }
    componentDidUpdate(pProps, pState) {
        if (this.updated_playerPlayedACard(pState.playedCard)) {
            // note this doesn't affect the board, this player is still waiting to receive his card for board by socket
            state => this.socket.emit(NEW_BOARDCARD, state.playedCard);
        }
    }
    render() {
        const { question, players, selectedCardSocketId, playerSocketId, playerName, hand, board } = this.state;
        const winOrLoseText = this.getWinOrLoseText();
        return (React.createElement("section", null,
            React.createElement("header", null,
                React.createElement("p", { className: "title" },
                    ".Gifs",
                    React.createElement("br", null),
                    " Against",
                    React.createElement("br", null),
                    " Humanity."),
                React.createElement("p", { className: "worse" }, "...A game for horribler people.")),
            React.createElement("section", { className: "scoreContainer" }, players.map(player => (React.createElement("p", { key: player.playerSocketId, className: "score1 score" },
                player.name,
                ": ",
                player.score)))),
            React.createElement("section", { className: "board" },
                winOrLoseText && React.createElement("p", { className: "winOrLose" }, winOrLoseText),
                board.map(({ cardUrl, socketId }) => (React.createElement(Card, { key: cardUrl, cardUrl: cardUrl, onClick: this.onClickBoardCard, bounce: selectedCardSocketId === socketId, socketId: socketId })))),
            React.createElement("section", { className: "question" },
                !question && (React.createElement("button", { onClick: this.onClickStartDamnGame }, "Start Game")),
                question),
            React.createElement("section", { className: "turnDisplay" }, this.isCurrentlySelector() ? turnMessage : notTurnMessage),
            React.createElement("section", { className: "hand" }, hand.map(cardUrl => (React.createElement(Card, { key: cardUrl, cardUrl: cardUrl, socketId: playerSocketId, onClick: this.onClickHandCard })))),
            React.createElement("p", { className: "playerName" },
                "You are ",
                playerName,
                "."),
            React.createElement("footer", null,
                React.createElement("div", { className: "footerBackground" }))));
    }
}
const Card = ({ cardUrl, socketId, bounce, onClick }) => (React.createElement("img", { className: classes("handcard", bounce && "bounce"), src: cardUrl, onClick: () => onClick({ cardUrl, socketId }) }));
export default App;
//# sourceMappingURL=app.js.map