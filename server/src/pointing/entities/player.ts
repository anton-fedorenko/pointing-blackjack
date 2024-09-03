export enum VoteState {
	none = "none",
}
export type Vote = number | VoteState | null;

export class PointingPlayer {
	uid: string;
	name: string;
	discipline?: string;
	vote?: Vote;

	constructor(uid: string, name: string, discipline?: string) {
		this.uid = uid;
		this.name = name;
		this.discipline = discipline;
	}
}
