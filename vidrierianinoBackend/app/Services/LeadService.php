<?php

namespace App\Services;

use App\Models\Lead;
use Illuminate\Support\Facades\Log;

class LeadService
{
    /**
     * Create a new lead and trigger initial notifications.
     */
    public function createLead(array $data): Lead
    {
        // Calculate is_local based on location
        // User requirements: true if "Montero", false otherwise.
        $data['is_local'] = isset($data['location']) && $data['location'] === 'Montero';

        // Default status is new
        $data['status'] = Lead::STATUS_NEW;

        $lead = Lead::create($data);

        $this->sendNewLeadNotification($lead);

        return $lead;
    }

    /**
     * Handle status updates and trigger subsequent notifications.
     */
    public function updateStatus(Lead $lead, string $status): Lead
    {
        $oldStatus = $lead->status;
        $lead->update(['status' => $status]);

        if ($oldStatus !== $status) {
            $this->handleStatusChange($lead, $status);
        }

        return $lead;
    }

    /**
     * Placeholder for sending notifications.
     */
    protected function sendNewLeadNotification(Lead $lead): void
    {
        // TODO: Implement actual Email/WhatsApp logic here.
        // For now, we log to verify functionality during dev.
        $type = $lead->is_local ? 'LOCAL' : 'REMOTE';
        Log::info("NEW LEAD [$type]: {$lead->name} - {$lead->phone}");
    }

    protected function handleStatusChange(Lead $lead, string $status): void
    {
        if ($status === Lead::STATUS_VIDEO_CALL_SCHEDULED && !$lead->is_local) {
            Log::info("Scheduling Video Call for: {$lead->email}");
            // TODO: Send email with video call instructions
        }

        if ($status === Lead::STATUS_VISIT_SCHEDULED && $lead->is_local) {
            Log::info("Scheduling Technical Visit for: {$lead->email}");
            // TODO: Send email with visit instructions
        }
    }
}
