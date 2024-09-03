import * as http from "http";
import { PointingPlayer, Vote } from "./entities/player";
import { PointingGlobalState } from "./entities/global-state";
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface PointingData {
	player: PointingPlayer;
	room?: string;
}

type PointingSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, PointingData>;

type PlayerRole = 'player' | 'spectator'

interface JoinData {
	room: string;
	uid: string;
	name: string;
	discipline?: string;
	role: PlayerRole;
}

export class Pointing {
	private globalState = new PointingGlobalState();
	private pointingSocket!: Server;

	constructor(private server: http.Server) {}

	start() {
		this.pointingSocket = new Server(this.server, {
			pingInterval: 15000,
			path: "/pointing",
			allowEIO3: true,
		});

		this.pointingSocket.on("connection", (socket: PointingSocket) => {
			console.log("new connection");
			socket.on("join", arg => this.onJoin(socket, arg));

			socket.on("reset", () => this.resetVotes(socket));
			socket.on("show", () => this.showVotes(socket));
			socket.on("vote", (vote: Vote) => this.vote(socket, vote));
			socket.on("role", (role: PlayerRole) => this.changeRole(socket, role));

			socket.on("disconnect", () => this.disconnect(socket));
			socket.on("room:ping", () => {
				let player = socket.data.player;
				console.log(`Ping ${player?.name}`);
			});
		});
	}

	private onJoin = (socket: PointingSocket, { room, uid, name, discipline, role }: JoinData) => {
		console.log(`User [${discipline}]${name}(${uid}) joining room ${room}`);
		if (socket.data.room) {
			socket.leave(room);
		}
		socket.join(room);
		socket.data.room = room;

		let player = new PointingPlayer(uid, name, discipline);
		socket.data.player = player;

		this.globalState.removePlayer(player);
		let roomState = this.globalState.getRoom(room);
		/* if (roomState.isAllVoted() && roomState.players.length > 5) {
			player.vote = null;
		} */
		if (role === 'spectator')
			roomState.addSpectator(player);
		else roomState.addPlayer(player);
		roomState.addLog(`[${player.discipline}]${player.name} joined.`);

		this.refreshRoom(room, player);
	}

	private resetVotes(socket: PointingSocket) {
		let room = socket.data.room;
		let player = socket.data.player;
		console.log(`reset: ${room}`);
		if (room) {
			let roomState = this.globalState.getRoom(room);
			roomState.clearVotes();
			roomState.addLog(`[${player.discipline}]${player.name} cleared votes.`);
			this.refreshRoom(room, player);
		}
	}

	private showVotes(socket: PointingSocket) {
		let room = socket.data.room;
		let player = socket.data.player;
		console.log(`show: ${room}`);
		if (room) {
			let roomState = this.globalState.getRoom(room);
			roomState.showVotes();
			roomState.addLog(`[${player.discipline}]${player.name} showed votes.`);
			this.refreshRoom(room, player);
		}
	}

	private vote(socket: PointingSocket, vote: Vote) {
		let room = socket.data.room;
		let player = socket.data.player;
		console.log(`vote: ${room}, value: ${vote}, player: ${JSON.stringify(player)}`);
		if (room) {
			this.globalState.getRoom(room).setVote(socket.data.player, vote);
			this.refreshRoom(room, player);
		}
	}

	private changeRole(socket: PointingSocket, role: PlayerRole) {
		let room = socket.data.room;
		let player = socket.data.player;
		console.log(`change role: ${room}, value: ${role}, player: ${JSON.stringify(player)}`);
		if (room) {
			let roomState = this.globalState.getRoom(room);
			roomState.removePlayer(socket.data.player);
			if (role === "player") roomState.addPlayer(socket.data.player);
			else roomState.addSpectator(socket.data.player);

			this.refreshRoom(room, player);
		}
	}

	private disconnect(socket: PointingSocket) {
		console.log(`disconnect: ${JSON.stringify(socket.data.player)}, room: ${socket.data.room}`);
		if (socket.data.room) {
			if (socket.data.player) {
				let roomState = this.globalState.getRoom(socket.data.room);
				roomState.addLog(`[${socket.data.player.discipline}]${socket.data.player.name} left.`);
			}
			socket.leave(socket.data.room);
		}
		if (socket.data.player) {
			this.globalState.removePlayer(socket.data.player);
			if (socket.data.room) {
				this.refreshRoom(socket.data.room, null);
				setTimeout(() => this.globalState.checkRoom(socket.data.room as string), 5000);
			}
		}
	}

	private async refreshRoom(room: string, lastPlayer: PointingPlayer | null) {
		let state = this.globalState.getRoom(room);
		if (lastPlayer)
			state.ensurePlayer(lastPlayer);
		state.lastChangeUid = lastPlayer?.uid;
		console.log(`refresh: ${room}\n` + JSON.stringify(state));
		this.pointingSocket.in(room).emit("refresh", state);
	}
}
