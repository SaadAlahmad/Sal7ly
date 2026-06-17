import { instance } from "./axios";
import { type LoginFormData } from "@/lib/validations/auth";
import { type User, type Craftsman } from "@/types";

export type LoginResponse = {
  status: boolean;
  message: string;
  token: string;
  account: User | Craftsman;
};

export const login = async (data: LoginFormData): Promise<LoginResponse> => {
  const response = await instance.post<LoginResponse>("/auth/login", data);

  return response.data;
};
