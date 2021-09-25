import { NextContext } from "./typings/router-guards-service";
import { Route } from "./typings/router-service";
import { RouterService } from "./router-service";

/**
 * Standalone Action Dispatcher Service
 *
 * @description Handles dispatching of actions on per route basis
 */
export class RouterDispatcherService {
  /**
   * Current Vue instance
   */
  public vm: any;

  /**
   * Constructor for the RouterDispatcherService
   *
   * @param {Vue} vm Vue Instance
   */
  public constructor(vm: any) {
    this.vm = vm;
  }

  /**
   * Dispatch the meta as mapped actions
   *
   * @param {any} meta The meta we're going to map and send to the store as actions
   * @returns {boolean} If has finished dispatch or not
   */
  public dispatchFromMeta(meta: any): boolean {
    if (!meta || !this.vm) {
      return false;
    }

    if (!this.vm.$store) {
      console.error('META DISPATCHER', 'Store not found');

      return false;
    }

    Object.keys(meta).forEach((key) => {
      this.dispatch(key, meta[key]);
    });

    return true;
  }

  /**
   * Dispatch the meta as mapped actions
   *
   * @param {string} type The type destructed from meta to be dispatched
   * @param {any} payload The payload we're going to send to the store
   * @returns {Promise} Dispatched action result
   */
  public dispatch(type: string, payload: unknown): Promise<void> {
    return this.vm.$store.dispatch(type, payload);
  }
}

/**
 * Registers generic action dispatcher
 *
 * @param {RouterService} router  Vue-Router compatible class
 * @param {*} vm                  Vue Instance
 * @returns {void}
 */
export const registerActionDispatcher = (
  router: RouterService,
  vm: any
): void => {
  const dispatcherService = new RouterDispatcherService(vm);

  router.beforeResolve((to: Route, _from: Route, _next: NextContext) => {
    const route = router.getRoute(to);

    if (route && route.meta && route.meta.store) {
      dispatcherService.dispatchFromMeta(route.meta.store);
    }
  });
};
