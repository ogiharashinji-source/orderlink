const LS_KEY = "admin_logged_in";

export let isAdminLoggedIn: boolean =
  typeof window !== "undefined"
    ? localStorage.getItem(LS_KEY) === "1"
    : false;

export function setAdminLoggedIn(value: boolean) {
  isAdminLoggedIn = value;
  if (typeof window !== "undefined") {
    if (value) localStorage.setItem(LS_KEY, "1");
    else localStorage.removeItem(LS_KEY);
  }
}
