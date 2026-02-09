<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'location' => $this->location,
            'project_type' => $this->project_type,
            'is_local' => $this->is_local,
            'status' => $this->status,

            // Appointment
            'appointment_at' => $this->appointment_at?->toIso8601String(),
            'appointment_type' => $this->appointment_type,
            'address_details' => $this->address_details,

            // Quote
            'quote_sent_at' => $this->quote_sent_at?->toIso8601String(),
            'quote_amount' => $this->quote_amount,
            'payment_advance' => $this->payment_advance,
            'days_in_quoted' => $this->daysInQuotedStatus(),

            // Installation & Warranty
            'installed_at' => $this->installed_at?->toIso8601String(),
            'warranty_ends_at' => $this->warranty_ends_at?->toIso8601String(),
            'warranty_next_check' => $this->warranty_next_check?->toIso8601String(),
            'warranty_days_remaining' => $this->warrantyDaysRemaining(),

            // Rejection
            'rejection_reason' => $this->rejection_reason,

            // Timestamps
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),

            // Relationships (only when loaded)
            'notes' => $this->whenLoaded('notes', fn() => $this->notes->map(fn($note) => [
                'id' => $note->id,
                'content' => $note->content,
                'created_at' => $note->created_at->toIso8601String(),
            ])),

            'photos' => $this->whenLoaded('photos', fn() => $this->photos->map(fn($photo) => [
                'id' => $photo->id,
                'firebase_url' => $photo->firebase_url,
                'stage' => $photo->stage,
                'comment' => $photo->comment,
                'created_at' => $photo->created_at->toIso8601String(),
            ])),

            'status_history' => $this->whenLoaded('statusHistories', fn() => $this->statusHistories->map(fn($history) => [
                'id' => $history->id,
                'from_status' => $history->from_status,
                'to_status' => $history->to_status,
                'user_name' => $history->user?->name ?? 'Sistema',
                'created_at' => $history->created_at->toIso8601String(),
            ])),

            'appointment_history' => $this->whenLoaded('appointmentHistories', fn() => $this->appointmentHistories->map(fn($history) => [
                'id' => $history->id,
                'type' => $history->type,
                'appointment_at' => $history->appointment_at->toIso8601String(),
                'appointment_type' => $history->appointment_type,
                'reason' => $history->reason,
                'user_name' => $history->user?->name ?? 'Sistema',
                'created_at' => $history->created_at->toIso8601String(),
            ])),
        ];
    }
}
