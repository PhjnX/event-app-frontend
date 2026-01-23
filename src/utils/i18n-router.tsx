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

export const useCurrentLang = () => {
  const params = useParams();
  return params.lang || "vi";
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

// 6. Switch Language
export const useLanguageSwitcher = () => {
  const location = useLocation();
  const navigate = useRouterNavigate();

  return (newLang: string) => {
    const currentPath = location.pathname;
    let newPath = currentPath.replace(/^\/[a-z]{2}/, `/${newLang}`);

    if (newPath === currentPath && !currentPath.match(/^\/[a-z]{2}/)) {
      const cleanPath = currentPath.startsWith("/")
        ? currentPath.substring(1)
        : currentPath;
      newPath = `/${newLang}/${cleanPath}`;
    }

    if (newPath !== currentPath) {
      navigate(newPath);
    }
  };
};

export { useParams };
