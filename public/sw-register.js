if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then((reg) => {
        console.log("Aether ServiceWorker registered successfully with scope:", reg.scope);
      })
      .catch((err) => {
        console.error("Aether ServiceWorker registration failed:", err);
      });
  });
}
