import { useSiteSettings } from '../hooks/useSiteSettings';
import LoadingScreen from './LoadingScreen';

// Share the Home/About subscription: no duplicate read or artificial delay.
// Other sections load independently once the main profile is ready.
export default function InitialContentGate({ children }) {
  const settings = useSiteSettings('homeContent');
  if (settings.loading || settings.error) {
    return <LoadingScreen error={settings.error} onRetry={settings.retry} />;
  }
  return children;
}
