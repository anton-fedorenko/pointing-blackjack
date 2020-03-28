import { Component, OnInit, Input } from '@angular/core';
import { RoomState, Vote, VoteState } from 'src/app/pointing/room-state.class';
import * as _ from 'lodash';
import { UserStateService } from 'src/app/common/user-state.service';
import { PointingConstants } from 'src/app/pointing/pointing-constants.class';
import { PointingUtils } from 'src/app/pointing/pointing-utils.service';

@Component({
	selector: 'room-players',
	templateUrl: './room-players.component.html',
	styleUrls: ['./room-players.component.scss']
})
export class RoomPlayersComponent implements OnInit {

	@Input() state: RoomState;

	constructor(private userState: UserStateService) { }

	ngOnInit(): void {
	}

	isShowVotes(): boolean {
		return PointingUtils.isVotingFinished(this.state);
	}

	makePlayer(): void {
		let current = _.remove(this.state.spectators, {uid: this.userState.getUid()})[0];
		this.state.players.push(current);
	}

	makeSpectator(): void {
		let current = _.remove(this.state.players, {uid: this.userState.getUid()})[0];
		this.state.spectators.push(current);
	}

	isNumber(vote: Vote): boolean {
		return _.isNumber(vote);
	}
	getVoteColor(vote: Vote): string {
		return PointingConstants.VOTE_COLORS[vote];
	}
	isDunno(vote: Vote): boolean {
		return vote === VoteState.none;
	}
	isVoted(vote: Vote): boolean {
		return !_.isUndefined(vote);
	}
	isWait(vote: Vote): boolean {
		return vote === VoteState.wait;
	}
	isPlayer(): boolean {
		return !!_.find(this.state.players, {uid: this.userState.getUid()});
	}
	isSpectator(): boolean {
		return !!_.find(this.state.spectators, {uid: this.userState.getUid()});
	}

}
