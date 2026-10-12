/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as content from "../content.js";
import type * as devLogins from "../devLogins.js";
import type * as http from "../http.js";
import type * as integrationChecks from "../integrationChecks.js";
import type * as lib_access from "../lib/access.js";
import type * as media from "../media.js";
import type * as setup from "../setup.js";
import type * as staff from "../staff.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  applications: typeof applications;
  auth: typeof auth;
  content: typeof content;
  devLogins: typeof devLogins;
  http: typeof http;
  integrationChecks: typeof integrationChecks;
  "lib/access": typeof lib_access;
  media: typeof media;
  setup: typeof setup;
  staff: typeof staff;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
