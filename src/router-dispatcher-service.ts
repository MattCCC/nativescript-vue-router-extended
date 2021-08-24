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
   * Current store
   */
  public store: any;

  /**
   * Constructor for the RouterDispatcherService
   *
   * @param {store} store The app store
   */
  public constructor(store: any) {
    this.store = store;
  }

  /**
   * Dispatch the meta as mapped actions
   *
   * @param {any} meta The meta we're going to map and send to the store as actions
   * @returns {boolean} If has finished dispatch or not
   */
  public dispatchFromMeta(meta: any): boolean {
    if (!meta || !this.store) {
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
    return this.store.dispatch(type, payload);
  }
}

/**
 * Registers generic action dispatcher
 *
 * @param {RouterService} router Vue-Router compatible class
 * @param {*} store Vuex Store Instance, or any other store that has a dispatch method exposed, with a type as 1st arg and payload as 2nd
 * @returns {void}
 */
export const registerActionDispatcher = (
  router: RouterService,
  store: any
): void => {
  const dispatcherService = new RouterDispatcherService(store);

  router.beforeResolve((to: Route, _from: Route, _next: NextContext) => {
    const route = router.getRoute(to);

    if (route && route.meta && route.meta.store) {
      dispatcherService.dispatchFromMeta(route.meta.store);
    }
  });
};
