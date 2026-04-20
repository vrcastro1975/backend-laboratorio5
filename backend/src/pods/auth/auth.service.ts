interface AuthUser {
  username: string;
  password: string;
  role: "admin" | "user";
}

const users: AuthUser[] = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "usuario", password: "123", role: "user" },
];

const tokenPrefix = "lab5-token";

export const login = (username: string, password: string) => {
  const user = users.find(
    (candidate) =>
      candidate.username === username && candidate.password === password
  );

  if (!user) {
    return null;
  }

  const token = `${tokenPrefix}:${user.username}:${user.role}`;

  return {
    token,
    role: user.role,
  };
};

export const getUserRoleFromToken = (
  token: string | undefined
): "admin" | "user" | null => {
  if (!token || !token.startsWith(`${tokenPrefix}:`)) {
    return null;
  }

  const [, , role] = token.split(":");
  if (role !== "admin" && role !== "user") {
    return null;
  }

  return role;
};
