"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioManager, MusicPlayer as MusicPlayerEngine } from "@/lib/moqnaas/audio";
import { MoqnaasEngine, HudSnapshot, EngineMode } from "@/lib/moqnaas/engine";
import { getCar, getRegion } from "@/lib/moqnaas/data";
import { CarId, GameScreen, HuntSession, RegionId, Settings as SettingsType } from "@/lib/moqnaas/types";
import {
  DEFAULT_SETTINGS,
  appendHuntSession,
  loadBestScore,
  loadHuntLog,
  loadLastCar,
  loadLastRegion,
  loadSettings,
  saveBestScoreIfHigher,
  saveLastCar,
  saveLastRegion,
  saveSettings
} from "@/lib/moqnaas/storage";

import MainMenu from "./screens/MainMenu";
import CarSelect from "./screens/CarSelect";
import RegionSelect from "./screens/RegionSelect";
import LoadingScreen from "./screens/LoadingScreen";
import HUD from "./screens/HUD";
import PauseMenu from "./screens/PauseMenu";
import Results from "./screens/Results";
import SettingsScreen from "./screens/Settings";
import HuntLogScreen from "./screens/HuntLog";
import MusicPlayerPanel from "./screens/MusicPlayer";

interface RoundResult {
  score: number;
  bag: number;
  shots: number;
  hits: number;
  durationSec: number;
  isNewBest: boolean;
}

