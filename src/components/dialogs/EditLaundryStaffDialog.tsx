import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface LaundryStaff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  hourly_rate?: number;
  availability_days?: string[];
  quality_rating: number;
  notes?: string;
}

interface EditLaundryStaffDialogProps {
  staff: LaundryStaff | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: Partial<LaundryStaff>) => Promise<void>;
}

const DAYS = [
  { key: 'monday', label: 'Mo' },
  { key: 'tuesday', label: 'Di' },
  { key: 'wednesday', label: 'Mi' },
  { key: 'thursday', label: 'Do' },
  { key: 'friday', label: 'Fr' },
  { key: 'saturday', label: 'Sa' },
  { key: 'sunday', label: 'So' },
];

export function EditLaundryStaffDialog({
  staff,
  open,
  onOpenChange,
  onUpdate,
}: EditLaundryStaffDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    hourly_rate: "",
    quality_rating: "",
    is_active: true,
    availability_days: [] as string[],
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || "",
        email: staff.email || "",
        phone: staff.phone || "",
        address: staff.address || "",
        hourly_rate: staff.hourly_rate?.toString() || "",
        quality_rating: staff.quality_rating?.toString() || "0",
        is_active: staff.is_active,
        availability_days: staff.availability_days || [],
        notes: staff.notes || "",
      });
    }
  }, [staff]);

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availability_days: prev.availability_days.includes(day)
        ? prev.availability_days.filter((d) => d !== day)
        : [...prev.availability_days, day],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      await onUpdate({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        quality_rating: parseFloat(formData.quality_rating) || 0,
        is_active: formData.is_active,
        availability_days: formData.availability_days,
        notes: formData.notes.trim() || null,
      } as Partial<LaundryStaff>);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Wäschekraft bearbeiten</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name eingeben"
              className="h-9"
            />
          </div>

          {/* Email & Phone in row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="E-Mail"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Telefon"
                className="h-9"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Adresse"
              className="h-9"
            />
          </div>

          {/* Hourly Rate & Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hourly_rate" className="text-sm">Stundenlohn (€)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                placeholder="0.00"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quality_rating" className="text-sm">Bewertung (0-5)</Label>
              <Input
                id="quality_rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.quality_rating}
                onChange={(e) => setFormData({ ...formData, quality_rating: e.target.value })}
                placeholder="0.0"
                className="h-9"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm">Status</Label>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${!formData.is_active ? 'text-muted-foreground font-medium' : 'text-muted-foreground'}`}>
                Inaktiv
              </span>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <span className={`text-xs ${formData.is_active ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                Aktiv
              </span>
            </div>
          </div>

          {/* Available Days */}
          <div className="space-y-2">
            <Label className="text-sm">Verfügbare Tage</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <label
                  key={day.key}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <Checkbox
                    checked={formData.availability_days.includes(day.key)}
                    onCheckedChange={() => handleDayToggle(day.key)}
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm">Notizen</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optionale Notizen..."
              className="min-h-[60px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !formData.name.trim()}>
            {saving ? "Speichere..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
