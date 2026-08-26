import Cookies from "js-cookie";

const TOKEN_COOKIE = "pghlasdetg";

export function performLogout() {
  Cookies.remove(TOKEN_COOKIE);
  window.location.href = "/";
}
