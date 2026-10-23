/** localStorage key for the admin's theme choice ("light"; dark is the default). */
export const THEME_KEY = "pb-admin-theme";

/** Runs in <head> before paint so a saved light choice never flashes dark first. */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")==="light")document.documentElement.setAttribute("data-theme","light")}catch(e){}`;
