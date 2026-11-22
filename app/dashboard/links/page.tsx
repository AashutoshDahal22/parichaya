"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  GripVertical,
  Link2,
  Plus,
  Save,
  Trash2,
  X,
  Globe,
  Pencil,
} from "lucide-react";

import {
  FaInstagram,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
  FaXTwitter,
  FaTiktok,
  FaGlobe,
} from "react-icons/fa6";

import type { IconType } from "react-icons";

type Service =
  | "Instagram"
  | "GitHub"
  | "LinkedIn"
  | "YouTube"
  | "Facebook"
  | "X"
  | "TikTok"
  | "Website"
  | "Custom Link";

type LinkItem = {
  id: number;
  service: Service;
  title: string;
  url: string;
  enabled: boolean;
};

const services: {
  name: Service;
  icon: IconType;
}[] = [
  { name: "Instagram", icon: FaInstagram },
  { name: "GitHub", icon: FaGithub },
  { name: "LinkedIn", icon: FaLinkedin },
  { name: "YouTube", icon: FaYoutube },
  { name: "Facebook", icon: FaFacebook },
  { name: "X", icon: FaXTwitter },
  { name: "TikTok", icon: FaTiktok },
  { name: "Website", icon: FaGlobe },
  { name: "Custom Link", icon: Globe },
];

