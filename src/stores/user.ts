import { defineStore } from "pinia";
import usersService, {
	type UpdateUserBody,
	type UpdateUserResponse,
	type Gender,
	type HeardAboutUs,
	type ChangePasswordBody,
	type ChangePasswordResponse,
	type RequestPasswordRecoveryResponse,
	type ResetPasswordResponse,
} from "@/services/users.service";

export interface UserState {
	id: string | number | null;
	name: string | null;
	email: string | null;
	isAuthenticated: boolean;
	teachableUserId?: string | number | null;
	gender?: Gender | null;
	genderOther?: string | null;
	dateOfBirth?: string | null;
	heardAboutUs?: HeardAboutUs | null;
	heardAboutUsOther?: string | null;
	points?: number | null;
}

export const useUserStore = defineStore("user", {
	state: (): UserState => ({
		id: null,
		name: null,
		email: null,
		isAuthenticated: false,
		teachableUserId: null,
		gender: null,
		genderOther: null,
		dateOfBirth: null,
		heardAboutUs: null,
		heardAboutUsOther: null,
		points: null,
	}),
	actions: {
		hydrate() {
			const token = localStorage.getItem("access_token");
			const id = localStorage.getItem("user_id");
			const t = localStorage.getItem("teachable_user_id");
			this.isAuthenticated = !!token;
			this.id = id || null;
			this.teachableUserId = t || null;
		},
		setUser(payload: {
			id?: string | number;
			name?: string;
			email?: string;
			teachableUserId?: string | number;
		}) {
			if (payload?.id !== undefined && payload?.id !== null) {
				this.id = payload.id;
				try {
					localStorage.setItem("user_id", String(payload.id));
				} catch {}
			}
			if (payload?.name) this.name = payload.name;
			if (payload?.email) this.email = payload.email;
			if (
				payload?.teachableUserId !== undefined &&
				payload?.teachableUserId !== null
			) {
				this.teachableUserId = payload.teachableUserId;
				try {
					localStorage.setItem(
						"teachable_user_id",
						String(payload.teachableUserId)
					);
				} catch {}
			}
			this.isAuthenticated = true;
		},
		clear() {
			this.id = null;
			this.name = null;
			this.email = null;
			this.isAuthenticated = false;
			this.teachableUserId = null;
			this.gender = null;
			this.genderOther = null;
			this.dateOfBirth = null;
			this.heardAboutUs = null;
			this.heardAboutUsOther = null;
			this.points = null;
			try {
				localStorage.removeItem("user_id");
			} catch {}
			try {
				localStorage.removeItem("teachable_user_id");
			} catch {}
		},
		async updateById(
			userId: string | number,
			body: UpdateUserBody
		): Promise<UpdateUserResponse> {
			const { data } = await usersService.updateById<UpdateUserResponse>(
				userId,
				body
			);
			const u = data.user;
			this.name = u.name;
			this.email = u.email;
			if (u.teachableUserId !== undefined) {
				this.teachableUserId = u.teachableUserId ?? null;
				try {
					if (u.teachableUserId !== null)
						localStorage.setItem(
							"teachable_user_id",
							String(u.teachableUserId)
						);
				} catch {}
			}
			this.gender = u.gender;
			this.genderOther = u.genderOther;
			this.dateOfBirth = u.dateOfBirth;
			this.heardAboutUs = u.heardAboutUs;
			this.heardAboutUsOther = u.heardAboutUsOther;
			this.points =
				typeof u.points === "number" ? u.points : this.points ?? null;
			return data;
		},
		async changePassword(
			userId: string | number,
			payload: ChangePasswordBody
		): Promise<ChangePasswordResponse> {
			const { data } =
				await usersService.changePassword<ChangePasswordResponse>(
					userId,
					payload
				);
			return data;
		},
		async requestPasswordRecovery(
			email: string
		): Promise<RequestPasswordRecoveryResponse> {
			const { data } = await usersService.requestPasswordRecovery({
				email,
			});
			return data;
		},
		async resetPassword(
			token: string,
			newPassword: string
		): Promise<ResetPasswordResponse> {
			const { data } = await usersService.resetPassword({
				token,
				newPassword,
			});
			return data;
		},
	},
});
