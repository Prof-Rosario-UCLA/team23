import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !avatarRef.current?.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-14 px-4 flex items-center justify-between border-b shadow-sm bg-white relative">
      <div className="text-xl font-bold text-gray-800">FlashMind</div>

      <nav
        className="flex items-center gap-3 relative"
        aria-label="Primary navigation"
      >
        {!user ? (
          <ul className="flex items-center gap-3">
            <li>
              <Link to="/auth?mode=login">
                <button className="px-4 py-1.5 text-sm rounded-full bg-black text-white hover:bg-gray-900">
                  Log in
                </button>
              </Link>
            </li>
            <li>
              <Link to="/auth?mode=signup">
                <button className="px-4 py-1.5 text-sm rounded-full border border-gray-300 hover:bg-gray-100">
                  Sign up
                </button>
              </Link>
            </li>
          </ul>
        ) : (
          <>
            <button
              ref={avatarRef}
              className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold cursor-pointer hover:opacity-90"
              title={user.username}
              onClick={() => setShowMenu((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={showMenu}
              aria-label="User menu"
            >
              {user.username.charAt(0).toUpperCase()}
            </button>

            {showMenu && (
              <menu
                ref={menuRef}
                className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded shadow-md p-3 z-50"
              >
                <div className="text-sm text-gray-700 font-medium mb-2 truncate">
                  {user.username}
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-100 text-red-600"
                >
                  Log out
                </button>
              </menu>
            )}
          </>
        )}
      </nav>
    </header>
  );
}
