export default function LoadingScreen({ error, onRetry }) {
  return (
    <div className="min-h-[100dvh] bg-[#030014] flex items-center justify-center px-6">
      <div className="relative text-center max-w-sm" role={error ? 'alert' : 'status'} aria-live="polite" aria-busy={!error}>
        <div className="absolute -inset-6 bg-red-600/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4 p-8">
          {!error && <div className="w-12 h-12 rounded-full border-4 border-red-700 border-t-transparent motion-safe:animate-spin" aria-hidden="true" />}
          <p className="text-gray-100 text-lg font-medium">{error ? 'Unable to load the portfolio' : 'Loading portfolio…'}</p>
          <p className="text-gray-400 text-sm">{error ? 'Please check your connection and try again.' : 'Getting the latest content ready.'}</p>
          {error && onRetry && <button onClick={onRetry} className="rounded-lg bg-red-700 px-5 py-3 text-white hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400">Try again</button>}
        </div>
      </div>
    </div>
  );
}
