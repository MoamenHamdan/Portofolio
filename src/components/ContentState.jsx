import PropTypes from "prop-types";
export default function ContentState({ loading, error, onRetry }) {
  return <div className="mx-auto max-w-xl p-8 text-center text-gray-400" role={error ? 'alert' : 'status'} aria-busy={loading}>
    {loading ? <><div className="h-8 mb-4 rounded bg-white/10 animate-pulse" aria-hidden="true" /><p>Loading content…</p></> : <><p>Content is unavailable right now.</p>{onRetry && <button className="mt-4 px-5 py-3 border border-red-500/50 rounded-lg text-white" onClick={onRetry}>Try again</button>}</>}
  </div>;
}

ContentState.propTypes = { loading: PropTypes.bool, error: PropTypes.object, onRetry: PropTypes.func };
