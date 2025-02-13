// コンポーネント: 位置と速度
interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

// エンティティは単なる識別子（配列のインデックス）として扱う
type Entity = number;

// ECSストレージ：全エンティティのPositionとVelocityを配列で管理
const positions: Position[] = [];
const velocities: Velocity[] = [];

// FPS計測用の変数
let lastTime = performance.now();
let fpsCounter = 0;
let fpsDisplay = 0;
let lastFpsUpdate = lastTime;

// システム: すべてのエンティティの位置を更新し、キャンバス境界で反射する
function update(deltaTime: number, canvas: HTMLCanvasElement): void {
  for (let i = 0; i < positions.length; i++) {
    // 位置更新
    positions[i].x += velocities[i].vx * deltaTime;
    positions[i].y += velocities[i].vy * deltaTime;

    // x方向の境界チェック（0〜canvas.width）
    if (positions[i].x < 0) {
      positions[i].x = 0;
      velocities[i].vx = -velocities[i].vx;
    } else if (positions[i].x > canvas.width) {
      positions[i].x = canvas.width;
      velocities[i].vx = -velocities[i].vx;
    }

    // y方向の境界チェック（0〜canvas.height）
    if (positions[i].y < 0) {
      positions[i].y = 0;
      velocities[i].vy = -velocities[i].vy;
    } else if (positions[i].y > canvas.height) {
      positions[i].y = canvas.height;
      velocities[i].vy = -velocities[i].vy;
    }
  }
}

// システム: キャンバスに全エンティティを描画する
function render(ctx: CanvasRenderingContext2D): void {
  // 背景を黒で塗りつぶす
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // エンティティ（ボール）の描画
  ctx.fillStyle = "yellow";
  for (const pos of positions) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }

  // FPS表示（左上に白文字で）
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`fps : ${fpsDisplay}`, 10, 30);
}

// メイン処理とメインループ
const main = (viewport: HTMLCanvasElement): void => {
  const ctx = viewport.getContext("2d");
  if (!ctx) return;
  console.log("Hello, ecs!");

  // サンプルエンティティの作成
  // Entity 0: 通常の速度 vx=50, vy=-50
  positions.push({ x: 50, y: 50 });
  velocities.push({ vx: 50, vy: -50 });

  // Entity 1: 速度が2倍 vx=100, vy=-100
  positions.push({ x: 150, y: 100 });
  velocities.push({ vx: 100, vy: -100 });

  // Entity 2: 速度が3倍 vx=150, vy=-150
  positions.push({ x: 250, y: 150 });
  velocities.push({ vx: 150, vy: -150 });

  // メインループ
  const loop = (time: number): void => {
    const deltaTime = (time - lastTime) / 1000; // 秒単位に変換
    lastTime = time;

    // FPS計測
    fpsCounter++;
    if (time - lastFpsUpdate >= 1000) {
      fpsDisplay = fpsCounter;
      fpsCounter = 0;
      lastFpsUpdate = time;
    }

    update(deltaTime, viewport);
    render(ctx);

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
};

main(document.getElementById("viewport") as HTMLCanvasElement);
