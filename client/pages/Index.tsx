import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Lock, Shield, Flame, KeyRound, Trash2, ShieldCheck } from "lucide-react";
import {
  VAULT_KEY,
  encryptText,
  decryptToText,
  generatePassphrase,
  loadVault,
  saveVault,
  clearVault,
  type VaultPayload,
} from "@/lib/crypto";

export default function Index() {
  const [note, setNote] = useState("");
  const [burn, setBurn] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("burnAfterReading");
      return v ? JSON.parse(v) : true;
    } catch {
      return true;
    }
  });
  const [vault, setVault] = useState<VaultPayload | null>(() => loadVault());

  // Modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setPass("");
  }, [open]);

  useEffect(() => {
    localStorage.setItem("burnAfterReading", JSON.stringify(burn));
  }, [burn]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === VAULT_KEY) setVault(loadVault());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const hasVault = useMemo(() => Boolean(vault), [vault]);

  const openKeyModal = (nextMode: "encrypt" | "decrypt") => {
    setMode(nextMode);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleConfirm = async () => {
    if (!pass) return;
    setBusy(true);
    try {
      if (mode === "encrypt") {
        if (!note.trim()) {
          setBusy(false);
          return;
        }
        const payload = await encryptText(note, pass);
        saveVault(payload);
        setVault(payload);
        setNote("");
      } else {
        const payload = loadVault();
        if (!payload) {
          setBusy(false);
          setOpen(false);
          return;
        }
        const plain = await decryptToText(payload, pass);
        setNote(plain);
        if (burn) {
          clearVault();
          setVault(null);
        }
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Invalid key or corrupted data.");
    } finally {
      setBusy(false);
    }
  };

  const handleClear = () => {
    clearVault();
    setVault(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[hsl(220_16%_6%)] to-black text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-[hsl(var(--primary)_/_0.12)] flex items-center justify-center glow">
              {/* Inline DAWN geometric mark - replace with official logo when provided */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="hsl(var(--primary))" strokeWidth="1.2" fill="none" />
                <path d="M6 17L12 7L18 17" stroke="hsl(var(--primary))" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-widest neon-text">GhostVault</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Private by Design. Powered by DAWN.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Burn After Reading</span>
              <Switch checked={burn} onCheckedChange={setBurn} />
            </div>
            {hasVault ? (
              <span className="inline-flex items-center gap-2 text-xs text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Black Box armed
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Empty
              </span>
            )}
          </div>
        </header>

        <main>
          <div className="rounded-xl border bg-card/60 backdrop-blur glow">
            <div className="p-4 sm:p-6">
              <label htmlFor="note" className="sr-only">Secret note</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="// Type your secret and lock it away..."
                rows={10}
                className="w-full resize-y rounded-lg bg-black/60 text-[15px] leading-relaxed p-4 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-primary caret-primary selection:bg-primary/20 selection:text-primary glow"
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={() => openKeyModal("encrypt")} className="btn-neon glow" disabled={!note.trim()}>
                  <Lock className="h-4 w-4" /> Encrypt
                </Button>
                <Button variant="outline" onClick={() => openKeyModal("decrypt")} className="btn-outline-neon glow" disabled={!hasVault}>
                  <KeyRound className="h-4 w-4" /> Decrypt
                </Button>
                {hasVault && (
                  <Button variant="ghost" onClick={handleClear} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" /> Clear Vault
                  </Button>
                )}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Data is encrypted locally with AES-GCM and stored in localStorage under key "vaultData". No servers involved.
              </p>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black/80 backdrop-blur border-primary/40 glow">
          <DialogHeader>
            <DialogTitle className="neon-text">{mode === "encrypt" ? "Enter or Generate Key" : "Enter Decryption Key"}</DialogTitle>
            <DialogDescription>
              {mode === "encrypt"
                ? "Use a strong passphrase. Save it — without it, data cannot be recovered."
                : "Provide the exact passphrase used to encrypt the data."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <input
              ref={inputRef}
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-md bg-secondary/60 px-3 py-2 outline-none ring-1 ring-transparent focus:ring-2 focus:ring-primary caret-primary glow"
            />
            <div className="flex items-center gap-2">
              {mode === "encrypt" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPass(generatePassphrase())}
                  className="glow"
                >
                  <Flame className="h-4 w-4" /> Generate
                </Button>
              )}
              {pass && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(pass)}
                  className="border-primary/40 text-primary hover:bg-primary/10 glow"
                >
                  Copy Key
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleConfirm} disabled={busy || (!pass)} className="glow">
              {mode === "encrypt" ? "Encrypt & Save" : "Decrypt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
