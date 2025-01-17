/* istanbul ignore file */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomState, Vote, PlayerRole } from '@pointing/room-state.class';
import { PointingSocket } from '@pointing/pointing-socket';
import { UserStateService } from '@app/common/user-state.service';

@Injectable()
export class PointingApiService {
	readonly ROLE = 'pb-role';

	constructor(
		private pointingSocket: PointingSocket,
		private userState: UserStateService) {
	}
	
	private setLastRole(role: PlayerRole): void {
		this.userState.getStorage().put(this.ROLE, role);
	}

	private getLastRole(): PlayerRole {
		return this.userState.getStorage().get(this.ROLE) as PlayerRole;
	}

	getStateObserver(): Observable<RoomState> {
		this.pointingSocket.connect();
		return this.pointingSocket.fromEvent('refresh');
	}

	joinRoom(roomId: string): void {
		this.pointingSocket.emit('join', {
			uid: this.userState.getUid(),
			name: this.userState.getUser().name,
			discipline: this.userState.getUser().discipline,
			role: this.getLastRole(),
			room: roomId
		});
		this.pointingSocket.removeAllListeners('reconnect');
		this.pointingSocket.on('reconnect', () => this.joinRoom(roomId));
	}

	ping(): void {
		this.pointingSocket.emit('room:ping');
	}

	vote(vote: Vote): void {
		this.pointingSocket.emit('vote', vote);
	}

	reset(): void {
		this.pointingSocket.emit('reset');
	}

	show(): void {
		this.pointingSocket.emit('show');
	}

	switchToSpectator(): void {
		this.pointingSocket.emit('role', PlayerRole.spectator);
		this.setLastRole(PlayerRole.spectator);
	}

	switchToPlayer(): void {
		this.pointingSocket.emit('role', PlayerRole.player);
		this.setLastRole(PlayerRole.player);
	}

}
