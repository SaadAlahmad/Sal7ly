import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Label>I am a:</Label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" value="user" {...form.register("role")} />
          Client
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="craftsman" {...form.register("role")} />
          Craftsman
        </label>
      </div>
      {form.formState.errors.role && (
        <p className="text-sm text-red-500">
          {form.formState.errors.role.message}
        </p>
      )}
      <Label htmlFor="emailLabel">Email</Label>
      <Input
        id="input-email"
        placeholder="Enter email"
        {...form.register("email")}
      />
      {form.formState.errors.email && (
        <p className="text-sm text-red-500">
          {form.formState.errors.email.message}
        </p>
      )}
      <Label htmlFor="passwordLabel">Password</Label>
      <Input
        id="input-password"
        type="password"
        placeholder="******"
        {...form.register("password")}
      />
      {form.formState.errors.password && (
        <p className="text-sm text-red-500">
          {form.formState.errors.password.message}
        </p>
      )}
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginPage;
