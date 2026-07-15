"use client";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Globe, Lock, Bell } from "lucide-react";

const sections = [
  {
    icon: Globe,
    title: "Store Information",
    description: "Basic details about your store",
    fields: [
      { label: "Store Name", value: "RigNova", type: "text" },
      { label: "Store URL", value: "https://rignova.in", type: "url" },
      { label: "Contact Email", value: "hello@rignova.in", type: "email" },
      { label: "Support Phone", value: "+91 98765 43210", type: "tel" },
    ],
  },
  {
    icon: Database,
    title: "Database",
    description: "Database connection status",
    readonly: true,
    fields: [
      { label: "Provider", value: "PostgreSQL 16", type: "text" },
      { label: "ORM", value: "Prisma 7", type: "text" },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your store configuration"
      />

      <div className="max-w-2xl space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-white/8 bg-surface p-5 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/8 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/10">
                <section.icon className="h-4 w-4 text-cyan" />
              </div>
              <div>
                <p className="font-semibold text-sm">{section.title}</p>
                <p className="text-xs text-muted">{section.description}</p>
              </div>
            </div>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <Label className="text-xs text-muted">{field.label}</Label>
                  <Input
                    type={field.type}
                    defaultValue={field.value}
                    readOnly={section.readonly}
                    className={section.readonly ? "opacity-60 cursor-not-allowed" : ""}
                  />
                </div>
              ))}
            </div>
            {!section.readonly && (
              <Button size="sm" variant="secondary">
                Save {section.title}
              </Button>
            )}
          </div>
        ))}

        {/* Quick Links */}
        <div className="rounded-xl border border-white/8 bg-surface p-5 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/8 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue/10">
              <Settings className="h-4 w-4 text-blue" />
            </div>
            <div>
              <p className="font-semibold text-sm">Quick Access</p>
              <p className="text-xs text-muted">Useful admin tools</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Lock, label: "Auth Setup", description: "Better Auth config", color: "text-green" },
              { icon: Bell, label: "Notifications", description: "Email & alerts", color: "text-cyan" },
              { icon: Database, label: "DB Studio", description: "prisma studio", color: "text-blue" },
              { icon: Globe, label: "SEO Settings", description: "Meta & sitemap", color: "text-purple-400" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/8 p-3 hover:border-white/15 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <p className="text-xs text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Version info */}
        <div className="flex items-center justify-between text-xs text-muted px-1">
          <span>RigNova Admin v1.0</span>
          <div className="flex items-center gap-2">
            <Badge variant="success">Next.js 16</Badge>
            <Badge variant="secondary">Prisma 7</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
