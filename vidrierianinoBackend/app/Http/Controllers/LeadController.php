<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadPhoto;
use App\Services\LeadPipelineService;
use App\Services\NotificationService;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Resources\LeadResource;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LeadController extends Controller
{
    public function __construct(
        private LeadPipelineService $pipelineService,
        private NotificationService $notificationService
    ) {
    }

    /**
     * Display all leads with optional filters
     */
    public function index(Request $request)
    {
        $query = Lead::with(['notes', 'photos', 'statusHistories'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by is_local
        if ($request->has('is_local')) {
            $query->where('is_local', $request->boolean('is_local'));
        }

        // Filter by appointment week
        if ($request->boolean('this_week_appointments')) {
            $query->where('status', Lead::STATUS_APPOINTMENT_SCHEDULED)
                ->whereBetween('appointment_at', [now()->startOfWeek(), now()->endOfWeek()]);
        }

        // Filter by warranty active
        if ($request->boolean('warranty_active')) {
            $query->where('status', Lead::STATUS_WARRANTY_ACTIVE);
        }

        $leads = $query->get();

        return LeadResource::collection($leads);
    }

    /**
     * Store new lead (STEP 1)
     */
    public function store(StoreLeadRequest $request)
    {
        $data = $request->validated();

        // Calculate is_local based on location
        $data['is_local'] = $this->isLocalLocation($data['location']);
        $data['status'] = Lead::STATUS_NEW;

        $lead = Lead::create($data);

        // Send notifications (STEP 2)
        $this->notificationService->sendWelcomeEmail($lead);
        $this->notificationService->notifyAdminNewLead($lead);

        return new LeadResource($lead);
    }

    /**
     * Get single lead detail
     */
    public function show(Lead $lead)
    {
        $lead->load(['notes', 'photos', 'statusHistories.user', 'appointmentHistories.user']);
        return new LeadResource($lead);
    }

    /**
     * Update lead status (STEP 3-4)
     */
    public function updateStatus(Request $request, Lead $lead)
    {
        $request->validate([
            'status' => 'required|string',
            'note' => 'nullable|string',
        ]);

        $this->pipelineService->changeStatus($lead, $request->status, $request->note);

        return new LeadResource($lead->fresh());
    }

    /**
     * Schedule appointment (STEP 5)
     */
    public function scheduleAppointment(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'appointment_at' => 'required|date',
            'appointment_type' => 'required|in:visita,videollamada',
            'address_details' => 'nullable|string',
        ]);

        $validated['appointment_at'] = Carbon::parse($validated['appointment_at']);

        $this->pipelineService->scheduleAppointment($lead, $validated);

        return new LeadResource($lead->fresh());
    }

    /**
     * Cancel appointment
     */
    public function cancelAppointment(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        // Logic (ideally in Service, but putting here for now or delegate)
        $this->pipelineService->cancelAppointment($lead, $validated['reason']);

        return new LeadResource($lead->fresh());
    }

    /**
     * Mark visit done (STEP 6)
     */
    public function markVisitDone(Request $request, Lead $lead)
    {
        $request->validate(['note' => 'nullable|string']);

        $this->pipelineService->markVisitDone($lead, $request->note);

        return new LeadResource($lead->fresh());
    }

    /**
     * Send quote (STEP 7)
     */
    public function sendQuote(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5MB
        ]);

        $this->pipelineService->sendQuote(
            $lead,
            $validated['amount'],
            $validated['note'] ?? null,
            $request->file('attachment')
        );

        return new LeadResource($lead->fresh());
    }

    /**
     * Approve project (STEP 8A)
     */
    public function approveProject(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'advance' => 'required|numeric|min:0',
            'note' => 'nullable|string',
        ]);

        $this->pipelineService->approveProject($lead, $validated['advance'], $validated['note'] ?? null);

        return new LeadResource($lead->fresh());
    }

    /**
     * Reject project (STEP 8B)
     */
    public function rejectProject(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $this->pipelineService->rejectProject($lead, $validated['reason']);

        return new LeadResource($lead->fresh());
    }

    /**
     * Mark as installed (STEP 9)
     */
    public function markInstalled(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'installed_at' => 'required|date',
            'note' => 'nullable|string',
        ]);

        $installedAt = Carbon::parse($validated['installed_at']);

        $this->pipelineService->markInstalled($lead, $installedAt, $validated['note'] ?? null);

        return new LeadResource($lead->fresh());
    }

    /**
     * Add note to lead
     */
    public function addNote(Request $request, Lead $lead)
    {
        $request->validate(['content' => 'required|string']);

        $this->pipelineService->addNote($lead, $request->content);

        return new LeadResource($lead->fresh());
    }

    /**
     * Upload photo (Firebase URL)
     */
    public function uploadPhoto(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'firebase_url' => 'required|url',
            'firebase_path' => 'nullable|string',
            'stage' => 'required|in:captura,visita,instalacion,garantia',
            'comment' => 'nullable|string',
        ]);

        $photo = LeadPhoto::create([
            'lead_id' => $lead->id,
            ...$validated
        ]);

        return response()->json(['photo' => $photo], 201);
    }

    /**
     * Get WhatsApp link for lead
     */
    public function getWhatsAppLink(Request $request, Lead $lead)
    {
        $request->validate(['template' => 'required|string']);

        $template = $this->notificationService->getMessageTemplate($lead, $request->template);
        $link = $this->notificationService->generateWhatsAppLink($lead, $template);

        return response()->json(['whatsapp_link' => $link]);
    }

    /**
     * Dashboard stats
     */
    public function getDashboardStats()
    {
        return response()->json([
            'new_today' => Lead::where('status', Lead::STATUS_NEW)->whereDate('created_at', today())->count(),
            'no_answer' => Lead::where('status', Lead::STATUS_NO_ANSWER)->count(),
            'appointments_this_week' => Lead::where('status', Lead::STATUS_APPOINTMENT_SCHEDULED)
                ->whereBetween('appointment_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
            'quoted' => Lead::where('status', Lead::STATUS_QUOTED)->count(),
            'active_projects' => Lead::where('status', Lead::STATUS_APPROVED)->count(),
            'warranties' => Lead::where('status', Lead::STATUS_WARRANTY_ACTIVE)->count(),
        ]);
    }

    /**
     * Helper: Determine if location is local
     */
    private function isLocalLocation(string $location): bool
    {
        $localCities = ['Montero', 'montero', 'MONTERO'];
        return in_array($location, $localCities);
    }
}