export default function MoqnaasGame() {
  const [screen, setScreen] = useState<GameScreen>("menu");
  const [carId, setCarId] = useState<CarId>("landcruiser");
  const [regionId, setRegionId] = useState<RegionId>("open-desert");
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [bestScore, setBestScore] = useState(0);
  const [huntLog, setHuntLog] = useState<HuntSession[]>([]);
  const [paused, setPaused] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [hudSnap, setHudSnap] = useState<HudSnapshot | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MoqnaasEngine | null>(null);
  const audioRef = useRef<AudioManager | null>(null);
  const musicRef = useRef<MusicPlayerEngine | null>(null);
  const pausedRef = useRef(false);
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });

  useEffect(() => {
    audioRef.current = new AudioManager();
    musicRef.current = new MusicPlayerEngine();
    musicRef.current.init();
    setSettings(loadSettings());
    setBestScore(loadBestScore());
    setHuntLog(loadHuntLog());
    const lastCar = loadLastCar();
    const lastRegion = loadLastRegion();
    if (lastCar) setCarId(lastCar as CarId);
    if (lastRegion) setRegionId(lastRegion as RegionId);
    return () => {
      engineRef.current?.destroy();
      audioRef.current?.dispose();
      musicRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    audioRef.current?.setMasterVolume(settings.masterVolume);
    audioRef.current?.setSfxVolume(settings.sfxVolume);
    musicRef.current?.setVolume(settings.musicVolume * settings.masterVolume);
    saveSettings(settings);
  }, [settings]);

  const applyHud = useCallback((snap: HudSnapshot) => {
    if (!pausedRef.current) setHudSnap(snap);
  }, []);

  const handleHit = useCallback(
    (points: number, flying: boolean) => {
      setToast({ text: `+${points}${flying ? " 🎯 دقة!" : ""}`, key: Date.now() });
      if (settings.vibration && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
    },
    [settings.vibration]
  );

  const handleMiss = useCallback((points: number) => {
    setToast({ text: `${points} طارت الفرصة`, key: Date.now() });
  }, []);

  const handleModeChange = useCallback((_mode: EngineMode) => {
    // reserved for future camera/UI transitions
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1000);
    return () => clearTimeout(t);
  }, [toast]);

  // تهيئة المحرك عند دخول شاشة اللعب
  useEffect(() => {
    if (screen !== "play") return;
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const car = getCar(carId);
    const region = getRegion(regionId);
    const engine = new MoqnaasEngine(canvas, car, region, audioRef.current, {
      onHud: applyHud,
      onHit: handleHit,
      onMiss: handleMiss,
      onModeChange: handleModeChange
    });
    engineRef.current = engine;
    engine.resetStats();
    engine.start();
    setElapsedSec(0);
    setPaused(false);

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    const timer = setInterval(() => {
      if (!pausedRef.current) setElapsedSec((s) => s + 1);
    }, 1000);

    return () => {
      window.removeEventListener("resize", onResize);
      clearInterval(timer);
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // تحكم لوحة المفاتيح
  useEffect(() => {
    if (screen !== "play") return;
    const updateSteer = () => {
      const k = keysRef.current;
      const steer = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      engineRef.current?.setInput({ steer });
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (pausedRef.current) return;
      const engine = engineRef.current;
      if (!engine) return;
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          keysRef.current.left = true;
          updateSteer();
          break;
        case "ArrowRight":
        case "KeyD":
          keysRef.current.right = true;
          updateSteer();
          break;
        case "ArrowUp":
        case "KeyW":
          keysRef.current.up = true;
          engine.setInput({ throttle: true });
          break;
        case "ArrowDown":
        case "KeyS":
          keysRef.current.down = true;
          engine.setInput({ brake: true });
          break;
        case "KeyE":
          if (engine.currentMode === "driving") engine.requestDismount();
          else engine.requestMount();
          break;
        case "Space":
          e.preventDefault();
          if (engine.currentMode === "aiming") engine.requestShoot();
          break;
        case "KeyR":
          if (engine.currentMode === "aiming") engine.requestReload();
          break;
        case "Escape":
          setPaused((p) => !p);
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          keysRef.current.left = false;
          updateSteer();
          break;
        case "ArrowRight":
        case "KeyD":
          keysRef.current.right = false;
          updateSteer();
          break;
        case "ArrowUp":
        case "KeyW":
          keysRef.current.up = false;
          engine?.setInput({ throttle: false });
          break;
        case "ArrowDown":
        case "KeyS":
          keysRef.current.down = false;
          engine?.setInput({ brake: false });
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [screen]);

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d || pausedRef.current) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    if (engineRef.current?.currentMode === "aiming") {
      engineRef.current.setLookDelta(dx * 0.0032 * settings.cameraSensitivity);
    }
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onCanvasPointerUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d || pausedRef.current) return;
    if (!d.moved && engineRef.current?.currentMode === "aiming") {
      engineRef.current.requestShoot();
    }
  };

  const finishRound = () => {
    const engine = engineRef.current;
    if (!engine) return;
    const stats = engine.getStats();
    const newBest = saveBestScoreIfHigher(stats.score);
    const session: HuntSession = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      carId,
      regionId,
      birdsHunted: stats.bag,
      shotsTaken: stats.shots,
      hits: stats.hits,
      score: stats.score,
      durationSec: elapsedSec
    };
    const log = appendHuntSession(session);
    setHuntLog(log);
    setBestScore(newBest);
    setRoundResult({
      score: stats.score,
      bag: stats.bag,
      shots: stats.shots,
      hits: stats.hits,
      durationSec: elapsedSec,
      isNewBest: newBest === stats.score && stats.score > 0
    });
    setPaused(false);
    setScreen("results");
  };

  const car = getCar(carId);
  const region = getRegion(regionId);

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#0c0a07] font-arabic" dir="rtl">
      {screen === "menu" && (
        <MainMenu
          bestScore={bestScore}
          onStart={() => setScreen("carSelect")}
          onSettings={() => setScreen("settings")}
          onHuntLog={() => setScreen("huntLog")}
        />
      )}

      {screen === "carSelect" && (
        <CarSelect
          initial={carId}
          onBack={() => setScreen("menu")}
          onConfirm={(id) => {
            setCarId(id);
            saveLastCar(id);
            setScreen("regionSelect");
          }}
        />
      )}

      {screen === "regionSelect" && (
        <RegionSelect
          initial={regionId}
          onBack={() => setScreen("carSelect")}
          onConfirm={(id) => {
            setRegionId(id);
            saveLastRegion(id);
            setScreen("loading");
          }}
        />
      )}

      {screen === "loading" && (
        <LoadingScreen car={car} region={region} onDone={() => setScreen("play")} />
      )}

      {screen === "settings" && (
        <SettingsScreen settings={settings} onChange={setSettings} onBack={() => setScreen("menu")} />
      )}

      {screen === "huntLog" && (
        <HuntLogScreen log={huntLog} bestScore={bestScore} onBack={() => setScreen("menu")} />
      )}

      {screen === "results" && roundResult && (
        <Results
          car={car}
          region={region}
          score={roundResult.score}
          bag={roundResult.bag}
          shots={roundResult.shots}
          hits={roundResult.hits}
          durationSec={roundResult.durationSec}
          bestScore={bestScore}
          isNewBest={roundResult.isNewBest}
          onPlayAgain={() => setScreen("carSelect")}
          onMenu={() => setScreen("menu")}
        />
      )}

      {screen === "play" && (
        <div className="relative h-full w-full">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerLeave={onCanvasPointerUp}
          />
          <HUD
            snap={hudSnap}
            regionName={region.name}
            elapsedSec={elapsedSec}
            onPause={() => setPaused(true)}
            onDismount={() => engineRef.current?.requestDismount()}
            onMount={() => engineRef.current?.requestMount()}
            onShoot={() => engineRef.current?.requestShoot()}
            onReload={() => engineRef.current?.requestReload()}
            onSteer={(dir) => engineRef.current?.setInput({ steer: dir })}
            onThrottle={(on) => engineRef.current?.setInput({ throttle: on })}
            onBrake={(on) => engineRef.current?.setInput({ brake: on })}
          />

          {toast && (
            <div
              key={toast.key}
              className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 animate-[float-up_1s_ease-out_forwards] text-lg font-black text-[#f3ead9] drop-shadow-lg"
            >
              {toast.text}
            </div>
          )}

          {paused && (
            <PauseMenu
              onResume={() => setPaused(false)}
              onMusic={() => setShowMusic(true)}
              onEndHunt={finishRound}
            />
          )}

          {showMusic && musicRef.current && (
            <MusicPlayerPanel
              player={musicRef.current}
              playlistName={settings.playlistName}
              onClose={() => setShowMusic(false)}
            />
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes float-up {
          0% {
            opacity: 0;
            transform: translate(-50%, 10px) scale(0.9);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.05);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -30px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
