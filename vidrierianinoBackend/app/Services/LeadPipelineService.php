<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadStatusHistory;
use App\Models\LeadAppointmentHistory;
use App\Models\LeadNote;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LeadPipelineService
{
    public function __construct(
        private NotificationService $notificationService
    ) {
    }

    /**
     * Change lead status and log history
     */
    public function changeStatus(Lead $lead, string $newStatus, ?string $note = null): Lead
    {
        $oldStatus = $lead->status;

        if ($oldStatus === $newStatus) {
            return $lead;
        }

        // Update status
        $lead->update(['status' => $newStatus]);

        // Log to history
        LeadStatusHistory::create([
            'lead_id' => $lead->id,
            'from_status' => $oldStatus,
            'to_status' => $newStatus,
            'user_id' => Auth::id(),
        ]);

        // Add note if provided
        if ($note) {
            $this->addNote($lead, $note);
        }

        // Trigger side effects
        $this->handleStatusChange($lead, $oldStatus, $newStatus);

        return $lead->fresh();
    }

    /**
     * Schedule appointment
     */
    public function scheduleAppointment(Lead $lead, array $data): Lead
    {
        $lead->update([
            'appointment_at' => $data['appointment_at'],
            'appointment_type' => $data['appointment_type'],
            'address_details' => $data['address_details'] ?? null,
            'status' => Lead::STATUS_APPOINTMENT_SCHEDULED,
        ]);

        // Log history details
        LeadAppointmentHistory::create([
            'lead_id' => $lead->id,
            'user_id' => Auth::id(),
            'type' => 'scheduled',
            'appointment_at' => $data['appointment_at'],
            'appointment_type' => $data['appointment_type'],
        ]);

        // Log status change
        $this->changeStatus(
            $lead,
            Lead::STATUS_APPOINTMENT_SCHEDULED,
            "Cita agendada: {$data['appointment_at']->format('d/m/Y H:i')} ({$data['appointment_type']})"
        );

        return $lead->fresh();
    }

    /**
     * Cancel appointment
     */
    public function cancelAppointment(Lead $lead, string $reason): Lead
    {
        $oldDate = $lead->appointment_at;

        // Log history BEFORE clearing data
        if ($oldDate) {
            LeadAppointmentHistory::create([
                'lead_id' => $lead->id,
                'user_id' => Auth::id(),
                'type' => 'cancelled',
                'appointment_at' => $oldDate,
                'appointment_type' => $lead->appointment_type,
                'reason' => $reason
            ]);
        }

        $lead->update([
            'appointment_at' => null,
            'appointment_type' => null,
            // Keep address just in case
            'status' => Lead::STATUS_CONTACTED, // Revert to contacted
        ]);

        $dateStr = $oldDate ? $oldDate->format('d/m/Y H:i') : 'Desconocida';

        $this->changeStatus(
            $lead,
            Lead::STATUS_CONTACTED,
            "Cita cancelada por: $reason (Era: $dateStr)"
        );

        return $lead->fresh();
    }

    /**
     * Mark visit as done
     */
    public function markVisitDone(Lead $lead, ?string $note = null): Lead
    {
        return $this->changeStatus($lead, Lead::STATUS_VISIT_DONE, $note);
    }

    /**
     * Send quote
     */
    public function sendQuote(Lead $lead, float $amount, ?string $note = null, $attachment = null): Lead
    {
        $lead->update([
            'quote_sent_at' => now(),
            'quote_amount' => $amount,
            'status' => Lead::STATUS_QUOTED,
        ]);

        if ($attachment) {
            // Store assignment
            $path = $attachment->store('quotes', 'public');
            // Ideally create a record in LeadDocument or LeadPhoto
            // For now, append to note
            $note .= " [Archivo adjunto: $path]";

            // TODO: Pass attachment to notificationService->sendQuoteEmail
        }

        $this->changeStatus(
            $lead,
            Lead::STATUS_QUOTED,
            $note ?? "Presupuesto enviado: Bs. " . number_format($amount, 2)
        );

        return $lead->fresh();
    }

    /**
     * Approve project
     */
    public function approveProject(Lead $lead, float $advance, ?string $deliveryNote = null): Lead
    {
        $lead->update([
            'payment_advance' => $advance,
            'status' => Lead::STATUS_APPROVED,
        ]);

        $this->changeStatus(
            $lead,
            Lead::STATUS_APPROVED,
            $deliveryNote ?? "Proyecto aprobado. Señal: Bs. " . number_format($advance, 2)
        );

        return $lead->fresh();
    }

    /**
     * Reject project
     */
    public function rejectProject(Lead $lead, string $reason): Lead
    {
        $lead->update([
            'rejection_reason' => $reason,
            'status' => Lead::STATUS_REJECTED,
        ]);

        $this->changeStatus($lead, Lead::STATUS_REJECTED, "Rechazado: $reason");

        return $lead->fresh();
    }

    /**
     * Mark as installed
     */
    public function markInstalled(Lead $lead, Carbon $installedAt, ?string $note = null): Lead
    {
        $warrantyEnds = $installedAt->copy()->addDays(365);
        $nextCheck = $installedAt->copy()->addDays(85);

        $lead->update([
            'installed_at' => $installedAt,
            'warranty_ends_at' => $warrantyEnds,
            'warranty_next_check' => $nextCheck,
            'status' => Lead::STATUS_INSTALLED,
        ]);

        $this->changeStatus(
            $lead,
            Lead::STATUS_INSTALLED,
            $note ?? "Instalado el {$installedAt->format('d/m/Y')}"
        );

        return $lead->fresh();
    }

    /**
     * Add note to lead
     */
    public function addNote(Lead $lead, string $content): LeadNote
    {
        return LeadNote::create([
            'lead_id' => $lead->id,
            'content' => $content,
        ]);
    }

    /**
     * Handle automatic transitions and notifications
     */
    private function handleStatusChange(Lead $lead, string $oldStatus, string $newStatus): void
    {
        // STEP 1-2: New lead -> Send welcome notification
        if ($newStatus === Lead::STATUS_NEW) {
            $this->notificationService->sendWelcomeEmail($lead);
            $this->notificationService->notifyAdminNewLead($lead);
        }

        // STEP 5: Appointment scheduled -> Send confirmation
        if ($newStatus === Lead::STATUS_APPOINTMENT_SCHEDULED) {
            $this->notificationService->sendAppointmentConfirmation($lead);
        }

        // STEP 7: Quote sent -> Log for follow-up
        if ($newStatus === Lead::STATUS_QUOTED) {
            Log::info("Lead #{$lead->id} quoted at Bs. {$lead->quote_amount}");
        }

        // STEP 9: Installed -> Activate warranty
        if ($newStatus === Lead::STATUS_INSTALLED) {
            $this->changeStatus(
                $lead,
                Lead::STATUS_WARRANTY_ACTIVE,
                "Garantía activada hasta {$lead->warranty_ends_at->format('d/m/Y')}"
            );
        }
    }

    /**
     * Auto-transition to no_answer if 24h passed
     */
    public function checkStaleNewLeads(): int
    {
        $threshold = now()->subHours(24);
        $count = 0;

        $staleLeads = Lead::where('status', Lead::STATUS_NEW)
            ->where('created_at', '<', $threshold)
            ->get();

        foreach ($staleLeads as $lead) {
            $this->changeStatus(
                $lead,
                Lead::STATUS_NO_ANSWER,
                'Auto: Sin respuesta después de 24h'
            );
            $count++;
        }

        return $count;
    }
}
