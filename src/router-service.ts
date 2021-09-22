import type Vue from "nativescript-vue";
import {
  NSVueRouterOptions,
  RouterServiceOptions,
  RouteOptions,
  ErrorCallback,
  Route,
  RouteBackCallback,
  RouteToCallback,
  NSVueRouterHistory,
} from "./typings/router-service";

import { RouterGuardsService } from "./router-guards-service";
import {
  AfterEachHookCallback,
  BeforeEachGuardCallback,
  BeforeResolveGuardCallback,
  GuardReturnContext,
} from "./typings/router-guards-service";

/**
 * Routing Service
 */
export class RouterService {
  /**
   * List of routes
   */
  public readonly routes: Route[] = [];

  /**
   * History list of route paths
   */
  public history: NSVueRouterHistory = [];

  /**
   * Current Route
   */
  public currentRoute: Route;

  /**
   * Whether navigation happens
   */
  public isNavigating: boolean;

  /**
   * New route to which navigation will happen
   */
  public newRoute: Route | null;

  /**
   * Router Guards Service
   */
  public routerGuardsService: RouterGuardsService = null;

  /**
   * The function that will be executed to handle the routing to
   */
  public routeToCallback: RouteToCallback;

  /**
   * The function that will be executed to handle the routing back
   */
  public routeBackCallback: RouteBackCallback;

  /**
   * Define path that will be used as a fallback one when using RouteBack without any entries in history
   */
  public routeBackFallbackPath: string;

  /**
   * Logging info for devs
   */
  protected logger: any;

  /**
   * The default options used when not specified
   */
  protected defaultOptions: RouteOptions = {
    transition: {
      duration: 100,
    },
    meta: {
      props: {},
    },
  };

  /**
   * Current Vue Instance
   */
  private vm: any;

  /**
   * NS Frame Instance
   */
  private frame: any;

  /**
   * The list of errors callbacks
   */
  private errorCallbacks: ErrorCallback[];

  /**
   * The init of instance
   *
   * @param {NSVueRouterOptions} vueRouterOptions Vue Router compatible options
   * @param {RouterService} routerOptions Router Service options
   */
  public constructor(
    { routes = [] }: NSVueRouterOptions,
    {
      routeToCallback = null,
      routeBackCallback = null,
      routeBackFallbackPath = "",
      logger = null,
      frame = null,
      vm = null,
    }: RouterServiceOptions
  ) {
    this.routes = routes;
    this.routeToCallback = routeToCallback;
    this.routeBackCallback = routeBackCallback;
    this.routeBackFallbackPath = routeBackFallbackPath;
    this.logger = logger || console.log;
    this.vm = vm;
    this.frame = frame;

    this.routerGuardsService = new RouterGuardsService({
      to: null,
      from: null,
    });
  }

  /**
   * Navigate to a route with default options
   * Vue-Router API compatible
   *
   * @param {Route | string} route A route name, path or a specific route object
   * @param {RouteOptions} options The options for current routing to
   * @returns {void}
   */
  public push(route: Route | string, options: RouteOptions = {}): void {
    this.navigateTo(route, options);
  }

  /**
   * Go back in history if possible
   * Vue-Router API compatible
   *
   * @param {RouteOptions} options Mobile related Route Options that will be passed to routeBackCallback
   * @param {string} emptyRouteFallbackPath specify a custom route you want to go back to when history is empty
   * @returns {void}
   */
  public back(options: RouteOptions = {}, emptyRouteFallbackPath = null): void {
    this.navigateBack(options, emptyRouteFallbackPath);
  }

  /**
   * Append an On Error callback as per Vue-Router API
   * Vue-Router API compatible
   *
   * @param {ErrorCallback} callback The callback for the error
   * @returns {void}
   */
  public onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Appends a callback to a global beforeEach guards list
   * This callback is executed before any native event is triggered
   * To facilitate expected execution within mobile environment, contrary to Vue-Router, it is invoked before "beforeRouteLeave" is triggered
   * Vue-Router API compatible
   *
   * @param {BeforeEachGuardCallback} callback The callback to be added to the guard
   * @returns {void}
   */
  public beforeEach(callback: BeforeEachGuardCallback): void {
    this.routerGuardsService.addBeforeEach(callback);
  }

