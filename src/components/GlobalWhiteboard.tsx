"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pen, Eraser, Trash2 } from "lucide-react";

/**
 * GlobalWhiteboard — 全站数字草稿纸
 *
 * 一层覆盖整个视口的透明 canvas，供受试者在任意页面划线/演算。
 * 设计要点：
 *  - 画布 fixed inset-0 覆盖整个网页（z-30）。
 *  - 工具条渲染在顶栏（z-40，语言切换按钮之后），始终位于画布之上，
 *    因此即使在绘制模式（画布捕获全屏指针）下也能点击按钮退出绘制。
 *  - 显式画笔开关：默认关闭（画布 pointer-events:none，不挡页面点击），
 *    开启后画布捕获指针才进入绘制。
 *  - 工具：画笔 / 橡皮（擦整条线）/ 撤销 / 一键清空全部。
 *  - 草稿仅存内存，刷新即弃，不持久化、不进结果、不分享。
 */

interface Point {
  x: number; // normalized 0..1 (相对视口宽)
  y: number; // normalized 0..1 (相对视口高)
}

interface Stroke {
  points: Point[];
  color: string;
  size: number; // css px
}

type Tool = "none" | "pen" | "eraser";

const PEN_COLOR = "#2563eb"; // 蓝色草稿笔
const PEN_SIZE = 3; // css px
const ERASER_RADIUS = 14; // css px 命中半径（橡皮 = 删整条 stroke）

export function GlobalWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // 全局草稿，组件卸载/刷新即丢弃
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [tool, setTool] = useState<Tool>("none");
  const toolRef = useRef<Tool>("none");
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  /* ─── 绘制 ─── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (const stroke of strokesRef.current) {
      if (stroke.points.length === 0) continue;
      if (stroke.points.length === 1) {
        const p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, stroke.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
        continue;
      }
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.beginPath();
      stroke.points.forEach((p, i) => {
        const px = p.x * w;
        const py = p.y * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
  }, []);

  /* ─── 尺寸自适应（跟随视口 + dpr 高清） ─── */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }, [draw]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  /* ─── 指针交互 ─── */
  const getNorm = (e: React.PointerEvent): Point => {
    return {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  };

  const eraseAt = (p: Point) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const strokes = strokesRef.current;
    const r2 = ERASER_RADIUS * ERASER_RADIUS;
    let changed = false;
    for (let i = strokes.length - 1; i >= 0; i--) {
      const hit = strokes[i].points.some((pt) => {
        const dx = (pt.x - p.x) * w;
        const dy = (pt.y - p.y) * h;
        return dx * dx + dy * dy <= r2;
      });
      if (hit) {
        strokes.splice(i, 1);
        changed = true;
      }
    }
    if (changed) draw();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (toolRef.current === "none") return;
    e.preventDefault();
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    drawingRef.current = true;
    const p = getNorm(e);
    if (toolRef.current === "eraser") {
      eraseAt(p);
      return;
    }
    const stroke: Stroke = { points: [p], color: PEN_COLOR, size: PEN_SIZE };
    currentStrokeRef.current = stroke;
    strokesRef.current.push(stroke);
    draw();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    const p = getNorm(e);
    if (toolRef.current === "eraser") {
      eraseAt(p);
      return;
    }
    currentStrokeRef.current?.points.push(p);
    draw();
  };

  const endStroke = () => {
    drawingRef.current = false;
    currentStrokeRef.current = null;
  };

  /* ─── 工具条动作 ─── */
  const clearAll = () => {
    strokesRef.current = [];
    draw();
  };
  const toggle = (t: Exclude<Tool, "none">) => {
    if (toolRef.current === t) {
      // 再次点击同一工具 = 退出画布，清空已画内容
      strokesRef.current = [];
      draw();
      setTool("none");
      return;
    }
    setTool(t);
  };
  const exitCanvas = () => {
    const t = toolRef.current;
    if (t !== "none") toggle(t);
  };

  const active = tool !== "none";

  const btnBase =
    "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors";
  const btnIdle = "text-muted-foreground hover:text-foreground hover:bg-accent";
  const btnActive = "bg-primary text-primary-foreground shadow-xs";

  return (
    <>
      {/* 全屏草稿画布：默认不挡点击，仅画笔/橡皮模式下捕获指针。z-30 位于顶栏(z-40)之下，保证工具条始终可点。 */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={endStroke}
        className={`fixed inset-0 z-30 h-full w-full ${
          active ? "ring-2 ring-inset ring-blue-400/40" : ""
        }`}
        style={{
          pointerEvents: active ? "auto" : "none",
          touchAction: active ? "none" : "auto",
          cursor: active ? "crosshair" : "default",
        }}
      />

      {/* 工具条：内联在顶栏，样式与语言切换一致。relative z-50 确保在画布(z-30)之上可点击 */}
      <div className="relative z-50 flex items-center gap-0.5 rounded-lg border bg-background/80 p-0.5 backdrop-blur-sm">
        <button
          type="button"
          aria-label="Pen"
          title="画笔（划线）"
          aria-pressed={tool === "pen"}
          onClick={() => toggle("pen")}
          className={`${btnBase} ${tool === "pen" ? btnActive : btnIdle}`}
        >
          <Pen className="h-4 w-4" />
        </button>
        {tool === "pen" && (
          <span
            onClick={exitCanvas}
            className="cursor-pointer select-none whitespace-nowrap pl-0.5 pr-1.5 text-xs text-foreground"
          >
            再次点击退出画布
          </span>
        )}
        <button
          type="button"
          aria-label="Eraser"
          title="橡皮（擦除整条线）"
          aria-pressed={tool === "eraser"}
          onClick={() => toggle("eraser")}
          className={`${btnBase} ${tool === "eraser" ? btnActive : btnIdle}`}
        >
          <Eraser className="h-4 w-4" />
        </button>
        {tool === "eraser" && (
          <span
            onClick={exitCanvas}
            className="cursor-pointer select-none whitespace-nowrap pl-0.5 pr-1.5 text-xs text-foreground"
          >
            再次点击退出画布
          </span>
        )}
        <button
          type="button"
          aria-label="Clear all"
          title="清空全部草稿"
          onClick={clearAll}
          className={`${btnBase} ${btnIdle}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
