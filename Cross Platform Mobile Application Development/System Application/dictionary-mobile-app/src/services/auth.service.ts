import { ROLE_PERMISSIONS } from "@/constants/rbac";
import { palette } from "@/constants/theme";
import type { AuthSession, Role, User } from "@/types";

/**
 * MOCK enterprise auth service. There is no real backend, so credentials are
 * validated locally and tokens are simulated. Demonstrates login, register,
 * password reset and refresh-token flows used by the AuthContext.
 */

const DEMO_PASSWORD = "Password1!";
const ACCESS_TTL_MS = 1000 * 60 * 15; // 15 minutes
const NETWORK_DELAY = 600;

const avatarColors = [
  palette.accent,
  palette.info,
  palette.gray700,
  palette.success,
];

const SEED_USERS: Record<string, { user: User; password: string }> = {
  "student@lexitech.rw": {
    password: DEMO_PASSWORD,
    user: buildUser("student@lexitech.rw", "Aline Student", "student"),
  },
  "examiner@lexitech.rw": {
    password: DEMO_PASSWORD,
    user: buildUser("examiner@lexitech.rw", "Eric Examiner", "examiner"),
  },
  "admin@lexitech.rw": {
    password: DEMO_PASSWORD,
    user: buildUser("admin@lexitech.rw", "Admin LexiTech", "admin"),
  },
};

function buildUser(email: string, name: string, role: Role): User {
  return {
    id: `usr_${hash(email)}`,
    name,
    email,
    role,
    permissions: ROLE_PERMISSIONS[role],
    avatarColor: avatarColors[hash(email) % avatarColors.length],
    createdAt: Date.now(),
  };
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function delay<T>(value: T, ms = NETWORK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function issueSession(user: User): AuthSession {
  return {
    user,
    tokens: {
      accessToken: `mock.access.${hash(user.email + Date.now())}`,
      refreshToken: `mock.refresh.${hash(user.id)}`,
      expiresAt: Date.now() + ACCESS_TTL_MS,
    },
  };
}

export async function login(
  email: string,
  password: string,
): Promise<AuthSession> {
  const record = SEED_USERS[email.trim().toLowerCase()];
  if (!record || record.password !== password) {
    return delay(Promise.reject(new Error("Invalid email or password.")));
  }
  return delay(issueSession(record.user));
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: Role,
): Promise<AuthSession> {
  const key = email.trim().toLowerCase();
  if (SEED_USERS[key]) {
    return delay(
      Promise.reject(new Error("An account with this email already exists.")),
    );
  }
  const user = buildUser(key, name.trim(), role);
  SEED_USERS[key] = { password, user };
  return delay(issueSession(user));
}

export async function requestPasswordReset(
  email: string,
): Promise<{ token: string }> {
  // Simulates emailing a reset token. Returns it so the demo flow can continue.
  return delay({ token: `reset-${hash(email)}` });
}

export async function resetPassword(
  email: string,
  _token: string,
  newPassword: string,
): Promise<boolean> {
  const key = email.trim().toLowerCase();
  if (SEED_USERS[key]) {
    SEED_USERS[key].password = newPassword;
  }
  return delay(true);
}

export async function refreshSession(
  session: AuthSession,
): Promise<AuthSession> {
  // Mock refresh: re-issue a fresh access token from the stored refresh token.
  return delay(issueSession(session.user), 300);
}

export async function updateProfile(
  user: User,
  changes: Partial<Pick<User, "name" | "email">>,
): Promise<User> {
  const updated: User = { ...user, ...changes };
  const key = user.email.toLowerCase();
  if (SEED_USERS[key]) {
    SEED_USERS[key].user = updated;
  }
  return delay(updated);
}

export const DEMO_CREDENTIALS = {
  password: DEMO_PASSWORD,
  accounts: [
    { email: "student@lexitech.rw", role: "student" as Role },
    { email: "examiner@lexitech.rw", role: "examiner" as Role },
    { email: "admin@lexitech.rw", role: "admin" as Role },
  ],
};
