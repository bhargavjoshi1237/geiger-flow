"use client";

import * as React from "react";
import { X, Check, Minus, Plus, CreditCard, MessageCircle, Layers, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@geiger/ui";
import { RadioGroup, RadioGroupItem } from "@geiger/ui";
import { Label } from "@geiger/ui";
import { Input } from "@geiger/ui";

const STEPS = {
  SELECT_PLAN: "select_plan",
  PAYMENT_METHOD: "payment_method",
  PURCHASE_SEATS: "purchase_seats",
};

export default function UpgradePlanDialogue({ open, onOpenChange }) {
  const [step, setStep] = React.useState(STEPS.SELECT_PLAN);
  const [selectedPlan, setSelectedPlan] = React.useState("basic");
  const [seats, setSeats] = React.useState(1);

  const handleSelectPlan = () => {
    setStep(STEPS.PAYMENT_METHOD);
  };

  const handlePurchaseSeatsClick = () => {
    setStep(STEPS.PURCHASE_SEATS);
  };

  const handleBack = () => {
    setStep(STEPS.SELECT_PLAN);
  };

  const resetAndClose = (newOpen) => {
    if (!newOpen) {
      setTimeout(() => setStep(STEPS.SELECT_PLAN), 300);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="bg-background border-border text-foreground">
        <div className="relative w-full overflow-hidden">
          <div
            className={cn(
              "transition-transform duration-300 ease-in-out",
              step === STEPS.SELECT_PLAN ? "translate-x-0" : "-translate-x-full absolute inset-0"
            )}
          >
            <DialogHeader className="mb-6">
              <DialogTitle className="font-semibold flex items-center gap-2.5 text-foreground">
                <Layers className="w-5 h-5 text-text-secondary" />
                Select plan
              </DialogTitle>
              <DialogDescription className="text-text-secondary text-xs">
                Simple and flexible per-user pricing
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1">
              <RadioGroup
                value={selectedPlan}
                onValueChange={setSelectedPlan}
                className="grid grid-cols-2 gap-4"
              >
                <div
                  className={cn(
                    "relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all bg-surface-card",
                    selectedPlan === "basic" ? "border-foreground ring-1 ring-foreground" : "border-border hover:border-border-strong"
                  )}
                  onClick={() => setSelectedPlan("basic")}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-foreground">Basic plan</span>
                    <RadioGroupItem value="basic" className="sr-only" />
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedPlan === "basic" ? "bg-foreground border-foreground" : "border-border-strong"
                    )}>
                      {selectedPlan === "basic" && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </div>
                  <div className="mb-1">
                    <span className="text-2xl font-bold text-foreground">$10</span>
                    <span className="text-text-secondary font-medium text-sm">/user</span>
                  </div>
                  <div className="text-xs text-text-secondary mb-4 font-medium">Includes 20GB individual data.</div>
                  <ul className="space-y-2 mt-auto">
                    {[
                      "32+ integrations",
                      "Basic reporting",
                      "20GB individual data",
                      "Basic support",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <div className="h-4 w-4 rounded-full bg-surface-hover flex items-center justify-center">
                          <Check className="h-3 w-3 text-foreground" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={cn(
                    "relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all bg-surface-card",
                    selectedPlan === "business" ? "border-foreground ring-1 ring-foreground" : "border-border hover:border-border-strong"
                  )}
                  onClick={() => setSelectedPlan("business")}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-foreground">Business plan</span>
                    <RadioGroupItem value="business" className="sr-only" />
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedPlan === "business" ? "bg-foreground border-foreground" : "border-border-strong"
                    )}>
                      {selectedPlan === "business" && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </div>
                  <div className="mb-1">
                    <span className="text-2xl font-bold text-foreground">$20</span>
                    <span className="text-text-secondary font-medium text-sm">/user</span>
                  </div>
                  <div className="text-xs text-text-secondary mb-4 font-medium">Includes 40GB individual data.</div>
                  <ul className="space-y-2 mt-auto">
                    {[
                      "200+ integrations",
                      "Advanced reporting",
                      "40GB individual data",
                      "Priority support",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <div className="h-4 w-4 rounded-full bg-surface-hover flex items-center justify-center">
                          <Check className="h-3 w-3 text-foreground" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </RadioGroup>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <Button variant="outline" className="gap-2 text-text-secondary border-border hover:bg-surface-card hover:text-foreground hover:border-border-strong h-9 text-sm font-medium transition-all duration-200" onClick={handlePurchaseSeatsClick}>
                <UserPlus className="h-4 w-4" />
                Purchase seats
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-border text-text-secondary hover:text-foreground hover:bg-surface-card hover:border-border-strong h-9 text-sm font-medium transition-all duration-200 px-6" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-medium transition-all duration-200 px-6" onClick={handleSelectPlan}>Select plan</Button>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "transition-transform duration-300 ease-in-out",
              step === STEPS.PAYMENT_METHOD ? "translate-x-0" : "translate-x-full absolute inset-0"
            )}
          >
            <DialogHeader className="mb-6">
              <DialogTitle className="font-semibold flex items-center gap-2.5 text-foreground">
                <CreditCard className="w-5 h-5 text-text-secondary" />
                Add payment method
              </DialogTitle>
              <DialogDescription className="text-text-secondary pt-1 text-xs">
                Add a payment method to activate plan
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-hover via-surface-strong to-surface-hover p-8 flex flex-col justify-end shadow-sm border border-border">
                <div className="absolute top-4 right-4 text-foreground/20">
                  <div className="h-8 w-12 border-2 border-foreground/20 rounded-md" />
                </div>
                <div className="space-y-4">
                    <div className="text-foreground/60 font-medium tracking-widest text-lg">???? ???? ???? ????</div>
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase text-foreground/40 font-bold">Name on card</div>
                            <div className="text-sm font-semibold text-foreground">Cardholder</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase text-foreground/40 font-bold">Expiry</div>
                            <div className="text-sm font-semibold text-foreground">MM / YY</div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="card-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name on card</Label>
                  <Input id="card-name" className="bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary focus:border-border-strong focus:ring-1 focus:ring-ring h-9 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expiry</Label>
                  <Input id="expiry" placeholder="MM / YY" className="bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary focus:border-border-strong focus:ring-1 focus:ring-ring h-9 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CVV</Label>
                  <Input id="cvv" placeholder="•••" type="password" className="bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary focus:border-border-strong focus:ring-1 focus:ring-ring h-9 transition-all duration-200" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="card-number" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Card number</Label>
                  <div className="relative">
                    <Input id="card-number" className="bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary focus:border-border-strong focus:ring-1 focus:ring-ring h-9 pr-10 transition-all duration-200" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="flex -space-x-2">
                            <div className="h-4 w-4 rounded-full bg-[#eb5e52] opacity-80" />
                            <div className="h-4 w-4 rounded-full bg-[#f59e3d] opacity-80" />
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-border text-text-secondary hover:text-foreground hover:bg-surface-card hover:border-border-strong h-9 text-sm font-medium transition-all duration-200 px-6" onClick={handleBack}>Cancel</Button>
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-medium transition-all duration-200 px-6">Update details</Button>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "transition-transform duration-300 ease-in-out",
              step === STEPS.PURCHASE_SEATS ? "translate-x-0" : "translate-x-full absolute inset-0"
            )}
          >
            <DialogHeader className="mb-6">
              <DialogTitle className="font-semibold flex items-center gap-2.5 text-foreground">
                <UserPlus className="w-5 h-5 text-text-secondary" />
                Purchase seats
              </DialogTitle>
              <DialogDescription className="text-text-secondary pt-1 text-xs">
                Select how many seats you need
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col justify-center items-center py-8">
                <div className="flex items-center gap-8 mb-12">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full border-border text-text-secondary hover:bg-surface-card hover:text-foreground hover:border-border-strong h-9 text-sm font-medium transition-all duration-200"
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                    >
                        <Minus className="h-6 w-6" />
                    </Button>
                    <span className="text-7xl font-bold tracking-tight text-foreground">{seats}</span>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full border-border text-text-secondary hover:bg-surface-card hover:text-foreground hover:border-border-strong h-9 text-sm font-medium transition-all duration-200"
                        onClick={() => setSeats(seats + 1)}
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
                
                <div className="w-full space-y-4 border-t border-border pt-8">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-semibold">Price per seat</span>
                        <span className="text-text-secondary font-medium">$10</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-foreground font-bold text-lg">Total</span>
                        <span className="text-foreground font-bold text-lg">${seats * 10}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-border text-text-secondary hover:text-foreground hover:bg-surface-card hover:border-border-strong h-9 text-sm font-medium transition-all duration-200 px-6" onClick={handleBack}>Cancel</Button>
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-medium transition-all duration-200 px-6">Purchase seats</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
