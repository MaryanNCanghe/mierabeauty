"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { currencyForCountry, symbolForCurrency } from "@/lib/countryCurrency";

type Profile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  updated_at?: string | null;
};

type Order = {
  id: string;
  subtotal_cents: number;
  status: string | null;
  created_at: string;
};

type Draft = {
  full_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
};

const emptyDraft = (): Draft => ({
  full_name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  postal_code: "",
  country: "",
  phone: "",
});

const profileToDraft = (p: Profile): Draft => ({
  full_name: p.full_name ?? "",
  address_line1: p.address_line1 ?? "",
  address_line2: p.address_line2 ?? "",
  city: p.city ?? "",
  postal_code: p.postal_code ?? "",
  country: p.country ?? "",
  phone: p.phone ?? "",
});

const hasInfo = (p: Profile | null) =>
  !!p &&
  !!(
    p.full_name ||
    p.address_line1 ||
    p.city ||
    p.postal_code ||
    p.country ||
    p.phone
  );

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);

        const { data: userData } = await supabaseClient.auth.getUser();
        const user = userData.user;
        if (!active) return;

        setAuthEmail(user?.email ?? null);
        setUserId(user?.id ?? null);

        if (!user?.id) {
          setProfile(null);
          setOrders([]);
          return;
        }

        const { data: profData } = await supabaseClient
          .from("profiles")
          .select(
            "user_id,email,full_name,address_line1,address_line2,city,postal_code,country,phone,updated_at"
          )
          .eq("user_id", user.id)
          .maybeSingle<Profile>();

        if (active) {
          setProfile(profData ?? null);
          if (profData) {
            setDraft(profileToDraft(profData));
            // has existing info → start in read-only; user clicks "Edit" to change
            setEditing(!hasInfo(profData));
          } else {
            // brand-new user: open the form immediately
            setEditing(true);
          }
        }

        const { data: ordersData } = await supabaseClient
          .from("orders")
          .select("id,subtotal_cents,status,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .returns<Order[]>();

        if (active) setOrders(ordersData ?? []);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setSaveError(null);

    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .upsert({
          user_id: userId,
          email: authEmail,
          full_name: draft.full_name || null,
          address_line1: draft.address_line1 || null,
          address_line2: draft.address_line2 || null,
          city: draft.city || null,
          postal_code: draft.postal_code || null,
          country: draft.country.toUpperCase().slice(0, 2) || null,
          phone: draft.phone || null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const saved = data as Profile;
      setProfile(saved);
      setDraft(profileToDraft(saved));
      setEditing(false);
    } catch (e: any) {
      setSaveError(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(profile ? profileToDraft(profile) : emptyDraft());
    setSaveError(null);
    setEditing(false);
  };

  const field = (
    id: string,
    label: string,
    key: keyof Draft,
    opts?: { type?: string; placeholder?: string; maxLength?: number }
  ) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={opts?.type ?? "text"}
        value={draft[key]}
        readOnly={!editing}
        maxLength={opts?.maxLength}
        placeholder={editing ? (opts?.placeholder ?? "") : undefined}
        onChange={(e) => {
          let v = e.target.value;
          if (key === "country") v = v.toUpperCase().slice(0, 2);
          setDraft((d) => ({ ...d, [key]: v }));
        }}
        className={`p-2 border rounded transition-colors ${
          editing
            ? "bg-white focus:outline-none focus:ring-2 focus:ring-black"
            : "bg-gray-100 text-gray-700"
        }`}
      />
    </div>
  );

  if (loading) return <div className="p-8">Loading…</div>;

  if (!authEmail) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] px-4">
        <div className="max-w-lg w-full bg-white border rounded-md p-8 text-center">
          <h1 className="text-2xl z-title-md mb-4">Profile</h1>
          <p className="z-label text-gray-600 mb-6">
            You need to sign in to view your profile and orders.
          </p>
          <Link href="/login" className="z-btn z-btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-24 px-6 py-20">
      {/* ── Profile ── */}
      <div className="w-full md:w-1/2">
        <h1 className="text-2xl z-title-md font-semibold mb-6">
          Profile Information
        </h1>

        {saveError && (
          <p className="text-red-600 text-sm mb-4">{saveError}</p>
        )}

        {profile?.updated_at && !editing && (
          <p className="text-xs text-gray-500 mb-4">
            Last updated: {new Date(profile.updated_at).toLocaleString()}
          </p>
        )}

        <div className="flex flex-col gap-4 max-w-md">
          {/* Email is always read-only — changing it requires auth flow */}
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-email" className="text-sm text-gray-700">
              E-mail
            </label>
            <input
              id="profile-email"
              type="email"
              value={authEmail}
              readOnly
              className="p-2 border rounded bg-gray-100 text-gray-700"
            />
          </div>

          {field("profile-name", "Full name", "full_name", {
            placeholder: "Your full name",
          })}

          <h2 className="text-base font-medium mt-2">Shipping information</h2>

          {field("profile-address1", "Address", "address_line1", {
            placeholder: "Street address",
          })}
          {field("profile-address2", "Address 2", "address_line2", {
            placeholder: "Apartment, floor, etc. (optional)",
          })}
          {field("profile-city", "City", "city", { placeholder: "City" })}
          {field("profile-postal", "Postal Code", "postal_code", {
            placeholder: "1234-567",
          })}
          <div className="flex flex-col gap-1">
            <label htmlFor="profile-country" className="text-sm text-gray-700 flex items-center gap-2">
              Country (ISO code)
              {draft.country.length === 2 && (
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {currencyForCountry(draft.country).toUpperCase()}{" "}
                  {symbolForCurrency(currencyForCountry(draft.country))}
                </span>
              )}
            </label>
            <input
              id="profile-country"
              type="text"
              value={draft.country}
              readOnly={!editing}
              maxLength={2}
              placeholder={editing ? "PT" : undefined}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  country: e.target.value.toUpperCase().slice(0, 2),
                }))
              }
              className={`p-2 border rounded transition-colors ${
                editing
                  ? "bg-white focus:outline-none focus:ring-2 focus:ring-black"
                  : "bg-gray-100 text-gray-700"
              }`}
            />
          </div>
          {field("profile-phone", "Phone", "phone", {
            type: "tel",
            placeholder: "+351 912 345 678",
          })}
        </div>

        <div className="flex justify-end mt-6 max-w-md">
          {editing ? (
            <div className="flex gap-2">
              {hasInfo(profile) && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="z-btn text-sm border border-gray-300 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="z-btn z-btn-primary text-sm px-3 py-1"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="z-btn z-btn-primary text-sm px-3 py-1"
            >
              Edit Information
            </button>
          )}
        </div>
      </div>

      {/* ── Orders ── */}
      <div className="w-full md:w-1/2">
        <h1 className="text-2xl z-title-md font-semibold mb-6">Orders</h1>

        <div className="flex flex-col">
          {orders.length === 0 ? (
            <p className="text-gray-500 z-label">You have no orders yet.</p>
          ) : (
            orders.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex justify-between gap-2 p-4 border-b hover:bg-gray-50"
              >
                <span className="w-1/4 truncate text-sm">#{o.id.slice(0, 8)}</span>
                <span className="w-1/4 text-sm">
                  {(o.subtotal_cents / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
                <span className="w-1/4 text-sm capitalize">{o.status ?? "—"}</span>
                <span className="w-1/4 text-right text-sm">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
