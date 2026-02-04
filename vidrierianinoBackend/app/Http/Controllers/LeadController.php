<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use App\Services\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    protected $leadService;

    public function __construct(LeadService $leadService)
    {
        $this->leadService = $leadService;
    }

    /**
     * Store a newly created lead in storage.
     */
    public function store(StoreLeadRequest $request): JsonResponse
    {
        $lead = $this->leadService->createLead($request->validated());

        return response()->json([
            'message' => 'Lead created successfully',
            'data' => new LeadResource($lead),
        ], 201);
    }

    /**
     * Display a listing of the leads.
     */
    public function index(): JsonResponse
    {
        // Simple pagination for now
        $leads = Lead::latest()->paginate(20);
        return LeadResource::collection($leads)->response();
    }

    /**
     * Update the specified lead status.
     */
    public function updateStatus(Request $request, Lead $lead): JsonResponse
    {
        $request->validate([
            'status' => 'required|string'
        ]);

        $updatedLead = $this->leadService->updateStatus($lead, $request->input('status'));

        return response()->json([
            'message' => 'Status updated successfully',
            'data' => new LeadResource($updatedLead),
        ]);
    }
}
