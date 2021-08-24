import {
    RouterOptions,
} from 'vue-router';

export type RouteChildren = Route;
export type ErrorCallback = Error | ((...args: any[]) => void);

export type RoutesList = Route[];

export type RouteToCallback = (toRouteItem: Route, options: RouteOptions) => void;

export type RouteBackCallback = (toRouteItem: Route, options: RouteOptions) => void;

export type NSVueRouterHistory = Array<Route['path']>;

export interface NSVueRouterOptions extends RouterOptions {
    routes: RoutesList;
    history?: string;
}

export interface Route extends RouteOptions {
    path: string;
    name?: string;
    component?: Component;
    children?: RouteChildren;

    beforeRouteEnter?: (to: Route, from: Route, next?: (vm: any) => void) => boolean;
    beforeRouteLeave?: (to: Route, from: Route, next?: (vm: any) => void) => boolean;
}

export interface RouteOptions {
    /**
     * List of route meta information
     * Can contain a store object with action names as keys and payload as values.
     * These actions will be dispatched once a particular route is navigated to
     */
    meta?: Record<string, any>;

    /**
     * Animation duration when switching a route
     */
    duration?: number;

    /**
     * Allows to pass props directly in $routeTo
     */
    props?: Record<string, any>;

    /**
     * Same as props, used internally for proper NS navigation support
     */
    context?: Record<string, any>;

    /**
     * Whether to clear previous records from the history
     */
    clearHistory?: boolean;

    /**
     * NativeScript compatible transition object
     */
    transition?: Record<string, any>;
}

export interface RouterServiceOptions {
    /**
     * Callback triggered when routeTo/push is invoked
     */
    routeToCallback: RouteToCallback;

    /**
     * Callback triggered when routeBack/back is invoked
     */
    routeBackCallback: RouteBackCallback;

    /**
     * Vue Instance
     */
    vm: any;

    /**
     * NS Frame Instance
     */
    frame: any;

    /**
     * Path to a route used as a fallback (default route), when user tries to navigate back but no path exists
     */
    routeBackFallbackPath?: string;

    /**
     * Custom logger instance (console by default)
     */
    logger?: Logger | Console | null;
}