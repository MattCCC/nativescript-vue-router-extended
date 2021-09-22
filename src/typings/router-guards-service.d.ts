import type {
    NavigationGuard,
    NavigationGuardNext,
} from 'vue-router';
import type { Route } from "./router-service";

export type NextCallback = (vm: any) => any;

export type NextContext = NavigationGuardNext;

export type GuardReturnContext = string | Route | boolean | Error;

export type BeforeEachGuardCallback = (to: Route, from?: Route, next?: NextContext) => void;

export type BeforeResolveGuardCallback = (to: Route, from?: Route, next?: NextContext) => void;

export type AfterEachHookCallback = (to: Route, from?: Route) => void;

export type BeforeRouteEnter = (to: Route, from?: Route, next?: NextContext) => void;

export type BeforeRouteLeave = (to: Route, from?: Route, next?: NextContext) => void;

export interface GuardsInitArgs {
    to: Route;
    from?: Route;
    next?: NextContext;
}