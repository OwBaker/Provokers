
import { createRoot } from 'react-dom/client';
import './index.css';
import { GameProvider } from './context/GameContext.tsx';
import Home from './pages/Home.tsx';
import Game from './pages/Game.tsx';
import Room from './pages/room.tsx';

import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    element: <GameProvider><Outlet/></GameProvider>,
    children: [
      { path: "/", element: <Home />},
      { path: "/room", element: <Room />},
      { path: "/game", element: <Game />}
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
