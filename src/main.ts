import { createVueApp } from "./bootloader";

async function main() {
  const app = await createVueApp()
  app.mount('#app')
}

main()