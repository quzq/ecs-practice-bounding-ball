const main = (viewport: HTMLCanvasElement): void => {
  const ctx = viewport.getContext("2d");
  if (!ctx) return;
  console.log("Hello, ecs!");
};
main(<HTMLCanvasElement>document.getElementById("viewport"));
