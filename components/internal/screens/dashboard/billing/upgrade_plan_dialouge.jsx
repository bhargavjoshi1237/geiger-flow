"use client";

import * as React from "react";
import { X, Check, Minus, Plus, CreditCard, MessageCircle, Layers, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
      <DialogContent className="bg-[#161616] border-[#2a2a2a] text-[#ededed]">
        <div className="relative w-full overflow-hidden">
          <div
            className={cn(
              "transition-transform duration-300 ease-in-out",
              step === STEPS.SELECT_PLAN ? "translate-x-0" : "-translate-x-full absolute inset-0"
            )}
          >
            <DialogHeader className="mb-6">
              <DialogTitle className="font-semibold flex items-center gap-2.5 text-white">
                <Layers className="w-5 h-5 text-[#737373]" />
                Select plan
              </DialogTitle>
              <DialogDescription className="text-[#737373] text-xs">
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
                    "relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all bg-[#202020]",
                    selectedPlan === "basic" ? "border-white ring-1 ring-white" : "border-[#2a2a2a] hover:border-[#474747]"
                  )}
                  onClick={() => setSelectedPlan("basic")}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white">Basic plan</span>
                    <RadioGroupItem value="basic" className="sr-only" />
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedPlan === "basic" ? "bg-white border-white" : "border-[#474747]"
                    )}>
                      {selectedPlan === "basic" && <Check className="h-3 w-3 text-black" />}
                    </div>
                  </div>
                  <div className="mb-1">
                    <span className="text-2xl font-bold text-white">$10</span>
                    <span className="text-[#737373] font-medium text-sm">/user</span>
                  </div>
                  <div className="text-xs text-[#737373] mb-4 font-medium">Includes 20GB individual data.</div>
                  <ul className="space-y-2 mt-auto">
                    {[
                      "32+ integrations",
                      "Basic reporting",
                      "20GB individual data",
                      "Basic support",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-medium text-[#a3a3a3]">
                        <div className="h-4 w-4 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={cn(
                    "relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all bg-[#202020]",
                    selectedPlan === "business" ? "border-white ring-1 ring-white" : "border-[#2a2a2a] hover:border-[#474747]"
                  )}
                  onClick={() => setSelectedPlan("business")}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-white">Business plan</span>
                    <RadioGroupItem value="business" className="sr-only" />
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedPlan === "business" ? "bg-white border-white" : "border-[#474747]"
                    )}>
                      {selectedPlan === "business" && <Check className="h-3 w-3 text-black" />}
                    </div>
                  </div>
                  <div className="mb-1">
                    <span className="text-2xl font-bold text-white">$20</span>
                    <span className="text-[#737373] font-medium text-sm">/user</span>
                  </div>
                  <div className="text-xs text-[#737373] mb-4 font-medium">Includes 40GB individual data.</div>
                  <ul className="space-y-2 mt-auto">
                    {[
                      "200+ integrations",
                      "Advanced reporting",
                      "40GB individual data",
                      "Priority support",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-medium text-[#a3a3a3]">
                        <div className="h-4 w-4 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </RadioGroup>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2a2a2a] flex items-center justify-between">
              <Button variant="outline" className="gap-2 text-[#737373] border-[#2a2a2a] hover:bg-[#202020] hover:text-white hover:border-[#3a3a3a] h-9 text-sm font-medium transition-all duration-200" onClick={handlePurchaseSeatsClick}>
                <UserPlus className="h-4 w-4" />
                Purchase seats
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-[#2a2a2a] text-[#737373] hover:text-white hover:bg-[#202020] hover:border-[#3a3a3a] h-9 text-sm font-medium transition-all duration-200 px-6" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button className="flex-1 bg-[#ededed] text-[#161616] hover:bg-white h-9 text-sm font-medium transition-all duration-200 px-6" onClick={handleSelectPlan}>Select plan</Button>
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
              <DialogTitle className="font-semibold flex items-center gap-2.5 text-white">
                <CreditCard className="w-5 h-5 text-[#737373]" />
                Add payment method
              </DialogTitle>
              <DialogDescription className="text-[#737373] pt-1 text-xs">
                Add a payment method to activate plan
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a2a2a] via-[#333333] to-[#2a2a2a] p-8 flex flex-col justify-end shadow-sm border border-[#333333]">
                <div className="absolute top-4 right-4 text-white/20">
                  <div className="h-8 w-12 border-2 border-white/20 rounded-md" />
                </div>
                <div className="space-y-4">
                    <div className="text-white/60 font-medium tracking-widest text-lg">???? ???? ???? ????</div>
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase text-white/40 font-bold">Name on card</div>
                            <div className="text-sm font-semibold text-white">Cardholder</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] uppercase text-white/40 font-bold">Expiry</div>
                            <div className="text-sm font-semibold text-white">MM / YY</div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="card-name" className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">Name on card</Label>
                  <Input id="card-name" className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] focus:ring-1 focus:ring-[#3a3a3a] h-9 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">Expiry</Label>
                  <Input id="expiry" placeholder="MM / YY" className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] focus:ring-1 focus:ring-[#3a3a3a] h-9 transition-all duration-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">CVV</Label>
                  <Input id="cvv" placeholder="•••" type="password" className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] focus:ring-1 focus:ring-[#3a3a3a] h-9 transition-all duration-200" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="card-number" className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">Card number</Label>
                  <div className="relative">
                    <Input id="card-number" className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] placeholder:text-[#525252] focus:border-[#3a3a3a] focus:ring-1 focus:ring-[#3a3a3a] h-9 pr-10 transition-all duration-200" />
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

            <div className="mt-8 pt-6 border-t border-[#2a2a2a] flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-[#2a2a2a] text-[#737373] hover:text-white hover:bg-[#202020] hover:border-[#3a3a3a] h-9 text-sm font-medium transition-all duration-200 px-6" onClick={handleBack}>Cancel</Button>
                <Button className="flex-1 bg-[#ededed] text-[#161616] hover:bg-white h-9 text-sm font-medium transition-all duration-200 px-6">Update details</Button>
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
              <DialogTitle className="font-semibold flex items-center gap-2.5 text-white">
                <UserPlus className="w-5 h-5 text-[#737373]" />
                Purchase seats
              </DialogTitle>
              <DialogDescription className="text-[#737373] pt-1 text-xs">
                Select how many seats you need
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col justify-center items-center py-8">
                <div className="flex items-center gap-8 mb-12">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full border-[#2a2a2a] text-[#737373] hover:bg-[#202020] hover:text-white hover:border-[#3a3a3a] h-9 text-sm font-medium transition-all duration-200"
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                    >
                        <Minus className="h-6 w-6" />
                    </Button>
                    <span className="text-7xl font-bold tracking-tight text-white">{seats}</span>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full border-[#2a2a2a] text-[#737373] hover:bg-[#202020] hover:text-white hover:border-[#3a3a3a] h-9 text-sm font-medium transition-all duration-200"
                        onClick={() => setSeats(seats + 1)}
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
                
                <div className="w-full space-y-4 border-t border-[#2a2a2a] pt-8">
                    <div className="flex justify-between items-center">
                        <span className="text-[#a3a3a3] font-semibold">Price per seat</span>
                        <span className="text-[#737373] font-medium">$10</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-lg">Total</span>
                        <span className="text-white font-bold text-lg">${seats * 10}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#2a2a2a] flex items-center justify-between">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-[#2a2a2a] text-[#737373] hover:text-white hover:bg-[#202020] hover:border-[#3a3a3a] h-9 text-sm font-medium transition-all duration-200 px-6" onClick={handleBack}>Cancel</Button>
                <Button className="flex-1 bg-[#ededed] text-[#161616] hover:bg-white h-9 text-sm font-medium transition-all duration-200 px-6">Purchase seats</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
