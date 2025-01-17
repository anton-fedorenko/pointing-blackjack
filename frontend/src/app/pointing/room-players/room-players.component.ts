import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RoomState, Vote, VoteState, Player } from '@pointing/room-state.class';
import { UserStateService } from '@app/common/user-state.service';
import { PointingConstants } from '@pointing/pointing-constants.class';
import { IPointingResult, PointingUtils } from '@pointing/pointing-utils.service';
import { ColorUtils } from '@app/common/color-utils.class';
import { PointingApiService } from '@pointing/pointing-api.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { chain, find, isNumber, maxBy } from 'lodash';

@Component({
	selector: 'room-players',
	templateUrl: './room-players.component.html',
	styleUrls: ['./room-players.component.scss'],
	animations: [
		trigger('highlight', [
			state('none', style({'text-shadow': 'none'})),
			state('active', style({'text-shadow': '0 0 5px #00FF00'})),
			transition('none => active', animate('0.2s')),
			transition('active => none', animate('0.5s')),
		]),
	],
})
export class RoomPlayersComponent implements OnInit, OnChanges {

	@Input() state: RoomState;

	highlightedPlayers: {[uid: string]: any} = {};

	private calculatedDifference: {[key: number]: number};

	constructor(
		private userState: UserStateService,
		private pointingApi: PointingApiService) { }

	ngOnInit(): void {
		this.recalculateDifferences();
	}
	
	ngOnChanges(changes: SimpleChanges): void {
		/* istanbul ignore else */
		if (changes.state.currentValue !== changes.state.previousValue) { 
			if (this.state.lastChangeUid)
				this.highlightPlayer(this.state.lastChangeUid);
			this.recalculateDifferences();
		}
	}

	private highlightPlayer(uid: string): void {
		if (this.highlightedPlayers[uid])
			clearTimeout(this.highlightedPlayers[uid]);
		this.highlightedPlayers[uid] = setTimeout(() => {
				delete this.highlightedPlayers[uid];
		}, 500);
	}

	isShowVotes(): boolean {
		return PointingUtils.isVotingFinished(this.state);
	}

	makePlayer(): void {
		/* istanbul ignore if */
		if (this.isPlayer())
			return;
		this.pointingApi.switchToPlayer();
		//let current = remove(this.state.spectators, {uid: this.userState.getUid()})[0];
		//this.state.players.push(current);
	}

	makeSpectator(): void {
		/* istanbul ignore if */
		if (this.isSpectator())
			return;
		this.pointingApi.switchToSpectator();
		//let current = remove(this.state.players, {uid: this.userState.getUid()})[0];
		//this.state.spectators.push(current);
	}

	changeVote(direction: number): void {
		let myUser = find(this.state.players, player => this.isMyUser(player));
		let currentVote = myUser.vote;
		let vote = !this.isNumber(currentVote)
			? 1
			: PointingConstants.VOTE_VALUES[PointingConstants.VOTE_VALUES.indexOf(currentVote) + direction];
		this.pointingApi.vote(vote);
	}

	showDecrease(vote: Vote): boolean {
		return this.isNumber(vote) && vote > 0;
	}

	showIncrease(vote: Vote): boolean {
		return !this.isNumber(vote) || vote < 13;
	}

	isNumber(vote: Vote): boolean {
		return isNumber(vote);
	}
	getVoteColor(vote: Vote): string {
		return PointingConstants.VOTE_COLORS[vote];
	}
	isVoted(vote: Vote): boolean {
		return PointingUtils.isVoted(vote);
	}
	isPlayer(): boolean {
		return !!find(this.state.players, {uid: this.userState.getUid()});
	}
	isSpectator(): boolean {
		return !!find(this.state.spectators, {uid: this.userState.getUid()});
	}
	isMyUser(user: Player): boolean {
		return this.userState.getUid() === user.uid;
	}

	getDifferenceColor(vote: Vote): string {
		if (!this.isShowVotes())
			return;
		let green = '#00ff00';
		let red = '#ff0000';
		let alpha = '15'; // transparency
		if (vote === VoteState.none)
			return red + alpha;
		if (vote === null)
			return '';
		let diff = this.calculatedDifference[vote];
		if (diff === 0)
			return green + alpha;
		return ColorUtils.blendColors(green, red, diff) + alpha;
	}

	recalculateDifferences(): void {
		this.calculatedDifference = {};
		let topVotes = PointingUtils.getAggregatedResults(this.state).filter(topVote => topVote.isTop);
		let maxVote = maxBy(PointingConstants.VOTE_VALUES, v => isNumber(v) ? v : 0) as number;
		PointingConstants.VOTE_VALUES
			.filter(vote => isNumber(vote))
			.forEach((vote: number) => {
				let diff = chain(topVotes)
					.map((topVote: IPointingResult) => topVote.vote)
					.filter(topVote => topVote > 0)
					.map((topVote: number) => Math.abs(topVote - vote))
					.max()
					.value();
				
				this.calculatedDifference[vote] = Math.sqrt(diff / (maxVote - 1));
			});
		
	}

}
