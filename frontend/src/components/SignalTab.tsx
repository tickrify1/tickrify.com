import React, { useEffect, useState } from "react";

type Signal = { signal: "BUY"|"SELL"|"WAIT"; confidence: number; reason: string; timestamp: string; };

export default function SignalTab(){
  const [loading, setLoading] = useState(true);
  const [sig, setSig] = useState<Signal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{
    let mounted = true;
    fetch('/api/signal').then(r=>r.json()).then((d)=>{
      if(!mounted) return;
      setSig(d);
    }).catch(e=>{
      setError(String(e));
    }).finally(()=>mounted && setLoading(false));
    return ()=>{ mounted = false; }
  },[]);

  function badgeClass(s:string){
    if(s==="BUY") return "bg-green-600 text-white";
    if(s==="SELL") return "bg-red-600 text-white";
    return "bg-gray-600 text-white";
  }

  if(loading) return <div className="p-4">Loading signal...</div>;
  if(error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if(!sig) return <div className="p-4">No signal</div>;

  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        <div className={`px-4 py-2 rounded-2xl font-bold ${badgeClass(sig.signal)}`}>{sig.signal}</div>
        <div>Confidence: {(sig.confidence*100).toFixed(1)}%</div>
        <div className="text-sm text-gray-400">as of {new Date(sig.timestamp).toLocaleString()}</div>
      </div>
      <div className="mt-2 text-sm">{sig.reason}</div>
    </div>
  );
}


