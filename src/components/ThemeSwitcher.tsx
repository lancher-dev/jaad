/**
 * Stateless theme toggle. The inline script in the layout <head> already
 * applies the theme, and CSS picks the icon from that class, so this renders
 * identically on server and client and only needs JS for the click.
 */
export default function ThemeSwitcher() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="text-foreground-secondary hover:text-foreground-bright flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors"
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      {/* Light mode: click switches to dark. */}
      <svg
        className="theme-icon-to-dark h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* Dark mode: click switches back to light. */}
      <svg
        className="theme-icon-to-light h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    </button>
  );
}
