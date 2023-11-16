# Bakery.js -- Router

## Story

Bakery.js router use `radix tree`[^1] structure to store routes called route tree (routeTree). All requests will try find a route from the route tree, and __only one__ [^2] route will be found per request. router use request's `method` and `path` to find a route. The path will be split into segments, and each `segment` will be as the key to find the `node` on the route tree. Router will __priority__[^3] try to find matching segment node, if not found, router will try to find `param` node and use segment as param value. If still not found, router will throw 404 error. If full path has been matched on the route tree node path, router will __priority__[^4] try to find matching method route, if not found, router will try to find `ALL` method route. If still not found, router will throw 405 error. In routing process, router will



## Concepts

* __Router__: The Router is the primary middleware in Bakery.js used for routing requests. It searches for a route within the routeTree. During this process, the Router activates node processes along the path and aggregates method processes, node route processes, and route processes. Once the Router has identified the appropriate route, these collected processes are utilized to process the request and generate a response.
<br>

* __prefix__: The prefix is the path prefix for all routes under the router. For example, if we have a route `GET:/users/:id`, and the prefix is `/api/v1`, the full path of the route is `/api/v1/users/:id`. When you setup prefix, router class constructor will generate nodes on the route tree, and set current node to the last node of the prefix path.
<br>

* RouteTree: RouteTree is the radix tree structure to store routes. It consists of Node and Route. It

* Node:

* Route:

* Routing:

* Segment:

* Param:

* Method:

* Node Processes:

* Method Processes:

* Route Processes:










[^1]: https://en.wikipedia.org/wiki/Radix_tree

[^2]: Most of web frameworks router will find all matched routes, and dispatch the request to all of them. But this make me very frustrated. For example, if we have two routes: `GET:/users/current` and `GET:/users/:id` (This may not be a good example. RESTful API does not work like this), and a request `GET:/users/current`, the request will be dispatched to both routes. But this not what we want. We want the request only be dispatched to `/users/current`. So, Bakery.js router will only find one route per request.

[^3]: The segment node always has higher priority than param node. For example, if we have two routes: `GET:/users/:id` and `GET:/users/current`, and a request `GET:/users/current`, the request will be dispatched to route `GET:/users/current`. no matter which route is defined first.

[^4]: The Other Methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) always has higher priority than `ALL` method. For example, if we have two routes: `ALL:/users/:id` and `GET:/users/:id`, and a request `GET:/users/1000`, the request will be dispatched to route `GET:/users/:id`. no matter which route is defined first.