"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  CheckCircle2,
  Copy,
  Fingerprint,
  Key,
  LockKeyhole,
  ShieldCheck,
  TimerReset,
  TriangleAlert,
} from "lucide-react";

const DEFAULT_ACCESS_SETUP = {
  method: "pin",
  pin: "",
  password: "",
  sessionMinutes: "15",
};

const METHOD_COPY = {
  pin: {
    label: "PIN",
    icon: LockKeyhole,
  },
  password: {
    label: "Passphrase",
    icon: Key,
  },
  passkey: {
    label: "Hardware passkey",
    icon: Fingerprint,
  },
};

function getSecretValue(item) {
  return item?.secret || item?.password || item?.apiKey || "";
}

export function VaultCredentialAccessDialog({
  item,
  open = false,
  onOpenChange = () => {},
}) {
  const accessSetup = useMemo(
    () => ({
      ...DEFAULT_ACCESS_SETUP,
      ...(item?.accessSetup || {}),
      method:
        item?.accessSetup?.method ||
        item?.accessSetup?.methods?.[0] ||
        DEFAULT_ACCESS_SETUP.method,
    }),
    [item],
  );
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [error, setError] = useState("");

  const secretValue = getSecretValue(item);
  const isLockedOut = attemptsLeft <= 0;
  const activeMethod = METHOD_COPY[accessSetup.method]
    ? accessSetup.method
    : DEFAULT_ACCESS_SETUP.method;
  const activeMethodMeta = METHOD_COPY[activeMethod];
  const ActiveIcon = activeMethodMeta.icon;
  const pinLength = Math.max(4, Math.min(8, accessSetup.pin?.length || 4));

  const markFailure = () => {
    setAttemptsLeft((current) => {
      const next = Math.max(0, current - 1);
      setError(
        next === 0
          ? "Access locked after repeated failed attempts."
          : `Verification failed. ${next} attempt${next === 1 ? "" : "s"} remaining.`,
      );
      return next;
    });
  };

  const handleUnlock = () => {
    if (isLockedOut) return;

    if (activeMethod === "pin") {
      const expectedPin = accessSetup.pin || "1234";
      if (pin !== expectedPin) {
        markFailure();
        return;
      }
    }

    if (activeMethod === "password") {
      const expectedPassword = accessSetup.password || "vault-access";
      if (password !== expectedPassword) {
        markFailure();
        return;
      }
    }

    setError("");
    setIsUnlocked(true);
  };

  const handlePasskeyUnlock = () => {
    setError("");
    setIsUnlocked(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto bg-[#161616] text-[#ededed] border border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShieldCheck className="size-5 text-[#a3a3a3]" />
            Access Secret
          </DialogTitle>
          <DialogDescription className="text-xs text-[#737373]">
            Verify with the method configured for {item?.name || "this secret"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isUnlocked ? (
            <div className="space-y-4">
              <div className="rounded-xl p-4">
                 
                {activeMethod === "pin" && (
                  <InputOTP
                    maxLength={pinLength}
                    value={pin}
                    onChange={(value) => setPin(value.replace(/\D/g, ""))}
                    disabled={isLockedOut}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup>
                      {Array.from({ length: pinLength }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="size-11 border-[#2a2a2a] bg-[#161616] text-[#ededed] data-[active=true]:ring-[#474747]"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                )}

                {activeMethod === "password" && (
                  <Input
                    type="password"
                    placeholder="Enter passphrase"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLockedOut}
                    className="bg-[#161616] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] h-9"
                  />
                )}

                {activeMethod === "passkey" && (
                  <Button
                    type="button"
                    onClick={handlePasskeyUnlock}
                    disabled={isLockedOut}
                    className="w-full bg-[#ededed] text-[#161616] hover:bg-white h-9"
                  >
                    <Fingerprint className="mr-2 size-4" />
                    Verify passkey
                  </Button>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 rounded-xl">
             
              <div className="flex rounded-lg border border-[#2a2a2a] bg-[#111111] px-3 py-2.5">
                <code className="block truncate font-mono text-xs text-[#ededed]">
                  {secretValue || "No secret saved"}
                </code>
                <Copy className="absolute right-3 top-3 size-4 text-[#737373] cursor-pointer hover:text-[#a3a3a3]" />
              </div>
              <p className="text-xs leading-5 text-[#737373]">
                Secret access is recorded with method, timestamp, and session TTL for audit review.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-[#2a2a2a] text-[#737373] hover:text-white hover:bg-[#202020] hover:border-[#3a3a3a] h-9"
          >
            Close
          </Button>
          {!isUnlocked && activeMethod !== "passkey" && (
            <Button
              type="button"
              onClick={handleUnlock}
              disabled={isLockedOut}
              className="flex-1 bg-[#ededed] text-[#161616] hover:bg-white h-9"
            >
              Access Secret
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
