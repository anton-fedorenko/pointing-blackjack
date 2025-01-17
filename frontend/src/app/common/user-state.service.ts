import { Injectable } from '@angular/core';
import { Property } from './storage/property.enum';
import { IStorage } from '@app/common/storage/storage.interface';
import { SessionStorageService } from '@app/common/storage/session-storage.service';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '@app/common/storage/local-storage.service';
import { RandomUtils } from '@app/common/random-utils.class';
import { isEmpty } from 'lodash';

export interface UserState {
	uid: string;
	name: string;
	discipline?: string;
}
@Injectable({
	providedIn: 'root'
})
export class UserStateService {

	private user: UserState;

	constructor(private localStorage: LocalStorageService, private sessionStorage: SessionStorageService) { }

	isLoggedIn(): boolean {
		return !!this.user;
	}

	tryLogin(): boolean {
		if (this.isLoggedIn())
			return true;
		const uid = this.getStorage().get(Property.UID);
		const name = this.getStorage().get(Property.NAME);
		const discipline = this.getStorage().get(Property.DISCIPLINE);
		const loggedIn = !isEmpty(uid) && !isEmpty(name);
		if (loggedIn) {
			this.user = {uid, name, discipline};
		}
		return loggedIn;
	}

	getUser(): UserState {
		return this.user;
	}

	login(name: string, discipline?: string): void {
		this.user = {
			uid: RandomUtils.generateUID(),
			name,
			discipline
		};
		this.getStorage().put(Property.UID, this.user.uid);
		this.getStorage().put(Property.NAME, this.user.name);
		this.getStorage().put(Property.DISCIPLINE, this.user.discipline);
	}

	logout(): void {
		this.getStorage().clear();
		delete this.user;
	}

	getStorage(): IStorage {
		return environment.useSession ? this.sessionStorage : this.localStorage;
	}

	getUid(): string {
		return this.user.uid;
	}

	getName(): string {
		return this.user.name;
	}

	getDiscipline(): string {
		return this.user.discipline;
	}
}
