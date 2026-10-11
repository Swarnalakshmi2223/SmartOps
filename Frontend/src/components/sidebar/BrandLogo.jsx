import "./BrandLogo.css";

/**
 * SmartOps brand logo.
 * Props:
 *   compact  - show only the mark (for a collapsed sidebar)
 *   tagline  - small line under the name
 */
const BrandLogo = ({ compact = false, size = "default", tagline = "Operations Platform" }) =>{
    return (
        <div className="so-logo">
            <div className="so-logo__mark" aria-hidden="true">
                <svg viewBox="0 0 40 40" width="26" height="26" fill="none">
                    {/* S built as a connected flow with two nodes */}
                    <path
                        d="M27 13.5 C25.2 11 14 10.5 14 16.5 C14 22 26 18.5 26 24.5 C26 30 14.5 29.5 13 26.5"
                        stroke="#ffffff"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle cx="27" cy="13.5" r="3" fill="#9fd0ff" stroke="#2b5fe6" strokeWidth="1.6" />
                    <circle cx="13" cy="26.5" r="3" fill="#9fd0ff" stroke="#2b5fe6" strokeWidth="1.6" />
                </svg>
            </div>

            {!compact && (
                <div className="so-logo__text">
                    <span className="so-logo__name">SmartOps</span>
                    <span className="so-logo__tagline">{tagline}</span>
                </div>
            )}
        </div>
    );
};

export default BrandLogo;