const initialLinks: LinkItem[] = [
  {
    id: 1,
    service: "GitHub",
    title: "GitHub",
    url: "https://github.com/yourname",
    enabled: true,
  },
  {
    id: 2,
    service: "LinkedIn",
    title: "LinkedIn",
    url: "https://linkedin.com/in/yourname",
    enabled: true,
  },
  {
    id: 3,
    service: "Instagram",
    title: "Instagram",
    url: "https://instagram.com/yourname",
    enabled: true,
  },
  {
    id: 4,
    service: "Website",
    title: "My Portfolio",
    url: "https://yourportfolio.com",
    enabled: false,
  },
];

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);

  const [selectedService, setSelectedService] = useState<Service>("Instagram");

  const [newTitle, setNewTitle] = useState("Instagram");
  const [newUrl, setNewUrl] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const [editForm, setEditForm] = useState({
    title: "",
    url: "",
  });

  const getServiceIcon = (service: Service) => {
    return services.find((item) => item.name === service)?.icon ?? Globe;
  };

  const handleServiceChange = (service: Service) => {
    setSelectedService(service);
    setNewTitle(service === "Custom Link" ? "" : service);
  };

  const addLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    const formattedUrl = /^https?:\/\//i.test(newUrl.trim())
      ? newUrl.trim()
      : `https://${newUrl.trim()}`;

    const newLink: LinkItem = {
      id: Date.now(),
      service: selectedService,
      title: newTitle.trim(),
      url: formattedUrl,
      enabled: true,
    };

    setLinks((current) => [...current, newLink]);
    setNewTitle(selectedService === "Custom Link" ? "" : selectedService);
    setNewUrl("");
  };

  const deleteLink = (id: number) => {
    setLinks((current) => current.filter((link) => link.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const toggleLink = (id: number) => {
    setLinks((current) =>
      current.map((link) =>
        link.id === id ? { ...link, enabled: !link.enabled } : link,
      ),
    );
  };

  const startEditing = (link: LinkItem) => {
    setEditingId(link.id);
    setEditForm({
      title: link.title,
      url: link.url,
    });
  };

  const saveEdit = (id: number) => {
    if (!editForm.title.trim() || !editForm.url.trim()) return;

    const formattedUrl = /^https?:\/\//i.test(editForm.url.trim())
      ? editForm.url.trim()
      : `https://${editForm.url.trim()}`;

    setLinks((current) =>
      current.map((link) =>
        link.id === id
          ? {
              ...link,
              title: editForm.title.trim(),
              url: formattedUrl,
            }
          : link,
      ),
    );

    setEditingId(null);
  };

  const moveLink = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;

    setLinks((current) => {
      const updated = [...current];

      const fromIndex = updated.findIndex((link) => link.id === draggedId);

      const toIndex = updated.findIndex((link) => link.id === targetId);

      if (fromIndex === -1 || toIndex === -1) return current;

      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);

      return updated;
    });

    setDraggedId(null);
  };

  const handleSave = () => {
    alert("Your links are currently stored in local page state only.");
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">My Links</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Manage all your social and website links in one place.
        </p>
      </div>

      <div className="space-y-6">
        {/* Add link */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="font-semibold">Add a new link</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choose a platform and add your profile or website URL.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="service"
                className="mb-2 block text-sm font-medium"
              >
                Select service
              </label>

              <div className="relative">
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) =>
                    handleServiceChange(e.target.value as Service)
                  }
                  className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900"
                >
                  {services.map((service) => (
                    <option key={service.name} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="link-title"
                className="mb-2 block text-sm font-medium"
              >
                Link title
              </label>
              <input
                id="link-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. My Instagram"
                maxLength={40}
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
              />
            </div>

            <div>
              <label
                htmlFor="link-url"
                className="mb-2 block text-sm font-medium"
              >
                URL
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 px-4 transition focus-within:border-neutral-900">
                <Link2 size={17} className="shrink-0 text-neutral-400" />
                <input
                  id="link-url"
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addLink();
                  }}
                  placeholder="https://example.com/your-profile"
                  className="min-w-0 flex-1 py-3 text-sm outline-none placeholder:text-neutral-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addLink}
              disabled={!newTitle.trim() || !newUrl.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
              Add link
            </button>
          </div>
        </section>

        {/* Existing links */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold">Your links</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Drag and drop to change their order on your public page.
              </p>
            </div>

            <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              {links.length} {links.length === 1 ? "link" : "links"}
            </span>
          </div>

          {links.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <Link2 size={22} className="text-neutral-400" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">No links added yet</h3>
              <p className="mt-2 text-sm text-neutral-500">
                Add your first social or website link above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => {
                const Icon = getServiceIcon(link.service);
                const isEditing = editingId === link.id;

                return (
                  <div
                    key={link.id}
                    draggable={!isEditing}
                    onDragStart={() => setDraggedId(link.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => moveLink(link.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={`rounded-xl border border-neutral-200 transition ${
                      draggedId === link.id ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-4 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">Edit link</h3>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                            aria-label="Cancel editing"
                          >
                            <X size={17} />
                          </button>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium text-neutral-600">
                            Link title
                          </label>
                          <input
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                title: e.target.value,
                              })
                            }
                            maxLength={40}
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium text-neutral-600">
                            URL
                          </label>
                          <input
                            value={editForm.url}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                url: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(link.id)}
                            disabled={
                              !editForm.title.trim() || !editForm.url.trim()
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
                          >
                            <Check size={15} />
                            Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 p-4">
                        <div
                          className="cursor-grab touch-none text-neutral-300 active:cursor-grabbing"
                          title="Drag to reorder"
                        >
                          <GripVertical size={20} />
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-medium">
                              {link.title}
                            </h3>
                            {!link.enabled && (
                              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-neutral-400">
                            {link.url}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleLink(link.id)}
                            aria-label={
                              link.enabled ? "Hide link" : "Show link"
                            }
                            title={link.enabled ? "Hide link" : "Show link"}
                            className={`relative h-6 w-11 rounded-full transition ${
                              link.enabled ? "bg-neutral-900" : "bg-neutral-200"
                            }`}
                          >
                            <span
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                                link.enabled ? "left-6" : "left-1"
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditing(link)}
                            title="Edit link"
                            aria-label="Edit link"
                            className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteLink(link.id)}
                            title="Delete link"
                            aria-label="Delete link"
                            className="rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Public page note */}
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <ArrowUpRight
            size={18}
            className="mt-0.5 shrink-0 text-neutral-500"
          />
          <p className="text-xs leading-5 text-neutral-500">
            Your enabled links will appear on your public profile. Hidden links
            remain in your dashboard but won't be shown to visitors.
          </p>
        </div>

        {/* Save changes */}
        <div className="flex justify-end border-t border-neutral-200 pt-5">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            <Save size={16} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