  /**
   * Appends a callback to a global beforeResolve guards list
   * This callback is executed within native navigatingTo event so when entering a page
   * Vue-Router API compatible
   *
   * @param {BeforeResolveGuardCallback} callback The callback to be added to the guard
   * @returns {void}
   */
  public beforeResolve(callback: BeforeResolveGuardCallback): void {
    this.routerGuardsService.addBeforeResolve(callback);
  }

  /**
   * Invokes all beforeResolve guards
   *
   * @returns {boolean} True when redirection is allowed
   */
  public invokeBeforeResolve(): boolean {
    const context = this.routerGuardsService.runBeforeResolve();

    if (!this.performContextAction(context)) {
      this.setNavigationState(false);

      return false;
    }

    return true;
  }

  /**
   * Append a callback to a global AfterEach guards list
   * Vue-Router API compatible
   *
   * @param {AfterEachHookCallback} callback The callback to be added to the guard
   * @returns {void}
   */
  public afterEach(callback: AfterEachHookCallback): void {
    this.routerGuardsService.addAfterEach(callback);

    // Finish navigation by resetting everything
    this.setNavigationState(false);
  }

  /**
   * Invokes all AfterEach guards
   *
   * @returns {void}
   */
  public invokeAfterEach(): void {
    this.routerGuardsService.runAfterEach();
  }

  /**
   * Update current vm instance
   *
   * @param {object} vm The vm instance from component
   * @returns {void}
   */
  public updateVm(vm: Vue): void {
    this.vm = vm;
  }

  /**
   * Get route information by a name or path
   *
   * @param {Route | string} route Either path or name of the route
   * @returns {Route | null} Route object or null if route is not found
   */
  public getRoute(route: Route | string): Route | null {
    if (!route) {
      return null;
    }

    let routePath = "";

    if (typeof route === "string") {
      routePath = route;
    } else if (typeof route === "object") {
      routePath = route.name || route.path;
    }

    return (
      this.routes.find(
        ({ path, name }) => path === routePath || name === routePath
      ) || null
    );
  }

  /**
   * Get current route
   *
   * @returns {Route | null} Current route object or null if there are no routes
   */
  public getCurrentRoute(): Route | null {
    return this.getRoute(this.currentRoute);
  }

  /**
   * Set current route
   *
   * @param {Route} route New route object
   * @returns {void}
   */
  public setCurrentRoute(route: Route): void {
    this.currentRoute = route;

    this.vm.$route = Object.assign(this.vm.$route, route);
  }

  /**
   * Get current route
   *
   * @returns {Route | null} New route object or null if there are no routes
   */
  public getNewRoute(): Route | null {
    return this.newRoute;
  }

  /**
   * Get previous route
   *
   * @returns {Route | null} Previous route object or null if there are no routes
   */
  public getPreviousRoute(): Route | null {
    const historyEntryNo = this.history.length - 1;

    if (historyEntryNo < 0) {
      return null;
    }

    if (!this.history[historyEntryNo]) {
      return null;
    }

    return this.getRoute(this.history[historyEntryNo]);
  }

  /**
   * Set navigation state so whether navigation is ongoing or not
   *
   * @param {boolean} toggle True to set navigating state
   * @returns {void}
   */
  public setNavigationState(toggle: boolean): void {
    this.isNavigating = toggle;

    if (!this.isNavigating) {
      this.setNewRoute(null);
    }
  }

  /**
   * Append route history
   *
   * @param {string} routePath Route path to add
   * @returns {void}
   */
  public appendRouteHistory(routePath: string): void {
    this.history.push(routePath);
  }

  /**
   * Clear route history
   *
   * @returns {void}
   */
  public clearRouteHistory(): void {
    this.history.splice(0);
  }

  /**
   * Check if a route exists
   *
   * @param {Route | string} route The route requested to check if exists
   * @returns {boolean} True if route exists
   */
  private isRouteAvailable(route: Route | string): boolean {
    return Object.keys(this.getRoute(route) || {}).length > 0;
  }

  /**
   * Set new route to which navigation is about to happen
   *
   * @param {Route} route The route requested to check if exists
   * @returns {void}
   */
  private setNewRoute(route: Route) {
    this.newRoute = route;
  }

