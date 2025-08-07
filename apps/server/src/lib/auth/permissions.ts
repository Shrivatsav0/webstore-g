import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  product: ["create", "update", "delete", "view", "buy"],
} as const;

export const ac = createAccessControl(statement);

export const padmin = ac.newRole({
  product: ["create", "update", "delete", "view", "buy"],
});

export const puser = ac.newRole({
  product: ["view", "buy"],
});
