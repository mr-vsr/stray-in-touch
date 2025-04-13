import { Suspense, lazy } from 'react';
import { Loader } from './components';

// Lazy load routes
const Donations = lazy(() => import('./pages/donations/Donations'));
const UserHomePage = lazy(() => import('./pages/user-homepage/UserHomePage'));
// ... lazy load other routes

function App() {
    return (
        <Suspense fallback={<Loader type="fullscreen" />}>
            <Routes>
                {/* ... your routes */}
            </Routes>
        </Suspense>
    );
}