  /**
   * Check if can route to new page
   *
   * @param {Route | string} route Current route path or route object that we want to route for
   * @returns {boolean} The result if can route or not
   */
  private isValidRoute(route: Route | string): boolean {
    let logMessage = "";

    if (!this.isRouteAvailable(route)) {
      const routePath =
        typeof route === "object" && route && route.path
          ? route.path
          : route.toString();

      logMessage = `Route ${routePath} is missing`;
    }

    if (logMessage && this.logger) {
      this.logger.warn("ROUTER", logMessage);

      return false;
    }

    return true;
  }

  /**
   * Going to specific route
   *
   * @param {Route | string} route A route name, path or a specific route object
   * @param {RouteOptions} options The options for current routing to
   * @param {boolean} isNavigatingBack Whether navigation happens backwards or not
   * @returns {void}
   */
  private navigateTo(
    route: Route | string,
    options: RouteOptions = {},
    isNavigatingBack = false
  ): void {
    if (!this.isValidRoute(route)) {
      return;
    }

    const previousRoute = this.getCurrentRoute();
    const newRoute = this.getRoute(route);
    const routeOptions = {
      ...this.defaultOptions,
      ...options,
    };

    // Ensure that props are defined to avoid potential route stuck inside async calls
    routeOptions.props = routeOptions.props || {};
    routeOptions.context = routeOptions.props;

    // Ensure that new route has all necessary structs
    newRoute.meta = newRoute.meta || {};

    // Allow to pass props directly into $routeTo on mobile
    newRoute.meta.props = {
      ...newRoute.meta,
      ...(newRoute.meta.props || {}),
      ...routeOptions.props,
    };

    // Route is confirmed, proceed with guards
    this.setNavigationState(true);
    this.setNewRoute(newRoute);

    this.routerGuardsService.setRoutes(newRoute, previousRoute);

    const context = this.routerGuardsService.runBeforeEach();

    if (!this.performContextAction(context)) {
      this.setNavigationState(false);

      return;
    }

    // Navigation happens within a modal. Retrigger navigatedFrom event from parent
    // This must happen after callback is allowed to be executed
    if (this.vm.$modalPage) {
      const modal = this.vm.$modalPage;

      if (modal.instance && modal.data) {
        modal.instance.onNavigatingFrom(modal.data);
      }

      this.vm.$modalPage = null;
    }

    if (isNavigatingBack) {
      // Ensure that callback is specified
      if (this.routeBackCallback) {
        this.routeBackCallback(newRoute, routeOptions);
      }

      this.vm.$navigateBack(routeOptions);
    } else {
      // Ensure that callback is specified
      if (this.routeToCallback) {
        this.routeToCallback(newRoute, routeOptions);
      }

      this.vm.$navigateTo(newRoute.component, routeOptions);
    }

    this.setCurrentRoute(newRoute);

    if (routeOptions.clearHistory) {
      this.clearRouteHistory();
    }

    if (!isNavigatingBack && previousRoute) {
      this.appendRouteHistory(previousRoute.path);
    }

    if (isNavigatingBack && this.history.length > 0) {
      this.history.pop();
    }
  }

  /**
   * Go back in history if possible
   *
   * @param {RouteOptions} options Route options
   * @param {string} emptyRouteFallbackPath specify a custom route you want to go back to when history is empty
   * @returns {void}
   */
  private navigateBack(
    options: RouteOptions = {},
    emptyRouteFallbackPath = null
  ): void {
    let newRoute = this.getPreviousRoute();

    if (
      !newRoute ||
      (this.frame.topmost() && this.frame.topmost().backStack.length < 1)
    ) {
      const alternativePath =
        emptyRouteFallbackPath || this.routeBackFallbackPath;

      if (alternativePath) {
        newRoute = this.getRoute(alternativePath);

        options.clearHistory = true;

        // Perform standard redirection without backwards flag set
        this.navigateTo(newRoute, options);
      }

      if (!newRoute && this.logger) {
        this.logger.warn("ROUTER", "No route to go back to");
      }

      return;
    }

    this.navigateTo(newRoute, options, true);
  }

  /**
   * Performs context dependent action so to redirect or output an error if necessary
   *
   * @param {GuardReturnContext} context The context retruned from the guard
   * @returns {boolean} The result of the context received the router service will behave
   */
  private performContextAction(context: GuardReturnContext): boolean {
    if (context === false) {
      return false;
    }

    if (context instanceof Error) {
      this.onError(context);

      return false;
    }

    if (typeof context === "object" || typeof context === "string") {
      this.navigateTo(context);

      return false;
    }

    return true;
  }
}
