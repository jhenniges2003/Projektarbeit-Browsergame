import { BrowserRouter, Routes, Route } from "react-router-dom"

import Menu from './pages/Menu.jsx';
import Lobby from './pages/Lobby.jsx';
import Game from './pages/Game.jsx';

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Menu />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </BrowserRouter>
    );
}