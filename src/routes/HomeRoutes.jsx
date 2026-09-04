import HomePage from '../pages/Home';

/**
 * homeRouteConfig — Route config for the public Home page.
 * All roles can access the home page.
 */
const homeRouteConfig = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '*',
    element: <HomePage />,
  },
];

export default homeRouteConfig;
