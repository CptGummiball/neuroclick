/// FILE: src/pages/NeuroClick.tsx
import { useState, useEffect } from "react";

interface Rule {
  id: number;
  conditionField: string;
  conditionOperator: string;
  conditionValue: number;
  action: string;
}

const conditionFields = ["clicks", "dataPoints"];
const conditionOperators = [">=", "<=", "==", "<", ">"];
const actions = ["train", "upgrade", "boost"];

export default function NeuroClick() {
  const [clicks, setClicks] = useState(0);
  const [dataPoints, setDataPoints] = useState(0);
  const [efficiency, setEfficiency] = useState(1);
  const [autoClickRate, setAutoClickRate] = useState(1000);
  const [autoClickActive, setAutoClickActive] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [upgradeLevel, setUpgradeLevel] = useState(0);
  const [history, setHistory] = useState<{ time: number; clicks: number }[]>([]);

  // Restore saved game
  useEffect(() => {
    const saved = localStorage.getItem("neuroclick_save");
    if (saved) {
      const game = JSON.parse(saved);
      setClicks(game.clicks);
      setDataPoints(game.dataPoints);
      setEfficiency(game.efficiency);
      setAutoClickRate(game.autoClickRate);
      setUpgradeLevel(game.upgradeLevel);
      setRules(game.rules || []);
    }
  }, []);

  // Auto save game
  useEffect(() => {
    const save = setInterval(() => {
      const game = {
        clicks,
        dataPoints,
        efficiency,
        autoClickRate,
        upgradeLevel,
        rules,
      };
      localStorage.setItem("neuroclick_save", JSON.stringify(game));
    }, 5000);
    return () => clearInterval(save);
  }, [clicks, dataPoints, efficiency, autoClickRate, rules, upgradeLevel]);

  // Auto clicker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoClickActive) {
      interval = setInterval(() => {
        setClicks((prev) => {
          const newVal = prev + Math.floor(1 * efficiency);
          setHistory((h) => [...h.slice(-49), { time: Date.now(), clicks: newVal }]);
          return newVal;
        });
        setDataPoints((prev) => prev + Math.floor(0.2 * efficiency));
        applyRules();
      }, autoClickRate);
    }
    return () => clearInterval(interval);
  }, [autoClickActive, efficiency, rules, autoClickRate]);

  const startTraining = () => {
    if (dataPoints >= 100) {
      setDataPoints((dp) => dp - 100);
      setEfficiency((eff) => parseFloat((eff + 0.1).toFixed(2)));
    }
  };

  const buyUpgrade = () => {
    const cost = 500 + upgradeLevel * 250;
    if (clicks >= cost) {
      setClicks((c) => c - cost);
      setEfficiency((eff) => parseFloat((eff + 0.2).toFixed(2)));
      setUpgradeLevel((lvl) => lvl + 1);
    }
  };

  const boostAutoclick = () => {
    if (dataPoints >= 200) {
      setDataPoints((d) => d - 200);
      setAutoClickRate((rate) => Math.max(200, rate - 100));
    }
  };

  const applyRules = () => {
    rules.forEach((rule) => {
      const value = rule.conditionField === "clicks" ? clicks : dataPoints;
      let conditionMet = false;
      switch (rule.conditionOperator) {
        case ">=": conditionMet = value >= rule.conditionValue; break;
        case "<=": conditionMet = value <= rule.conditionValue; break;
        case "==": conditionMet = value === rule.conditionValue; break;
        case ">":  conditionMet = value > rule.conditionValue; break;
        case "<":  conditionMet = value < rule.conditionValue; break;
      }
      if (conditionMet) {
        runAction(rule.action);
      }
    });
  };

  const runAction = (action: string) => {
    switch (action) {
      case "train":
        startTraining();
        break;
      case "upgrade":
        buyUpgrade();
        break;
      case "boost":
        boostAutoclick();
        break;
    }
  };

  const addRule = () => {
    const id = Date.now();
    const conditionField = prompt(`Feld (${conditionFields.join(", ")})`) || "clicks";
    const conditionOperator = prompt(`Operator (${conditionOperators.join(", ")})`) || ">=";
    const conditionValue = parseInt(prompt("Wert (Zahl)") || "0");
    const action = prompt(`Aktion (${actions.join(", ")})`) || "train";

    setRules([...rules, { id, conditionField, conditionOperator, conditionValue, action }]);
  };

  const exportSave = () => {
    const saveData = localStorage.getItem("neuroclick_save") || "";
    navigator.clipboard.writeText(saveData);
    alert("Spielstand in Zwischenablage kopiert!");
  };

  const importSave = () => {
    const code = prompt("Füge hier deinen Spielstand ein:");
    if (code) {
      localStorage.setItem("neuroclick_save", code);
      location.reload();
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto grid gap-4">
      <h1 className="text-2xl font-bold">NeuroClick</h1>

      <div className="p-4 border rounded-lg bg-gray-800 space-y-2">
        <div>🔘 Clicks: {clicks}</div>
        <div>📊 Data Points: {dataPoints}</div>
        <div>⚙️ Efficiency: x{efficiency}</div>
        <div>⚡ AutoClick Interval: {autoClickRate}ms</div>
        <div>🧩 Upgrades: {upgradeLevel}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button onClick={() => setAutoClickActive((a) => !a)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          {autoClickActive ? "⏸️ Stop KI" : "▶️ Start KI"}
        </button>

        <button onClick={startTraining} disabled={dataPoints < 100} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded">
          🧠 Train KI
        </button>

        <button onClick={buyUpgrade} disabled={clicks < 500 + upgradeLevel * 250} className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded">
          ⚙️ Upgrade
        </button>

        <button onClick={boostAutoclick} disabled={dataPoints < 200} className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-4 py-2 rounded">
          ⚡ Boost Click
        </button>

        <button onClick={addRule} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
          ➕ Regel hinzufügen
        </button>

        <button onClick={exportSave} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
          ⬆️ Export Save
        </button>

        <button onClick={importSave} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
          ⬇️ Import Save
        </button>
      </div>

      <div className="p-4 mt-4 border rounded-lg bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">🔧 Aktive Regeln</h2>
        {rules.length === 0 ? (
          <p className="text-gray-400">Keine Regeln definiert</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {rules.map((r) => (
              <li key={r.id}>
                <code>{r.conditionField} {r.conditionOperator} {r.conditionValue}</code> ⟶ <strong>{r.action}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 mt-4 border rounded-lg bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">📈 Verlauf (Clicks)</h2>
        <div className="text-xs text-gray-400">
          Letzte {history.length} Werte — max: {Math.max(...history.map(h => h.clicks), 0)}
        </div>
        <div className="h-24 bg-gray-700 mt-2 rounded overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="lime"
              strokeWidth="1"
              points={history.map((h, i) => `${(i / 50) * 100},${100 - (h.clicks / Math.max(...history.map(h => h.clicks), 1)) * 100}`).join(" ")}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}