<?php

namespace App\Services;

use App\Models\Lead;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send welcome email to new lead (STEP 2)
     */
    public function sendWelcomeEmail(Lead $lead): void
    {
        try {
            $data = [
                'name' => $lead->name,
                'project_type' => $lead->project_type,
            ];

            // Simple email view (you'll need to create this)
            Mail::send('emails.lead-welcome', $data, function ($message) use ($lead) {
                $message->to($lead->email, $lead->name)
                    ->subject('Gracias por contactar a Vidriería Niño');
            });

            Log::info("Welcome email sent to lead #{$lead->id}");
        } catch (\Exception $e) {
            Log::error("Failed to send welcome email: " . $e->getMessage());
        }
    }

    /**
     * Notify admin of new lead
     */
    public function notifyAdminNewLead(Lead $lead): void
    {
        $type = $lead->is_local ? 'LOCAL' : 'REMOTO';
        Log::info("🎯 NUEVO LEAD {$type}: {$lead->name} - {$lead->phone} - {$lead->project_type}");

        // TODO: Send notification to admin email/WhatsApp
    }

    /**
     * Send appointment confirmation (STEP 5)
     */
    public function sendAppointmentConfirmation(Lead $lead): void
    {
        if (!$lead->appointment_at) {
            return;
        }

        try {
            $data = [
                'name' => $lead->name,
                'date' => $lead->appointment_at->format('d/m/Y'),
                'time' => $lead->appointment_at->format('H:i'),
                'type' => $lead->appointment_type === 'visita' ? 'visita técnica' : 'videollamada',
            ];

            Mail::send('emails.appointment-confirmation', $data, function ($message) use ($lead) {
                $message->to($lead->email, $lead->name)
                    ->subject('Confirmación de Cita - Vidriería Niño');
            });

            Log::info("Appointment confirmation sent to lead #{$lead->id}");
        } catch (\Exception $e) {
            Log::error("Failed to send appointment email: " . $e->getMessage());
        }
    }

    /**
     * Generate WhatsApp link with pre-filled message
     */
    public function generateWhatsAppLink(Lead $lead, string $messageTemplate): string
    {
        $phone = $this->normalizePhone($lead->phone);

        $message = str_replace([
            '{name}',
            '{project_type}',
            '{appointment_date}',
            '{quote_amount}',
        ], [
            $lead->name,
            $lead->project_type,
            $lead->appointment_at?->format('d/m/Y H:i') ?? 'pendiente',
            'Bs. ' . number_format($lead->quote_amount ?? 0, 2),
        ], $messageTemplate);

        $encodedMessage = urlencode($message);

        return "https://wa.me/{$phone}?text={$encodedMessage}";
    }

    /**
     * Normalize Bolivian phone number for WhatsApp
     */
    private function normalizePhone(string $phone): string
    {
        // Remove spaces, dashes, parentheses
        $clean = preg_replace('/[^0-9]/', '', $phone);

        // Add 591 (Bolivia) if not present
        if (!str_starts_with($clean, '591')) {
            $clean = '591' . $clean;
        }

        return $clean;
    }

    /**
     * Get pre-defined message templates
     */
    /**
     * Get pre-defined message templates
     */
    public function getMessageTemplate(\App\Models\Lead $lead, string $type): string
    {
        $firstName = explode(' ', $lead->name)[0]; // Use first name for friendlier tone

        return match ($type) {
            'hello' => $this->getWelcomeMessage($lead, $firstName),

            'appointment_reminder' => "Hola {$firstName}, te escribe de Vidriería Niño. Tenemos agendada una " . ($lead->appointment_type == 'visita' ? 'visita técnica' : 'videollamada') . " para el {$lead->appointment_at?->format('d/m/Y H:i')}. ¿Nos confirma su recepción?",

            'quote_sent' => "Hola {$firstName}, ya le envié su cotización detallada. ¿Pudo revisarla? Estaré atento a cualquier duda.",

            'visit_coordination' => "Hola {$firstName}, para su proyecto en {$lead->location}, necesitamos coordinar una visita técnica para tomar medidas exactas. ¿Le queda mejor hoy o mañana?",

            default => "Hola {$firstName}, le saludamos de Vidriería Niño. ¿En qué podemos ayudarle hoy?"
        };
    }

    private function getWelcomeMessage(\App\Models\Lead $lead, string $name): string
    {
        $base = "Hola {$name}, muchas gracias por contactar a Vidriería Niño. 🛠️\n";
        $base .= "Vemos que le interesa un proyecto de *{$lead->project_type}*.\n\n";

        if ($lead->is_local) {
            // Local: Montero
            $base .= "📍 Como se encuentra en Montero, para darle un precio exacto lo ideal es realizar una **visita técnica gratuita** para tomar medidas y ver detalles.\n\n";
            $base .= "🗓️ ¿Le quedaría bien que pasemos **hoy** o **mañana**? ¿A qué hora prefiere?";
        } else {
            // Remote
            $base .= "📍 Como su proyecto es en {$lead->location}, el primer paso es una breve **videollamada** para que nos muestre el área y conversemos los detalles.\n\n";
            $base .= "📱 ¿Tiene tiempo **hoy** o prefiere agendar para **mañana**?";
        }

        return $base;
    }
}
