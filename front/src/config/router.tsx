import { createBrowserRouter, Navigate } from 'react-router-dom';

import { Layout } from '../components/layout';
import { ROUTES } from './routes';
import { SandboxPage } from '../pages/sandbox';
import { NotFoundPage } from '../pages/not-found';
import { ResultsPage } from '../pages/results';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.SANDBOX} replace />,
      },
      {
        path: ROUTES.SANDBOX,
        element: <SandboxPage />,
      },
      {
        path: ROUTES.RESULTS,
        element: <ResultsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
