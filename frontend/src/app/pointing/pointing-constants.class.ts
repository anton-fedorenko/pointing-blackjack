import { VoteState } from '@pointing/room-state.class';

export class PointingConstants {
	static readonly VOTE_COLORS = {
		0: '#A3ABBD',
		0.5: '#3bacf9',
		1: '#6bacf9',
		2: '#748EEA',
		3: '#7e6dc3',
		5: '#a15ab4',
		8: '#b13d90',
		13: '#bd1c66',
		none: '#A3ABBD',
		null: '#ffffff'
	};
	static readonly VOTE_VALUES = [0, 0.5, 1, 2, 3, 5, 8, 13, VoteState.none];
}
