import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isEmpty } from 'lodash';
import { UserStateService } from '../../common/user-state.service';

@Component({
	selector: 'login',
	template: `
		<div class="login-container">
			<form role="form" (ngSubmit)="onSubmit()">
				<label class='login-label'>Who are you, warrior?</label>
				<div class="input-group">
					<select class="form-control" 
						id="discipline" 
						required
						[(ngModel)]="userDiscipline" name="discipline">

						<option value="" disabled>What do you do?</option>
						<option *ngFor="let discipline of disciplines" [ngValue]="discipline">{{discipline}}</option>
					</select>
					<input type="text"
						[(ngModel)]="userName"
						class="form-control"
                        placeholder="Now, say your name"
						id="name" name="name"
						#name="ngModel"
						required minlength="3" />
					<div class="input-group-append">
						<button type="submit" [disabled]="name.invalid" class="btn btn-icon btn-dark">
							<i class="fa fa-sign-in"></i>
						</button>
					</div>
				</div>
				<div [hidden]="!heisenberg" class="alert alert-info m-t-8 p-t-4 p-b-4">You're God damn right</div>
			</form>
		</div>
	`,
	styles: [`
		.login-label {
			line-height: 1;
			margin-bottom: 0;
		}
		.login-container {
			display: flex;
			height: 100%;
			width: 100%;
			justify-content: center;
			align-items: center;
			form {
				display: flex;
			}
		}
	`]
})
export class LoginComponent implements OnInit {
	private returnUrl: string;
	userDiscipline: string = '';
	userName: string;
	heisenberg = false;
	disciplines: string[] = ['BA', 'BE', 'FE', 'QA'];

	constructor(
		private route: ActivatedRoute,
		private userStateService: UserStateService,
		private router: Router) { }

	ngOnInit() {
		/* istanbul ignore next */
		this.returnUrl = this.route.snapshot?.queryParams?.returnUrl || '/';
	}

	onSubmit() {
		/* istanbul ignore else */
		if (!isEmpty(this.userName)) {
			this.userStateService.login(this.userName, this.userDiscipline);
			if (/heisenberg/i.test(this.userName)) {
				this.heisenberg = true;
				setTimeout(() => {
					this.router.navigateByUrl(this.returnUrl);
				}, 2000);
			} else this.router.navigateByUrl(this.returnUrl);
		}
	}

}
