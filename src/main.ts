import { mount } from "svelte";
import Gallery from "../.suede/sweater-vest-suede/vite/Gallery.svelte";

const app = mount(Gallery, {
  target: document.getElementById("app")!,
  props: {
    glob: import.meta.glob("/src/**/*.test.svelte"),
  },
});

export default app;
