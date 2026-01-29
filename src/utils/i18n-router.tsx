import React from "react";
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  useNavigate as useRouterNavigate,
  useParams,
  useLocation,
  type LinkProps,
  type NavLinkProps,
  type NavigateOptions,
  type To,
} from "react-router-dom";

export const DEFAULT_LANG = "vi";

export const useCurrentLang = () => {
  const params = useParams();
  return params.lang || DEFAULT_LANG;
};

export const getLangPath = (path: string, lang: string) => {
  if (
    path.startsWith("http") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("#")
  ) {
    return path;
  }

  if (path.startsWith("/admin")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  if (lang === DEFAULT_LANG && !cleanPath) {
    return "/";
  }

  return cleanPath ? `/${lang}/${cleanPath}` : `/${lang}`;
};

interface I18nLinkProps extends LinkProps {
  noLang?: boolean;
}

export const Link: React.FC<I18nLinkProps> = ({
  to,
  noLang,
  children,
  ...props
}) => {
  const lang = useCurrentLang();

  let dest = to;
  if (!noLang && typeof to === "string") {
    dest = getLangPath(to, lang);
  }

  return (
    <RouterLink to={dest} {...props}>
      {children}
    </RouterLink>
  );
};

export const NavLink: React.FC<NavLinkProps> = ({ to, children, ...props }) => {
  const lang = useCurrentLang();
  let dest = to;
  if (typeof to === "string") {
    dest = getLangPath(to, lang);
  }
  return (
    <RouterNavLink to={dest} {...props}>
      {children}
    </RouterNavLink>
  );
};

export const useCheckNavigate = () => {
  const navigate = useRouterNavigate();
  const lang = useCurrentLang();

  function customNavigate(delta: number): void;
  function customNavigate(to: To, options?: NavigateOptions): void;

  function customNavigate(to: To | number, options?: NavigateOptions) {
    if (typeof to === "number") {
      navigate(to);
    } else {
      if (typeof to === "string") {
        navigate(getLangPath(to, lang), options);
      } else {
        const newPathname = getLangPath(to.pathname || "", lang);
        navigate({ ...to, pathname: newPathname }, options);
      }
    }
  }

  return customNavigate;
};

export const useLanguageSwitcher = () => {
  const location = useLocation();
  const navigate = useRouterNavigate();
  const currentLang = useCurrentLang();

  return (newLang: string) => {
    if (currentLang === newLang) return;

    const currentPath = location.pathname;

    const prefixRegex = /^\/(en|vi)(\/|$)/;

    let newPath = currentPath;

    if (currentPath.match(prefixRegex)) {
      newPath = currentPath.replace(/^\/(en|vi)/, `/${newLang}`);
    } else {
      const cleanPath = currentPath === "/" ? "" : currentPath;
      newPath = `/${newLang}${cleanPath}`;
    }

    if (newLang === DEFAULT_LANG && (newPath === "/vi" || newPath === "/vi/")) {
      newPath = "/";
    }

    if (newPath.length > 1 && newPath.endsWith("/")) {
      newPath = newPath.slice(0, -1);
    }

    navigate(newPath + location.search + location.hash);
  };
};

export { useParams };
