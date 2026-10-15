"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";

export default function SellerPricingPage() {
  const plans = [
    {
      name: "Starter Seller",
      price: "$4",
      period: "/month",
      description: "Perfect for independent makers starting their journey.",
      features: [
        "Up to 50 active products",
        "Basic stock analytics",
        "Atomic concurrency safety",
        "Standard fulfillment tracker",
        "Community support",
      ],
      popular: false,
    },
    {
      name: "Professional Merchant",
      price: "$19",
      period: "/month",
      description: "For scaling brands requiring real-time inventory management.",
      features: [
        "Unlimited product catalog",
        "Advanced inventory telemetry",
        "Strict Idempotency layer",
        "Automated cancellation rollback",
        "Priority stock sync",
        "24/7 dedicated support",
      ],
      popular: true,
    },
    {
      name: "Enterprise Fleet",
      price: "$79",
      period: "/month",
      description: "For high-volume merchants with distributed warehouses.",
      features: [
        "Multi-region MongoDB cluster",
        "Custom webhooks & REST API",
        "SLA 99.99% zero-oversell guarantee",
        "Dedicated account architect",
        "Custom ERP integrations",
      ],
      popular: false,
    },
  ];

  return (
    <div className="py-12 space-y-12 max-w-6xl mx-auto pb-20">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Transparent Merchant Pricing
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Scale Your E-Commerce Operations
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          Choose a plan engineered with high-concurrency order protection and real-time inventory management.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-6 rounded-3xl bg-white flex flex-col justify-between transition-all duration-300 relative shadow-xs ${
              plan.popular
                ? "border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                : "border border-slate-200 hover:border-emerald-300 hover:shadow-md"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
              </div>

              <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs font-medium">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/signup"
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  plan.popular
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200"
                }`}
              >
                Get Started
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
