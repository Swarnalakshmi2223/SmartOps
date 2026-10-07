import { FiBell, FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

import "./Navbar.css";

const Navbar = ({ title, subtitle }) => {

    const { user } = useAuth();

    return (
        <header className="navbar">

            <div className="navbar-page-info">

                <h1>
                    {title}
                </h1>

                {subtitle && (
                    <p>
                        {subtitle}
                    </p>
                )}

            </div>

            <div className="navbar-actions">

                <button
                    type="button"
                    className="navbar-notification"
                    aria-label="Notifications"
                >
                    <FiBell />

                    <span className="notification-dot"></span>
                </button>

                <div className="navbar-divider"></div>

                <div className="navbar-user">

                    <div className="navbar-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="navbar-user-info">

                        <strong>
                            {user?.name}
                        </strong>

                        <span>
                            {user?.role}
                        </span>

                    </div>

                    <FiChevronDown className="navbar-chevron" />

                </div>

            </div>

        </header>
    );
};

export default Navbar;