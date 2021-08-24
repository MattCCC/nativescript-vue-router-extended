# NativeScript Vue Router

[npm-url]: https://npmjs.org/package/nativescript-vue-router-extended
[npm-image]: http://img.shields.io/npm/v/nativescript-vue-router-extended.svg

[![NPM version][npm-image]][npm-url] [![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://github.com/MattCCC/nativescript-vue-router-extended) [![Code Coverage](https://badgen.now.sh/badge/coverage/0.00/blue)](https://github.com/MattCCC/nativescript-vue-router-extended) [![npm downloads](https://img.shields.io/npm/dm/nativescript-vue-router-extended.svg?style=flat-square)](http://npm-stat.com/charts.html?package=nativescript-vue-router-extended) [![install size](https://packagephobia.now.sh/badge?p=nativescript-vue-router-extended)](https://packagephobia.now.sh/result?p=nativescript-vue-router-extended)

[nativescript-vue-router-extended](https://github.com/mattCCC/nativescript-vue-router-extended)

NativeScript Vue Router brings easier routing handling to mobile apps, with an API compatibility with web version of Vue Router.

Please file an issue or make a PR if you spot any problems or you have any further requests regarding the functionality.

## Table of Contents

- [Features](#features)
- [Todo](#todo)
- [Prerequisites / Requirements](#prerequisites-requirements)
- [Installation](#installation)
- [Usage & Examples](#usage-examples)
- [New hooks for pages](#new-hooks-for-pages)
- [API & Limitations](#api-limitations)

## Features

- Same hooks and guards for mobile and web
- Additional action dispatcher to dispatch actions to store automatically when changing routes
- Vue-Router 4 API compatibility
- NativeScript-Vue compatible
- TypeScript Support out of the box

## Todo

- Test coverage
- More compatibility (PRs and issues are welcomed so don't hesistate to report please)

## Prerequisites / Requirements

Nativescript 7.1+ is required for the plugin to run properly. It might be working on previous NS6 although the plugin is no longer officially supported for NativeScript 6.

## Installation

```javascript
tns plugin add nativescript-vue-router-extended

or

npm install nativescript-vue-router-extended

or

yarn add nativescript-vue-router-extended
```

[nativescript-vue-router-extended](https://www.npmjs.com/package/nativescript-vue-router-extended)

## Usage & Examples

To use this plugin you need to import it and initialize the router using `createRouter()` function. Global and per component Vue-Router hooks and guards are supported.

```javascript
import Vue from "nativescript-vue";
import { createRouter } from "nativescript-vue-router-extended";

// Initialize Example Routes
import moviesPage from "./pages/movies.vue";

const routes = [
  {
    path: "/movies",
    component: moviesPage,
    meta: {
      isVertical: true,
      store: {
        showNavigationButtons: false,
      },
    },
  },
];

// Initialize Router
// Vue-Router settings are in 1st argument. 2nd one is used for extra NativeScript related settings
const router = createRouter(
  { routes },
  {
    // Optional settings below

    // Set first page to redirect to when there's no page to redirect back to
    routeBackFallbackPath: "/movies",

    // Do something straight before navigation or adjust NS routing settings
    routeToCallback: (to, options) => {
      // For example, change page navigation transition for the vertical on iOS
      if (to.meta.isVertical) {
        options.transition = {
          name: "fade",
        };
      }
    },

    // Do something straight before navigation or adjust NS routing settings
    routeBackCallback: (_to, options) => {
      //
    },

    // Set Vue Instance (Vue.prototype by default)
    vm: Vue.prototype,

    // Set a custom logger (console.log by default)
    logger: console.log,

    // Set custom frame, by default it's taken from @nativescript/core/ui/frame
    frame: Frame,
  }
);

// Register a global guard (optional)
// You can also use global router.beforeResolve guard and router.afterEach hook
router.beforeEach((to) => {
  // For example, verify per route access rules
  if (!canAccessRoute(to)) {
    return false;
  }

  return true;
});

// From now on you can access this.$router, this.$routeBack and special this.$routeTo inside of the components, example:
this.$routeTo("/movies", {
  // Clear History is a NativeScript setting
  clearHistory: true,
  props: {
    movieId: 12,
  },
});
```

## New hooks for pages

You can use hooks directly on particular pages. It is discouraged to use them inside of mixins or components for the time being. Example below:

```javascript
<template>
    <Page>
    </Page>
</template>

<script>

export default {
    name: 'movies',

    beforeRouteEnter(to, from, next) {
        // Do something before to enter to the route
        next((vm) => {
            // Do something once navigation is done
            // Instead of `this`, use `vm`
        });
    },

    beforeRouteLeave() {
        // Do something before to leave the route
        // You can use `this` inside of this hook
    },

    beforeRouteUpdate() {
        // Do something before to leave the route
        // before redirecting to another route with same path
        // You can use `this` inside of this hook
    },
};
</script>
```

| NS Event       | Mapped as           | Description                                                                                                                                                                                                                                                                                                  |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| navigatingFrom | `beforeRouteLeave`  | Before user leaves the route                                                                                                                                                                                                                                                                                 |
| navigatingTo   | `beforeRouteEnter`  | Before user enters a route                                                                                                                                                                                                                                                                                   |
| -              | `beforeRouteUpdate` | Before route is changed but view remains the same. This can happen when path is exactly the same but you change e.g. passed prop to the route. Please refer to Vue-Router docs for more details.                                                                                                             |
| navigatedTo    | `beforeRouteEnter`  | To trigger it properly you need to access component instance. You can use `next(vm => ...)` callback within `beforeRouteEnter()`. Please check Vue-Router docs for more details.                                                                                                                             |
| navigatedFrom  | -                   | This event is tricky to control for developers. There is no exact mapping of it in the router. For store state cleanup use build-in meta dispatcher instead. For component state you could opt for using `beforeRouteLeave()`. You could potentially use `navigatedFrom` directly inside of the page but you |

## API & Limitations

This plugin aims for compatibility with Vue Router 3+ and Vue Router 4+. Both should be easily supported. Please refer to [Vue Router Docs](https://next.router.vuejs.org/guide/) for more information. There are some obvious limitations like lack of DOM accessibility and related events, or lack of <router-link /> component.

## License

Apache License Version 2.0, January 2004
