import PropTypes from "prop-types";
import { useState } from 'react';
export default function ContentImage({ src, alt, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) return <div className={props.className} role="img" aria-label={src ? `${alt}: image unavailable` : 'No image selected'} />;
  return <img {...props} src={src} alt={alt} decoding="async" onError={() => setFailedSrc(src)} />;
}

ContentImage.propTypes = { src: PropTypes.string, alt: PropTypes.string, className: PropTypes.string };
