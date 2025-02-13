// コンポーネント: 位置と速度
interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

// エンティティは単なる識別子（ここでは配列のインデックス）
type Entity = number;

// ECSストレージ：全エンティティのPositionとVelocityを配列で管理
const positions: Position[] = [];
const velocities: Velocity[] = [];

// FPS計測用変数
let lastTime = performance.now();
let lastFpsUpdate = lastTime;
let fpsCounter = 0;
let fpsDisplay = 0;

// 追加用タイマー（5秒ごとにボール追加）
let lastBallAddTime = lastTime;

// ボールの半径（描画・衝突判定用）
const BALL_RADIUS = 5;

// 新しいボールを追加するシステム
function addBall(canvas: HTMLCanvasElement): void {
  const speedOptions = [50, 100, 150];
  // ランダムに1つ選ぶ
  const speed = speedOptions[Math.floor(Math.random() * speedOptions.length)];
  // キャンバス内（端からBALL_RADIUS分余裕を持たせる）にランダムに配置
  const x = Math.random() * (canvas.width - 2 * BALL_RADIUS) + BALL_RADIUS;
  const y = Math.random() * (canvas.height - 2 * BALL_RADIUS) + BALL_RADIUS;
  positions.push({ x, y });
  // 方向は右上（vx: speed, vy: -speed）
  velocities.push({ vx: speed, vy: -speed });
}

// システム: 全エンティティの位置更新と反射処理
function update(deltaTime: number, canvas: HTMLCanvasElement): void {
  for (let i = 0; i < positions.length; i++) {
    // 位置更新
    positions[i].x += velocities[i].vx * deltaTime;
    positions[i].y += velocities[i].vy * deltaTime;

    // x方向（0～canvas.width）の境界チェック
    if (positions[i].x < BALL_RADIUS) {
      positions[i].x = BALL_RADIUS;
      velocities[i].vx = -velocities[i].vx;
    } else if (positions[i].x > canvas.width - BALL_RADIUS) {
      positions[i].x = canvas.width - BALL_RADIUS;
      velocities[i].vx = -velocities[i].vx;
    }

    // y方向（0～canvas.height）の境界チェック
    if (positions[i].y < BALL_RADIUS) {
      positions[i].y = BALL_RADIUS;
      velocities[i].vy = -velocities[i].vy;
    } else if (positions[i].y > canvas.height - BALL_RADIUS) {
      positions[i].y = canvas.height - BALL_RADIUS;
      velocities[i].vy = -velocities[i].vy;
    }
  }
}

// 衝突判定システム: すべてのボール同士の距離が2*BALL_RADIUS未満なら削除
function handleCollisions(): void {
  const toRemove: Set<number> = new Set();

  // 2重ループで全ペアをチェック
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].x - positions[j].x;
      const dy = positions[i].y - positions[j].y;
      const distSq = dx * dx + dy * dy;
      if (distSq < (2 * BALL_RADIUS) ** 2) {
        // 衝突したら両方マーク
        toRemove.add(i);
        toRemove.add(j);
      }
    }
  }

  if (toRemove.size > 0) {
    // 削除するインデックスを降順にソートして配列に
    const removeIndices = Array.from(toRemove).sort((a, b) => b - a);
    for (const index of removeIndices) {
      positions.splice(index, 1);
      velocities.splice(index, 1);
    }
  }
}

// システム: キャンバスに描画（背景黒、ボールはyellow、左上にFPS表示）
function render(ctx: CanvasRenderingContext2D): void {
  // 背景を黒で塗りつぶす
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // ボールの描画（yellow）
  ctx.fillStyle = "yellow";
  for (const pos of positions) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, BALL_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
  }

  // FPS表示（左上に白文字）
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`fps : ${fpsDisplay}`, 10, 30);
}

// メイン処理とメインループ
const main = (viewport: HTMLCanvasElement): void => {
  const ctx = viewport.getContext("2d");
  if (!ctx) return;
  console.log("Hello, ecs!");

  // 最初は1個のボールを追加
  addBall(viewport);

  // メインループ
  const loop = (time: number): void => {
    const deltaTime = (time - lastTime) / 1000; // 秒単位
    lastTime = time;

    // FPS計測：1秒ごとに更新
    fpsCounter++;
    if (time - lastFpsUpdate >= 1000) {
      fpsDisplay = fpsCounter;
      fpsCounter = 0;
      lastFpsUpdate = time;
    }

    // 更新処理
    update(deltaTime, viewport);
    // 衝突判定＆衝突したボールの削除
    handleCollisions();

    // 5秒ごとに新しいボールを追加
    if (time - lastBallAddTime >= 5000) {
      addBall(viewport);
      lastBallAddTime = time;
    }

    // 描画
    render(ctx);

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
};

// HTML上のcanvas要素を取得してメイン処理を実行
main(document.getElementById("viewport") as HTMLCanvasElement);
