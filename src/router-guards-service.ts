import {
  AfterEachHookCallback,
  BeforeEachGuardCallback,
  GuardReturnContext,
  BeforeResolveGuardCallback,
  GuardsInitArgs,
} from "./typings/router-guards-service";
import { Route } from "./typings/router-service";
import { RouterGuardService } from "./router-guard-service";

/**
 * Route Guards Service responsible for Guards execution
 */
export class RouterGuardsService {
  /**
   * Before Each Guard
   *
   * @private
   * @type {RouterGuardService}
   * @memberof RouterGuardsService
   */
  private beforeEach: RouterGuardService;

  /**
   * Before Resolve Guard
   *
   * @private
   * @type {RouterGuardService}
   * @memberof RouterGuardsService
   */
  private beforeResolve: RouterGuardService;

  /**
   * Before Resolve Guard
   *
   * @private
   * @type {RouterGuardService}
   * @memberof RouterGuardsService
   */
  private afterEach: RouterGuardService;

  public constructor({ to, from }: GuardsInitArgs) {
    this.beforeEach = new RouterGuardService(to, from);
    this.beforeResolve = new RouterGuardService(to, from);
    this.afterEach = new RouterGuardService(to, from, true);

    this.setRoutes(to, from);
  }

  /**
   * Append a callback to a global BeforeEach guards list
   *
   * @param {BeforeEachGuardCallback} callback The callback to be added to beforeEach guard
   * @returns {void}
   */
  public addBeforeEach(callback: BeforeEachGuardCallback): void {
    this.beforeEach.add(callback);
  }

  /**
   * Append a callback to a global BeforeResolve guards list
   *
   * @param {BeforeResolveGuardCallback} callback The callback to be added to beforeResolve guard
   * @returns {void}
   */
  public addBeforeResolve(callback: BeforeResolveGuardCallback): void {
    this.beforeResolve.add(callback);
  }

  /**
   * Append a callback to a global AfterEach guards list
   *
   * @param {AfterEachHookCallback} callback The callback to be added to afterEach guard
   * @returns {void}
   */
  public addAfterEach(callback: AfterEachHookCallback): void {
    this.afterEach.add(callback);
  }

  /**
   * Run before each global guard
   *
   * @returns {GuardReturnContext} Return the context of the guard result
   */
  public runBeforeEach(): GuardReturnContext {
    return this.beforeEach.run();
  }

  /**
   * Run before resolve global guard
   *
   * @returns {GuardReturnContext} Return the context of the guard result
   */
  public runBeforeResolve(): GuardReturnContext {
    return this.beforeResolve.run();
  }

  /**
   * Run global After Each hooks
   *
   * @returns {void}
   */
  public runAfterEach(): void {
    this.afterEach.run();
  }

  /**
   * Set routes for the guards to operate on
   *
   * @param {Route} to A route user is redirected to
   * @param {Route} from Current route
   * @returns {void}
   */
  public setRoutes(to: Route, from: Route): void {
    this.beforeEach.setRoutes(to, from);
    this.beforeResolve.setRoutes(to, from);
    this.afterEach.setRoutes(to, from);
  }
}
