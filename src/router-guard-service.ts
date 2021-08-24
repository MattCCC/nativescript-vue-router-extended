import {
  GuardReturnContext,
  NavigationGuardCallback,
  NextContext,
} from "./typings/router-guards-service";
import { Route } from "./typings/router-service";
import { NavigationHookAfter, RouteLocationNormalized } from "vue-router";

/**
 * Single Guard Service
 *
 * @class RouterGuardService
 */
export class RouterGuardService {
  /**
   * List of Guard Callbacks
   *
   * @private
   * @type {NavigationGuardCallback[]}
   * @memberof RouterGuardService
   */
  private guardCallbacks: NavigationGuardCallback[] = [];

  /**
   * Whether current navigation is cancelled from inside of guard
   *
   * @private
   * @memberof RouterGuardService
   */
  private isCancelled = false;

  /**
   * Context of next() call from last invoked callback
   *
   * @private
   * @memberof RouterGuardService
   */
  private lastContext = null;

  /**
   * Route we're going to navigate to
   *
   * @private
   * @memberof RouterGuardService
   */
  private routeTo: Route;

  /**
   * Current route
   *
   * @private
   * @memberof RouterGuardService
   */
  private routeFrom: Route;

  /**
   * Whether it's a hook or not
   *
   * @private
   * @memberof RouterGuardService
   */
  private isHook = false;

  /**
   * Initialize Guard Service
   *
   * @param {Route} to A route we are going to route to
   * @param {Route} from Current route
   * @param {boolean} isHook Define whether a hook is passed. Hooks don't return values and don't have a next() callback
   */
  public constructor(to: Route, from: Route, isHook = false) {
    this.setRoutes(to, from);

    this.isHook = isHook;
  }

  /**
   * Add a guard
   *
   * @param {NavigationGuardCallback} callback The callback to be added to the guard
   * @returns {void}
   */
  public add(callback: NavigationGuardCallback): void {
    this.guardCallbacks.push(callback);
  }

  /**
   * Execute all async callbacks
   *
   * @param {Array} arr Array of callbacks
   * @param {Function} predicate Callback function
   * @returns {boolean} True if predicate is executed
   */
  public async executeCallbacks(arr, predicate) {
    for (const e of arr) {
      if (await predicate(e)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Run guard callbacks
   *
   * @returns {GuardReturnContext} Return the context of the guard result
   */
  public run(): GuardReturnContext {
    // Set to true so by default route is allowed to continue
    this.lastContext = true;

    const next = (vmContext) => {
      // If next() is called without any argument then we should skip proceed to the next guard
      if (typeof vmContext === "undefined") {
        return;
      }

      // Collect only last context here since we don't need to track all next() invocations like in case of beforeRouteEnter
      this.lastContext = vmContext;

      if (vmContext === false) {
        this.isCancelled = true;
      }
    };

    this.executeCallbacks(
      this.guardCallbacks.filter((callback) => typeof callback === "function"),
      async (callback) => {
        if (this.isCancelled) {
          return true;
        }

        let result = null;

        if (this.isHook) {
          const hookCallback = callback as unknown as NavigationHookAfter;

          // Skip route normalization for now
          await hookCallback(
            this.routeTo as RouteLocationNormalized,
            this.routeFrom as RouteLocationNormalized
          );
        } else if (
          callback &&
          typeof (callback as unknown as Promise<any>).then === "function"
        ) {
          result = await callback(
            this.routeTo as RouteLocationNormalized,
            this.routeFrom as RouteLocationNormalized,
            next as NextContext
          );
        } else {
          result = callback(
            this.routeTo as RouteLocationNormalized,
            this.routeFrom as RouteLocationNormalized,
            next as NextContext
          );
        }

        // Explicitly cancelled within the guard
        if (result === false) {
          this.isCancelled = true;
          this.lastContext = false;

          return true;
        }

        // Either route redirection or an Error Instance
        if (result && result !== true) {
          this.isCancelled = true;
          this.lastContext = result;

          return true;
        }

        return false;
      }
    );

    return this.lastContext;
  }

  /**
   * Set routes for the guard so to inject the objects into callbacks
   *
   * @param {Route} to A route user is redirected to
   * @param {Route} from Current route
   * @returns {void}
   */
  public setRoutes(to: Route, from: Route): void {
    this.routeTo = to;
    this.routeFrom = from;

    // Cancel state must be reset, when new route is set
    this.isCancelled = false;
  }
}
