import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Внутренние переходы только через эти обёртки: они сами держат префикс языка.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
