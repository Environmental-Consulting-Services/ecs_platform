import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { dbConnect } from "./index.js";
import { permissionModel } from "../apis/permissions/schema/permission.schema.js";
import { roleModel } from "../apis/roles/schema/role.schema.js";
import { UserModel } from "../apis/users/schema/user.schema.js";

const PERMISSIONS = [
  "view users",
  "create users",
  "edit users",
  "delete users",
  "view roles",
  "create roles",
  "edit roles",
  "delete roles",
  "view permissions",
  "view companies",
  "create companies",
  "edit companies",
  "delete companies",
  "view projects",
  "create projects",
  "edit projects",
  "delete projects",
];

const ROLE_PERMISSIONS = {
  admin: PERMISSIONS,
  creator: [
    "view companies",
    "create companies",
    "edit companies",
    "delete companies",
    "view projects",
    "create projects",
    "edit projects",
    "delete projects",
  ],
  member: [],
};

const BASELINE_USERS = [
  {
    roleName: "admin",
    first_name: "Admin",
    last_name: "User",
    email: "admin@ecscompliance.com",
    phone: "123456789",
    profileImage: "/public/images/admin.jpg",
  },
  {
    roleName: "creator",
    first_name: "Creator",
    last_name: "User",
    email: "creator@ecscompliance.com",
    profileImage: "/public/images/creator.jpg",
  },
  {
    roleName: "member",
    first_name: "Member",
    last_name: "User",
    email: "member@ecscompliance.com",
    profileImage: "/public/images/member.jpg",
  },
];

function getBootstrapPassword() {
  return process.env.BASELINE_BOOTSTRAP_PASSWORD || process.env.ADMIN_BOOTSTRAP_PASSWORD;
}

function imageUrl(path) {
  const baseUrl = process.env.APP_URL_API || "";
  return `${baseUrl}${path}`;
}

async function upsertPermissions(now) {
  await permissionModel.bulkWrite(
    PERMISSIONS.map((name) => ({
      updateOne: {
        filter: { name },
        update: {
          $setOnInsert: { name, created_at: now },
          $set: { updated_at: now },
        },
        upsert: true,
      },
    })),
  );

  const permissions = await permissionModel.find({ name: { $in: PERMISSIONS } }).sort({ created_at: 1, _id: 1 });
  const byName = new Map();
  const duplicates = new Map();

  for (const permission of permissions) {
    if (!byName.has(permission.name)) {
      byName.set(permission.name, permission);
    } else {
      const entries = duplicates.get(permission.name) || [byName.get(permission.name)._id.toString()];
      entries.push(permission._id.toString());
      duplicates.set(permission.name, entries);
    }
  }

  for (const permissionName of PERMISSIONS) {
    if (!byName.has(permissionName)) {
      throw new Error(`Missing permission after bootstrap upsert: ${permissionName}`);
    }
  }

  return { byName, duplicates };
}

async function upsertRoles(permissionByName, now) {
  const roleByName = new Map();

  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
    const permissionIds = permissionNames.map((permissionName) => permissionByName.get(permissionName)._id);
    const role = await roleModel.findOneAndUpdate(
      { name: roleName },
      {
        $setOnInsert: { name: roleName, created_at: now },
        $set: { permissions: permissionIds, updated_at: now },
      },
      { new: true, upsert: true },
    );
    roleByName.set(roleName, role);
  }

  return roleByName;
}

async function upsertBaselineUsers(roleByName, now) {
  const bootstrapPassword = getBootstrapPassword();
  const userByRoleName = new Map();

  for (const baselineUser of BASELINE_USERS) {
    const role = roleByName.get(baselineUser.roleName);

    if (!role) {
      throw new Error(`Missing baseline role: ${baselineUser.roleName}`);
    }

    const existingUser = await UserModel.findOne({ role: role._id }).sort({ created_at: 1, _id: 1 });

    if (existingUser) {
      userByRoleName.set(baselineUser.roleName, existingUser);
      continue;
    }

    const existingDefaultEmailUser = await UserModel.findOne({ email: baselineUser.email });

    if (existingDefaultEmailUser) {
      existingDefaultEmailUser.role = role._id;
      existingDefaultEmailUser.updated_at = now;
      await existingDefaultEmailUser.save();
      userByRoleName.set(baselineUser.roleName, existingDefaultEmailUser);
      continue;
    }

    if (!bootstrapPassword) {
      throw new Error(
        `Missing BASELINE_BOOTSTRAP_PASSWORD or ADMIN_BOOTSTRAP_PASSWORD; required to create ${baselineUser.email}`,
      );
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(bootstrapPassword, salt);
    const user = await UserModel.create({
      type: "user",
      first_name: baselineUser.first_name,
      last_name: baselineUser.last_name,
      email: baselineUser.email,
      phone: baselineUser.phone,
      password,
      created_at: now,
      updated_at: now,
      profile_image: imageUrl(baselineUser.profileImage),
      role: role._id,
    });

    userByRoleName.set(baselineUser.roleName, user);
  }

  return userByRoleName;
}

async function syncRoleUsers(roleByName, userByRoleName) {
  for (const [roleName, user] of userByRoleName.entries()) {
    const role = roleByName.get(roleName);
    await roleModel.updateOne({ _id: role._id }, { $addToSet: { users: user._id } });
  }
}

export async function bootstrapBaseline() {
  const now = new Date();

  await dbConnect();

  const { byName: permissionByName, duplicates } = await upsertPermissions(now);
  const roleByName = await upsertRoles(permissionByName, now);
  const userByRoleName = await upsertBaselineUsers(roleByName, now);
  await syncRoleUsers(roleByName, userByRoleName);

  const duplicateWarnings = [...duplicates.entries()].map(([name, ids]) => ({ name, ids }));
  const summary = {
    permissions: permissionByName.size,
    roles: roleByName.size,
    users: userByRoleName.size,
    duplicatePermissionWarnings: duplicateWarnings,
  };

  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

bootstrapBaseline()
  .then(() => {
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error(error);
    mongoose.connection.close().finally(() => process.exit(1));
  });
